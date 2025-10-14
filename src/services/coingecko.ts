import { TokenData, AutocompleteOption, BacktestResult } from '../types/portfolio';

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap_rank?: number;
}

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  fully_diluted_valuation: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply?: number;
  market_cap_rank?: number;
  price_change_percentage_24h?: number;
}

interface CoinGeckoHistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoService {
  private readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private readonly API_KEY = process.env.COINGECKO_API_KEY;
  private readonly SYMBOL_TO_ID: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    USDC: 'usd-coin',
    USDT: 'tether',
  };

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.API_KEY) {
      headers['x-cg-demo-api-key'] = this.API_KEY;
    }
    
    return headers;
  }

  private async resolveCoinId(symbol: string): Promise<string | null> {
    const upper = symbol.toUpperCase();
    if (this.SYMBOL_TO_ID[upper]) return this.SYMBOL_TO_ID[upper];

    try {
      const response = await fetch(
        `${this.BASE_URL}/search?query=${encodeURIComponent(symbol)}`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) return null;
      const data = await response.json();
      const coins: CoinGeckoCoin[] = data.coins || [];
      const match = coins.find(c => c.symbol.toUpperCase() === upper);
      if (match) {
        this.SYMBOL_TO_ID[upper] = match.id;
        return match.id;
      }
      return null;
    } catch {
      return null;
    }
  }

  async searchCoins(query: string, limit: number = 10): Promise<AutocompleteOption[]> {
    try {
      console.log('Searching coins on CoinGecko', { query, limit });
      
      const response = await fetch(
        `${this.BASE_URL}/search?query=${encodeURIComponent(query)}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const coins: CoinGeckoCoin[] = data.coins || [];
      
      return coins.slice(0, limit).map(coin => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        marketCap: 0, // Will be populated by getTokenData
        image: coin.image
      }));
    } catch (error) {
      console.error('Failed to search coins', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query
      });
      return [];
    }
  }

  async getTokenData(symbols: string[]): Promise<TokenData[]> {
    try {
      console.log('Fetching token data from CoinGecko', { symbols });
      
      const symbolsParam = symbols.map(s => s.toLowerCase()).join(',');
      const response = await fetch(
        `${this.BASE_URL}/coins/markets?vs_currency=usd&symbols=${symbolsParam}&order=market_cap_desc&per_page=250&page=1`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const markets: CoinGeckoMarket[] = await response.json();
      
      return markets.map(market => ({
        symbol: market.symbol.toUpperCase(),
        name: market.name,
        price: market.current_price,
        marketCap: market.market_cap,
        fullyDilutedValuation: market.fully_diluted_valuation,
        totalSupply: market.total_supply,
        circulatingSupply: market.circulating_supply,
        volume24h: market.total_volume,
        liquidityScore: market.total_volume / market.market_cap
      }));
    } catch (error) {
      console.error('Failed to fetch token data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        symbols
      });
      throw error;
    }
  }

  async getHistoricalData(symbols: string[], days: number): Promise<{ [symbol: string]: BacktestResult }> {
    try {
      console.log('Fetching historical data from CoinGecko', { symbols, days });
      
      const results: { [symbol: string]: BacktestResult } = {};
      
      for (const symbol of symbols) {
        const coinId = await this.resolveCoinId(symbol);
        if (!coinId) {
          console.warn(`CoinGecko id not found for symbol ${symbol}`);
          continue;
        }
        const response = await fetch(
          `${this.BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
          { headers: this.getHeaders() }
        );
        if (!response.ok) {
          console.warn(`Failed to fetch historical data for ${symbol}`);
          continue;
        }
        const data: CoinGeckoHistoricalData = await response.json();
        const prices = data.prices;
        if (prices.length < 2) continue;
        const startPrice = prices[0][1];
        const endPrice = prices[prices.length - 1][1];
        const returnPercentage = ((endPrice - startPrice) / startPrice) * 100;
        results[symbol.toUpperCase()] = {
          period: days === 30 ? '30d' : days === 90 ? '90d' : '180d',
          portfolioReturn: returnPercentage,
          tokenReturns: { [symbol.toUpperCase()]: returnPercentage }
        };
      }
      
      return results;
    } catch (error) {
      console.error('Failed to fetch historical data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        symbols,
        days
      });
      throw error;
    }
  }

  async getTopCoins(limit: number = 100): Promise<TokenData[]> {
    try {
      console.log('Fetching top coins from CoinGecko', { limit });
      
      const response = await fetch(
        `${this.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const markets: CoinGeckoMarket[] = await response.json();
      
      return markets.map(market => ({
        symbol: market.symbol.toUpperCase(),
        name: market.name,
        price: market.current_price,
        marketCap: market.market_cap,
        fullyDilutedValuation: market.fully_diluted_valuation,
        totalSupply: market.total_supply,
        circulatingSupply: market.circulating_supply,
        volume24h: market.total_volume,
        liquidityScore: market.total_volume / market.market_cap
      }));
    } catch (error) {
      console.error('Failed to fetch top coins', {
        error: error instanceof Error ? error.message : 'Unknown error',
        limit
      });
      throw error;
    }
  }
}
