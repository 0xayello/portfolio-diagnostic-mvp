export interface UnlocksAppRawEvent {
  date?: string | number;
  timestamp?: number;
  t?: number;
  time?: number;
  unlock_date?: string | number;
  amount?: number;
  tokens?: number;
  percentage?: number;
  percent?: number;
  supplyPercent?: number;
  totalSupply?: number;
}

export class UnlocksAppService {
  private readonly CANDIDATE_ENDPOINTS = [
    // candidatos comuns; tentamos em ordem
    (symbol: string) => `https://api.unlocks.app/v4/unlock_events?symbol=${encodeURIComponent(symbol)}`,
    (symbol: string) => `https://api.unlocks.app/v4/events?symbol=${encodeURIComponent(symbol)}`,
    (symbol: string) => `https://unlocks.app/api/v4/unlock_events?symbol=${encodeURIComponent(symbol)}`,
    (symbol: string) => `https://api.tokenomist.ai/unlocks/v4/unlock_events?symbol=${encodeURIComponent(symbol)}`
  ];

  private toISODate(value?: string | number): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number') {
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

  private getAuthHeaders(): HeadersInit {
    const key = (process && process.env && process.env.UNLOCKS_APP_API_KEY) ? String(process.env.UNLOCKS_APP_API_KEY) : '';
    return key ? { 'Authorization': `Bearer ${key}` } : {};
  }

  async getUpcomingUnlocks(symbols: string[], daysWindow: number = 180): Promise<Array<{ token: string; unlockDate: string; percentage: number; amount: number }>> {
    const results: Array<{ token: string; unlockDate: string; percentage: number; amount: number }> = [];

    for (const sym of symbols) {
      const upper = sym.toUpperCase();
      const headers = this.getAuthHeaders();
      for (const build of this.CANDIDATE_ENDPOINTS) {
        try {
          const url = build(upper);
          const resp = await fetch(url, { headers });
          if (!resp.ok) continue;
          const data = await resp.json();
          const items: UnlocksAppRawEvent[] = Array.isArray(data) ? data : (data?.events || data?.data || []);
          for (const raw of items) {
            const iso = this.toISODate(raw.unlock_date ?? raw.date ?? raw.timestamp ?? raw.t ?? raw.time);
            if (!iso) continue;
            if (!this.withinNextNDays(iso, daysWindow)) continue;
            const pct = typeof raw.percentage === 'number' ? raw.percentage
              : typeof raw.percent === 'number' ? raw.percent
              : typeof raw.supplyPercent === 'number' ? raw.supplyPercent
              : (raw.amount && raw.totalSupply ? (raw.amount / raw.totalSupply) * 100 : 0);
            const amt = typeof raw.amount === 'number' ? raw.amount : (typeof raw.tokens === 'number' ? raw.tokens : 0);
            results.push({ token: upper, unlockDate: iso, percentage: pct, amount: amt });
          }
          // se um candidato funcionou, não precisa tentar os demais
          break;
        } catch (_) {
          continue;
        }
      }
    }

    const key = (r: { token: string; unlockDate: string; percentage: number; amount: number }) => `${r.token}|${r.unlockDate}|${r.percentage}|${r.amount}`;
    const deduped = Array.from(new Map(results.map(r => [key(r), r])).values());
    return deduped.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());
  }
}


