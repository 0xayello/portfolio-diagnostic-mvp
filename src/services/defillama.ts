export interface DefiLlamaUnlockRaw {
  // Schema pode variar; tentamos cobrir os campos comuns
  date?: string | number;
  timestamp?: number;
  token?: string;
  symbol?: string;
  chain?: string;
  amount?: number;
  percentage?: number; // % do supply
  totalSupply?: number;
}

export class DefiLlamaService {
  private readonly BASE_URL = 'https://api.llama.fi';
  private readonly VESTING_URL = 'https://vesting-api.llama.fi';

  private toISODate(value?: string | number): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number') {
      // alguns endpoints retornam segundos
      const ms = value < 10_000_000_000 ? value * 1000 : value;
      return new Date(ms).toISOString();
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  private withinNextNDays(isoDate: string, days: number): boolean {
    const target = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = target - now;
    return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
  }

  async getUpcomingUnlocks(symbols: string[], daysWindow: number = 180): Promise<Array<{
    token: string;
    unlockDate: string;
    percentage: number;
    amount: number;
  }>> {
    const results: Array<{ token: string; unlockDate: string; percentage: number; amount: number; }> = [];

    for (const sym of symbols) {
      const upper = sym.toUpperCase();
      try {
        // 1) Tenta endpoint principal
        const primaryUrl = `${this.BASE_URL}/unlocks?symbol=${encodeURIComponent(upper)}`;
        const primaryResp = await fetch(primaryUrl);
        if (primaryResp.ok) {
          const data = await primaryResp.json();
          const items: DefiLlamaUnlockRaw[] = Array.isArray(data) ? data : (data?.unlocks || data?.data || []);
          for (const raw of items) {
            const iso = this.toISODate(raw.date ?? raw.timestamp);
            if (!iso) continue;
            if (!this.withinNextNDays(iso, daysWindow)) continue;
            const pct = typeof raw.percentage === 'number' ? raw.percentage : (raw.amount && raw.totalSupply ? (raw.amount / raw.totalSupply) * 100 : 0);
            const amt = typeof raw.amount === 'number' ? raw.amount : 0;
            results.push({ token: upper, unlockDate: iso, percentage: pct, amount: amt });
          }
        }

        // 2) Fallback: vesting API (alguns tokens, ex: TIA)
        if (!results.some(r => r.token === upper)) {
          const vestingUrl = `${this.VESTING_URL}/vesting/${encodeURIComponent(upper)}`;
          const vestResp = await fetch(vestingUrl);
          if (vestResp.ok) {
            const vdata = await vestResp.json();
            const schedules: any[] = Array.isArray(vdata) ? vdata : (vdata?.schedules || vdata?.data || vdata?.vestings || []);
            for (const item of schedules) {
              const dateVal = item.date ?? item.timestamp ?? item.startTimestamp ?? item.t ?? item.time;
              const iso = this.toISODate(dateVal);
              if (!iso) continue;
              if (!this.withinNextNDays(iso, daysWindow)) continue;
              const pct = typeof item.percentage === 'number'
                ? item.percentage
                : typeof item.pct === 'number'
                  ? item.pct
                  : (item.amount && (item.totalSupply || item.supply))
                    ? (item.amount / (item.totalSupply || item.supply)) * 100
                    : 0;
              const amt = typeof item.amount === 'number' ? item.amount : (typeof item.tokens === 'number' ? item.tokens : 0);
              results.push({ token: upper, unlockDate: iso, percentage: pct, amount: amt });
            }
          }
        }
      } catch (e) {
        console.warn(`DeFiLlama unlocks fetch failed for ${upper}`);
        continue;
      }
    }

    // ordenar por data
    return results.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());
  }
}


