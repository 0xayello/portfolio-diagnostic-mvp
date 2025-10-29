import { UnlockEvent } from '../types/portfolio';

interface CmcMapItem {
  id: number;
  name: string;
  symbol: string;
  slug: string;
}

interface CmcQuotesLatestResponse {
  data: {
    [id: string]: {
      id: number;
      symbol: string;
      name: string;
      total_supply?: number;
      max_supply?: number | null;
      quote?: {
        USD?: {
          price?: number;
          market_cap?: number;
        };
      };
    };
  };
}

interface CmcUnlockRawEvent {
  date?: string;
  amount?: number;
  percentage_of_max_supply?: number;
  usd_value?: number;
}

export class CoinMarketCapService {
  private readonly BASE_URL = 'https://pro-api.coinmarketcap.com';
  private readonly API_KEY = process.env.COINMARKETCAP_API_KEY || process.env.CMC_PRO_API_KEY;
  private readonly UNLOCKS_PATH = process.env.CMC_UNLOCKS_ENDPOINT || '/v1/content/token-unlocks';

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-CMC_PRO_API_KEY': this.API_KEY || '',
    };
  }

  private ensureApiKey() {
    if (!this.API_KEY) {
      throw new Error('Missing CoinMarketCap API key. Set COINMARKETCAP_API_KEY.');
    }
  }

  async getTokenUnlocks(symbol: string): Promise<UnlockEvent[]> {
    this.ensureApiKey();
    const upperSymbol = symbol.toUpperCase();

    try {
      const tokenId = await this.getIdForSymbol(upperSymbol);
      const { priceUsd, maxSupply } = tokenId ? await this.getPriceAndSupply(tokenId) : { priceUsd: undefined, maxSupply: undefined };

      const unlocksUrl = `${this.BASE_URL}${this.UNLOCKS_PATH}?symbol=${encodeURIComponent(upperSymbol)}`;
      const resp = await fetch(unlocksUrl, { headers: this.getHeaders() });

      if (!resp.ok) {
        console.warn('CMC unlocks endpoint returned non-OK', { status: resp.status });
        return [];
      }

      const payload = await resp.json();
      const rawEvents: CmcUnlockRawEvent[] = Array.isArray(payload?.data) ? payload.data : payload?.data?.events || [];

      const events: UnlockEvent[] = rawEvents
        .filter(e => !!e?.date && (!!e.amount || !!e.usd_value))
        .map(e => {
          const amount = e.amount ?? 0;
          const valueUsd = e.usd_value ?? (priceUsd && amount ? amount * priceUsd : 0);
          const percentageOfMaxSupply = e.percentage_of_max_supply ?? (
            maxSupply && amount ? (amount / maxSupply) * 100 : 0
          );
          return {
            date: new Date(e.date as string).toISOString().split('T')[0],
            amount,
            percentageOfMaxSupply,
            valueUsd,
            token: upperSymbol,
          } as UnlockEvent;
        })
        .filter(e => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return events;
    } catch (error) {
      console.error('Failed to fetch unlocks from CoinMarketCap', {
        error: error instanceof Error ? error.message : 'Unknown error',
        symbol,
      });
      return [];
    }
  }

  private async getIdForSymbol(symbol: string): Promise<number | null> {
    try {
      const url = `${this.BASE_URL}/v1/cryptocurrency/map?symbol=${encodeURIComponent(symbol)}`;
      const resp = await fetch(url, { headers: this.getHeaders() });
      if (!resp.ok) return null;
      const data = await resp.json();
      const items: CmcMapItem[] = data?.data || [];
      const found = items.find(i => i.symbol?.toUpperCase() === symbol.toUpperCase());
      return found?.id ?? null;
    } catch {
      return null;
    }
  }

  private async getPriceAndSupply(id: number): Promise<{ priceUsd?: number; maxSupply?: number }> {
    try {
      const url = `${this.BASE_URL}/v2/cryptocurrency/quotes/latest?id=${id}`;
      const resp = await fetch(url, { headers: this.getHeaders() });
      if (!resp.ok) return {};
      const json: CmcQuotesLatestResponse = await resp.json();
      const entry = json?.data?.[String(id)];
      const priceUsd = entry?.quote?.USD?.price;
      const maxSupply = (entry?.max_supply ?? entry?.total_supply) ?? undefined;
      return { priceUsd, maxSupply: typeof maxSupply === 'number' ? maxSupply : undefined };
    } catch {
      return {};
    }
  }
}
