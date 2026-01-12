#!/usr/bin/env python3
"""
Gera um gráfico (PNG) com:
- Eixo X: datas de publicação (out/nov)
- Eixo Y: views

Entrada: data/reels_views_raw.csv (datas em PT-BR tipo "24 out" e views tipo "13,4k" / "16.4k" / "152k")
Saída: outputs/grafico_views_por_data.png
"""

from __future__ import annotations

import argparse
import csv
import os
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable, List, Tuple


MONTHS_PT = {
    "jan": 1,
    "fev": 2,
    "mar": 3,
    "abr": 4,
    "mai": 5,
    "jun": 6,
    "jul": 7,
    "ago": 8,
    "set": 9,
    "out": 10,
    "nov": 11,
    "dez": 12,
}


@dataclass(frozen=True)
class ReelRow:
    episodio: str
    numero: int
    data: date
    views: int


def parse_views(views_br: str) -> int:
    """
    Aceita:
    - "4800"
    - "13,4k" (vírgula decimal)
    - "16.4k" (ponto decimal)
    - "152k"
    """
    s = views_br.strip().lower().replace(" ", "")

    # normaliza separador decimal para ponto
    s = s.replace(",", ".")

    m = re.fullmatch(r"(\d+(?:\.\d+)?)(k)?", s)
    if not m:
        raise ValueError(f"Formato de views inválido: {views_br!r}")

    num = float(m.group(1))
    if m.group(2) == "k":
        num *= 1000

    return int(round(num))


def parse_date_pt_br(d: str, year: int) -> date:
    s = d.strip().lower()
    m = re.fullmatch(r"(\d{1,2})\s+([a-zç]{3})", s)
    if not m:
        raise ValueError(f"Formato de data inválido: {d!r} (esperado: '24 out')")
    day = int(m.group(1))
    mon_key = m.group(2)
    if mon_key not in MONTHS_PT:
        raise ValueError(f"Mês inválido: {mon_key!r} em {d!r}")
    return date(year, MONTHS_PT[mon_key], day)


def read_rows(csv_path: Path, year: int) -> List[ReelRow]:
    rows: List[ReelRow] = []
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            if (r.get("tipo") or "").strip().lower() != "reels":
                continue
            episodio = (r.get("episodio") or "").strip()
            numero = int((r.get("numero") or "0").strip())
            data = parse_date_pt_br((r.get("data_br") or "").strip(), year=year)
            views = parse_views((r.get("views_br") or "").strip())
            rows.append(ReelRow(episodio=episodio, numero=numero, data=data, views=views))

    rows.sort(key=lambda x: (x.data, x.episodio, x.numero))
    return rows


def compute_daily_totals(rows: Iterable[ReelRow]) -> List[Tuple[date, int]]:
    totals: defaultdict[date, int] = defaultdict(int)
    for r in rows:
        totals[r.data] += r.views
    return sorted(totals.items(), key=lambda x: x[0])


def ensure_matplotlib_cache_dir(workspace_root: Path) -> None:
    """
    Evita warnings/erros quando o default (~/.matplotlib) não é gravável no sandbox.
    """
    mpl_config_dir = workspace_root / "outputs" / ".matplotlib"
    mpl_config_dir.mkdir(parents=True, exist_ok=True)

    # Força uso de backend headless (sem necessidade de display)
    os.environ["MPLBACKEND"] = "Agg"

    # Força caches para dentro do workspace (sandbox-friendly)
    os.environ["MPLCONFIGDIR"] = str(mpl_config_dir)
    xdg_cache = workspace_root / "outputs" / ".cache"
    xdg_cache.mkdir(parents=True, exist_ok=True)
    os.environ["XDG_CACHE_HOME"] = str(xdg_cache)


def plot(rows: List[ReelRow], out_path: Path) -> None:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates

    # agrega por dia e por episódio (para barras empilhadas)
    dates_sorted = sorted({r.data for r in rows})
    totals_by_day = dict(compute_daily_totals(rows))

    by_episode_day: dict[str, dict[date, int]] = {}
    for r in rows:
        by_episode_day.setdefault(r.episodio, {})
        by_episode_day[r.episodio][r.data] = by_episode_day[r.episodio].get(r.data, 0) + r.views

    # ordena episódios pelo total (melhor leitura da legenda)
    episode_totals = {
        ep: sum(day_map.values())
        for ep, day_map in by_episode_day.items()
    }
    episodes_sorted = sorted(episode_totals.keys(), key=lambda ep: episode_totals[ep], reverse=True)

    # prepara matriz (episódio x datas)
    values_by_episode: dict[str, List[int]] = {}
    for ep in episodes_sorted:
        day_map = by_episode_day[ep]
        values_by_episode[ep] = [int(day_map.get(d, 0)) for d in dates_sorted]

    x = [mdates.date2num(d) for d in dates_sorted]
    width = 0.8  # dias

    fig, ax = plt.subplots(figsize=(16, 8), dpi=160, constrained_layout=True)
    cmap = plt.get_cmap("tab10")

    bottoms = [0] * len(dates_sorted)
    max_day_total = max(totals_by_day.values()) if totals_by_day else 0
    label_threshold = max(8000, int(max_day_total * 0.06)) if max_day_total else 8000

    for i, ep in enumerate(episodes_sorted):
        vals = values_by_episode[ep]
        color = cmap(i % 10)
        bars = ax.bar(x, vals, width=width, bottom=bottoms, label=ep, color=color, edgecolor="white", linewidth=0.6)

        # escreve o nome do episódio no próprio segmento (quando há espaço)
        for j, (bar, v) in enumerate(zip(bars, vals)):
            if v <= 0:
                continue
            if v >= label_threshold:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bottoms[j] + v / 2,
                    ep,
                    ha="center",
                    va="center",
                    fontsize=8,
                    color="white",
                    rotation=90 if len(ep) > 14 else 0,
                    clip_on=True,
                )

        bottoms = [b + v for b, v in zip(bottoms, vals)]

    ax.set_title("Views por data — barras empilhadas (cor = episódio / convidado)")
    ax.set_xlabel("Data")
    ax.set_ylabel("Views (total/dia)")
    ax.grid(True, axis="y", alpha=0.25)

    ax.xaxis_date()
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    for label in ax.get_xticklabels():
        label.set_rotation(45)
        label.set_ha("right")

    ax.legend(title="Episódio", ncols=2, frameon=True, fontsize=9, title_fontsize=10, loc="upper right")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, default=2024, help="Ano assumido para as datas (ex: 2024)")
    parser.add_argument(
        "--input",
        type=str,
        default="data/reels_views_raw.csv",
        help="Caminho do CSV com os dados",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="outputs/grafico_views_barras_por_data.png",
        help="Caminho do PNG de saída",
    )
    args = parser.parse_args()

    workspace_root = Path(__file__).resolve().parents[1]
    ensure_matplotlib_cache_dir(workspace_root)

    in_path = (workspace_root / args.input).resolve()
    out_path = (workspace_root / args.output).resolve()

    rows = read_rows(in_path, year=args.year)
    if not rows:
        raise SystemExit("Nenhum reel encontrado no CSV.")
    plot(rows, out_path)
    print(f"OK: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


