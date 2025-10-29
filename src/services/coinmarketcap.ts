// Interface interna para eventos de unlock do CoinMarketCap
interface UnlockEvent {
  date: string;
  amount: number;
  percentageOfMaxSupply: number;
  valueUsd: number;
  token: string;
}

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


  /**
   * Busca eventos de unlock para múltiplos símbolos
   * Retorna no formato esperado pelo sistema
   */
  async getUpcomingUnlocks(symbols: string[], daysWindow: number = 180): Promise<Array<{
    token: string;
    unlockDate: string;
    percentage: number;
    amount: number;
  }>> {
    const results: Array<{ token: string; unlockDate: string; percentage: number; amount: number }> = [];

    for (const symbol of symbols) {
      const events = await this.getTokenUnlocks(symbol);
      
      // Filtrar apenas eventos dentro da janela de dias
      const now = Date.now();
      const windowEnd = now + (daysWindow * 24 * 60 * 60 * 1000);
      
      const filteredEvents = events
        .filter(e => {
          const eventTime = new Date(e.date).getTime();
          return eventTime >= now && eventTime <= windowEnd;
        })
        .map(e => ({
          token: e.token,
          unlockDate: e.date,
          percentage: e.percentageOfMaxSupply,
          amount: e.amount,
        }));
      
      results.push(...filteredEvents);
    }

    return results.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());
  }

  /**
   * Busca eventos de unlock para um único token
   * Método interno
   */
  private async getTokenUnlocks(symbol: string): Promise<UnlockEvent[]> {
    // Verifica se tem API key, mas não falha se não tiver (retorna array vazio)
    if (!this.API_KEY) {
      console.warn('⚠️  CoinMarketCap API key not configured');
      return [];
    }

    const upperSymbol = symbol.toUpperCase();

    try {
      console.log(`🔍 Buscando ID do token ${upperSymbol}...`);
      const tokenId = await this.getIdForSymbol(upperSymbol);
      
      if (!tokenId) {
        console.warn(`⚠️  Token ${upperSymbol} não encontrado no CoinMarketCap`);
        return [];
      }

      console.log(`✅ Token encontrado! ID: ${tokenId}`);
      
      const { priceUsd, maxSupply } = await this.getPriceAndSupply(tokenId);
      console.log(`💰 Preço: $${priceUsd?.toFixed(4) || 'N/A'} | Max Supply: ${maxSupply?.toLocaleString() || 'N/A'}`);

      // Tentar endpoint de unlocks
      const unlocksUrl = `${this.BASE_URL}${this.UNLOCKS_PATH}?symbol=${encodeURIComponent(upperSymbol)}`;
      console.log(`📡 Consultando endpoint: ${this.UNLOCKS_PATH}`);
      
      const resp = await fetch(unlocksUrl, { headers: this.getHeaders() });

      if (!resp.ok) {
        const statusText = resp.status === 403 ? 'Endpoint não disponível no seu plano' 
                         : resp.status === 404 ? 'Endpoint não encontrado'
                         : `Status ${resp.status}`;
        console.warn(`❌ CMC unlocks endpoint: ${statusText} (${resp.status})`);
        return [];
      }

      const payload = await resp.json();
      console.log(`📦 Resposta recebida:`, JSON.stringify(payload, null, 2));
      
      // Tentar diferentes formatos de resposta
      let rawEvents: CmcUnlockRawEvent[] = [];
      
      if (Array.isArray(payload)) {
        rawEvents = payload;
      } else if (Array.isArray(payload?.data)) {
        rawEvents = payload.data;
      } else if (Array.isArray(payload?.data?.events)) {
        rawEvents = payload.data.events;
      } else if (payload?.data) {
        // Pode ser um objeto único
        rawEvents = [payload.data];
      }

      console.log(`📊 Eventos encontrados: ${rawEvents.length}`);

      const events: UnlockEvent[] = rawEvents
        .filter(e => {
          const hasDate = !!e?.date;
          const hasAmount = !!(e.amount || e.usd_value);
          return hasDate && hasAmount;
        })
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

      console.log(`✅ Eventos processados: ${events.length} (após filtros)`);
      
      if (events.length > 0) {
        console.log(`📅 Próximo unlock: ${events[0].date} - ${events[0].amount.toLocaleString()} tokens (${events[0].percentageOfMaxSupply.toFixed(2)}%)`);
      }

      return events;
    } catch (error) {
      console.error('❌ Erro ao buscar unlocks do CoinMarketCap:', {
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
