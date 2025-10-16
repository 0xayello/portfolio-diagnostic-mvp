import { 
  PortfolioAllocation, 
  InvestorProfile, 
  DiagnosticFlag, 
  PortfolioDiagnostic, 
  RebalanceSuggestion,
  UnlockAlert,
  TokenData
} from '../types/portfolio';
import { CoinGeckoService } from './coingecko';
import sectorsData from '../data/sectors.json';
import { DefiLlamaService } from './defillama';
import { UnlocksAppService } from './unlocksapp';

export class DiagnosticService {
  private coinGeckoService: CoinGeckoService;
  private defiLlamaService: DefiLlamaService;
  private unlocksAppService: UnlocksAppService;

  constructor() {
    this.coinGeckoService = new CoinGeckoService();
    this.defiLlamaService = new DefiLlamaService();
    this.unlocksAppService = new UnlocksAppService();
  }

  async generateDiagnostic(
    allocation: PortfolioAllocation[], 
    profile: InvestorProfile
  ): Promise<PortfolioDiagnostic> {
    // Buscar dados dos tokens
    const symbols = allocation.map(a => a.token);
    const tokenDataMap = await this.coinGeckoService.getTokenData(symbols);
    
    // Adicionar dados dos tokens à alocação
    const enrichedAllocation = allocation.map(item => ({
      ...item,
      tokenData: tokenDataMap.find(t => t.symbol === item.token)
    }));

    // Calcular setores
    const sectorBreakdown = this.calculateSectorBreakdown(enrichedAllocation);
    
    // Gerar flags
    const flags = this.generateFlags(enrichedAllocation, profile, sectorBreakdown);
    
    // Calcular score de aderência
    const adherenceScore = this.calculateAdherenceScore(flags, profile);
    
    // Gerar sugestões de rebalanceamento
    const rebalanceSuggestions = this.generateRebalanceSuggestions(enrichedAllocation, profile);
    
    // Buscar alertas de unlocks (mock por enquanto)
    const unlockAlerts = await this.getUnlockAlerts(symbols);
    
    // Calcular backtest (agregado) e série normalizada (180d)
    const backtest = await this.calculateBacktest(enrichedAllocation);
    const backtestSeries = await this.calculateBacktestSeries(enrichedAllocation);
    
    // Calcular métricas
    const metrics = this.calculateMetrics(enrichedAllocation, sectorBreakdown);

    return {
      profile,
      allocation: enrichedAllocation,
      adherenceScore,
      adherenceLevel: this.getAdherenceLevel(adherenceScore),
      flags,
      backtest,
      backtestSeries,
      unlockAlerts,
      rebalanceSuggestions,
      sectorBreakdown,
      metrics
    };
  }

  private calculateSectorBreakdown(allocation: (PortfolioAllocation & { tokenData?: TokenData })[]): { [sector: string]: number } {
    const breakdown: { [sector: string]: number } = {};
    
    allocation.forEach(item => {
      const sector = this.getTokenSector(item.token);
      breakdown[sector] = (breakdown[sector] || 0) + item.percentage;
    });
    
    return breakdown;
  }

  private getTokenSector(symbol: string): string {
    const tokenData = sectorsData[symbol as keyof typeof sectorsData];
    return tokenData?.sector || 'Outros';
  }

  private generateFlags(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    profile: InvestorProfile,
    sectorBreakdown: { [sector: string]: number }
  ): DiagnosticFlag[] {
    const flags: DiagnosticFlag[] = [];
    
    // Flags por ativo
    allocation.forEach(item => {
      // ≥20% em ativo que não seja BTC/ETH/SOL/USDC/USDT → Yellow
      if (item.percentage >= 20 && !['BTC', 'ETH', 'SOL', 'USDC', 'USDT'].includes(item.token)) {
        flags.push({
          type: 'yellow',
          category: 'asset',
          message: `${item.token} representa ${item.percentage.toFixed(1)}% da carteira`,
          actionable: 'Considere diversificar mais ou reduzir a exposição',
          severity: 2
        });
      }
      
      // ≥40% em ativo que não seja BTC/ETH/SOL → Red
      if (item.percentage >= 40 && !['BTC', 'ETH', 'SOL'].includes(item.token)) {
        flags.push({
          type: 'red',
          category: 'asset',
          message: `${item.token} representa ${item.percentage.toFixed(1)}% da carteira`,
          actionable: 'Reduza imediatamente a concentração neste ativo',
          severity: 3
        });
      }
      
      // >60% em qualquer único ativo → Red
      if (item.percentage > 60) {
        flags.push({
          type: 'red',
          category: 'asset',
          message: `${item.token} representa ${item.percentage.toFixed(1)}% da carteira`,
          actionable: 'Distribua o risco entre diferentes ativos',
          severity: 4
        });
      }
      
      // FDV/Mcap > 3 → Yellow/Red
      if (item.tokenData?.fullyDilutedValuation && item.tokenData?.marketCap) {
        const fdvMcapRatio = item.tokenData.fullyDilutedValuation / item.tokenData.marketCap;
        if (fdvMcapRatio > 3) {
          const severity = item.percentage >= 20 ? 'red' : 'yellow';
          flags.push({
            type: severity,
            category: 'fdv_mcap',
            message: `${item.token} tem FDV/Mcap de ${fdvMcapRatio.toFixed(2)}x`,
            actionable: 'Considere o impacto de futuros unlocks no preço',
            severity: severity === 'red' ? 3 : 2
          });
        }
      }
      
      // Baixa liquidez
      if (item.tokenData?.liquidityScore && item.tokenData.liquidityScore < 0.01) {
        flags.push({
          type: 'yellow',
          category: 'liquidity',
          message: `${item.token} tem baixa liquidez`,
          actionable: 'Considere a dificuldade de venda em grandes volumes',
          severity: 2
        });
      }
    });
    
    // Flags por setor
    Object.entries(sectorBreakdown).forEach(([sector, percentage]) => {
      if (percentage > 50) {
        const severity = profile.riskTolerance === 'low' ? 'red' : 'yellow';
        flags.push({
          type: severity,
          category: 'sector',
          message: `${percentage.toFixed(1)}% concentrado no setor ${sector}`,
          actionable: 'Diversifique entre diferentes setores',
          severity: severity === 'red' ? 3 : 2
        });
      }
    });
    
    // Flags por perfil - stablecoins
    const stablecoinPercentage = allocation
      .filter(item => ['USDC', 'USDT'].includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance);
    
    if (stablecoinPercentage < expectedStablecoinRange.min || stablecoinPercentage > expectedStablecoinRange.max) {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `${stablecoinPercentage.toFixed(1)}% em stablecoins (esperado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: `Ajuste para ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}% conforme seu perfil`,
        severity: 2
      });
    }
    
    return flags.sort((a, b) => b.severity - a.severity);
  }

  private getExpectedStablecoinRange(riskTolerance: string): { min: number; max: number } {
    switch (riskTolerance) {
      case 'low': return { min: 20, max: 30 };
      case 'medium': return { min: 15, max: 20 };
      case 'high': return { min: 0, max: 15 };
      default: return { min: 15, max: 20 };
    }
  }

  private calculateAdherenceScore(flags: DiagnosticFlag[], profile: InvestorProfile): number {
    let score = 100;
    
    flags.forEach(flag => {
      switch (flag.severity) {
        case 4: score -= 25; break; // Red crítico
        case 3: score -= 15; break; // Red
        case 2: score -= 8; break;  // Yellow
        case 1: score -= 3; break;  // Green
      }
    });
    
    return Math.max(0, score);
  }

  private getAdherenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  private generateRebalanceSuggestions(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    profile: InvestorProfile
  ): RebalanceSuggestion[] {
    const suggestions: RebalanceSuggestion[] = [];
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance);
    const currentStablecoinPercentage = allocation
      .filter(item => ['USDC', 'USDT'].includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    // Ajustar stablecoins
    if (currentStablecoinPercentage < expectedStablecoinRange.min) {
      suggestions.push({
        token: 'USDC',
        currentPercentage: currentStablecoinPercentage,
        suggestedPercentage: expectedStablecoinRange.min,
        reason: 'Aumentar exposição em stablecoins para reduzir risco'
      });
    } else if (currentStablecoinPercentage > expectedStablecoinRange.max) {
      const excessPercentage = currentStablecoinPercentage - expectedStablecoinRange.max;
      suggestions.push({
        token: 'USDC',
        currentPercentage: currentStablecoinPercentage,
        suggestedPercentage: expectedStablecoinRange.max,
        reason: 'Reduzir exposição em stablecoins para aumentar potencial de retorno'
      });
    }
    
    // Reduzir concentrações altas
    allocation.forEach(item => {
      if (item.percentage > 40 && !['BTC', 'ETH'].includes(item.token)) {
        suggestions.push({
          token: item.token,
          currentPercentage: item.percentage,
          suggestedPercentage: Math.min(30, item.percentage),
          reason: 'Reduzir concentração para diminuir risco'
        });
      }
    });
    
    return suggestions;
  }

  private async getUnlockAlerts(symbols: string[]): Promise<UnlockAlert[]> {
    try {
      const unique = Array.from(new Set(symbols.map(s => s.toUpperCase())));

      // 1) provedor primário: UnlocksApp
      const fromUnlocks = await this.unlocksAppService.getUpcomingUnlocks(unique, 180);

      // 2) fallback: DeFiLlama (unlocks + vesting aliases)
      const fromLlama = await this.defiLlamaService.getUpcomingUnlocks(unique, 180);

      // 3) merge + dedupe
      const all = [...fromUnlocks, ...fromLlama];
      const key = (r: { token: string; unlockDate: string; percentage: number; amount: number }) => `${r.token}|${r.unlockDate}|${r.percentage}|${r.amount}`;
      const deduped = Array.from(new Map(all.map(r => [key(r), r])).values());

      return deduped.map(u => ({
        token: u.token,
        unlockDate: u.unlockDate,
        percentage: u.percentage,
        amount: u.amount,
        type: 'token_unlock',
        severity: u.percentage >= 10 ? 'red' : 'yellow',
      }));
    } catch (e) {
      return [];
    }
  }

  private async calculateBacktest(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[]
  ): Promise<any[]> {
    const symbols = Array.from(new Set(allocation.map(a => a.token).map(s => s.toUpperCase())));
    const periods = [30, 90, 180];
    const results = [];
    
    for (const days of periods) {
      try {
        const historicalData = await this.coinGeckoService.getHistoricalData(
          Array.from(new Set([...symbols, 'BTC'])),
          days
        );
        
        let portfolioReturn = 0;
        const tokenReturns: { [token: string]: number } = {};
        
        allocation.forEach(item => {
          const tokenKey = item.token.toUpperCase();
          const tokenData = historicalData[tokenKey];
          if (tokenData) {
            const tokenReturn = tokenData.tokenReturns[tokenKey] || 0;
            portfolioReturn += (tokenReturn * item.percentage) / 100;
            tokenReturns[tokenKey] = tokenReturn;
          }
        });
        
        const btcData = historicalData['BTC'];
        const btcReturn = btcData ? (btcData.tokenReturns['BTC'] || btcData.portfolioReturn) : 0;

        results.push({
          period: days === 30 ? '30d' : days === 90 ? '90d' : '180d',
          portfolioReturn,
          tokenReturns,
          benchmarkReturns: {
            btc: btcReturn
          }
        });
      } catch (error) {
        console.error(`Failed to calculate backtest for ${days} days:`, error);
      }
    }
    
    return results;
  }

  private async calculateBacktestSeries(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[]
  ) {
    const symbols = Array.from(new Set(allocation.map(a => a.token.toUpperCase())));
    const days = 180;
    const seriesMap = await this.coinGeckoService.getHistoricalSeries(Array.from(new Set([...symbols, 'BTC'])), days);

    const btcSeries = seriesMap['BTC'] || [];
    const baseDates = btcSeries.map(p => p.date);

    // construir série de portfolio: combinar preços diários por ativo e alocação
    const priceSeriesByToken: { [date: string]: { [token: string]: number } } = {};
    for (const token of symbols) {
      const s = seriesMap[token] || [];
      for (const point of s) {
        if (!priceSeriesByToken[point.date]) priceSeriesByToken[point.date] = {};
        priceSeriesByToken[point.date][token] = point.price;
      }
    }

    // alinhar por datas do BTC para suavizar diferenças
    const dates = baseDates.length ? baseDates : Object.keys(priceSeriesByToken).sort();
    if (!dates.length) return [];

    const firstDate = dates[0];
    const firstBtc = (seriesMap['BTC'] || []).find(p => p.date === firstDate)?.price || (seriesMap['BTC'] || [])[0]?.price;

    // preço base do portfolio na primeira data
    const basePortfolio = allocation.reduce((sum, item) => {
      const token = item.token.toUpperCase();
      const tokenFirst = (seriesMap[token] || []).find(p => p.date === firstDate)?.price || (seriesMap[token] || [])[0]?.price;
      if (!tokenFirst) return sum;
      return sum + tokenFirst * (item.percentage / 100);
    }, 0);

    const points = dates.map(date => {
      const btcPrice = (seriesMap['BTC'] || []).find(p => p.date === date)?.price;
      const btcBase = firstBtc;
      const btcPct = btcPrice && btcBase ? ((btcPrice - btcBase) / btcBase) * 100 : 0;

      const portfolioPrice = allocation.reduce((sum, item) => {
        const token = item.token.toUpperCase();
        // último preço conhecido até a data
        const s = seriesMap[token] || [];
        const exact = s.find(p => p.date === date)?.price;
        const prev = s.reduce((acc, p) => (p.date <= date ? p.price : acc), undefined as number | undefined);
        const price = exact ?? prev;
        if (!price) return sum;
        return sum + price * (item.percentage / 100);
      }, 0);

      const portfolioBase = basePortfolio;
      const portfolioPct = portfolioPrice && portfolioBase ? ((portfolioPrice - portfolioBase) / portfolioBase) * 100 : 0;

      return { date, portfolio: portfolioPct, btc: btcPct };
    });

    return points;
  }

  private calculateMetrics(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    sectorBreakdown: { [sector: string]: number }
  ) {
    const stablecoinPercentage = allocation
      .filter(item => ['USDC', 'USDT'].includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const liquidity = allocation.reduce((avg, item) => {
      const score = item.tokenData?.liquidityScore || 0;
      return avg + (score * item.percentage / 100);
    }, 0);
    
    const volatility = allocation.reduce((avg, item) => {
      // Mock volatility calculation - em produção, usar dados históricos
      const volatilityScore = ['BTC', 'ETH', 'SOL'].includes(item.token) ? 0.7 : 0.9;
      return avg + (volatilityScore * item.percentage / 100);
    }, 0);
    
    const diversificationScore = Object.keys(sectorBreakdown).length * 20; // Max 100
    
    return {
      volatility: Math.round(volatility * 100) / 100,
      liquidity: Math.round(liquidity * 10000) / 100, // Convert to percentage
      stablecoinPercentage: Math.round(stablecoinPercentage * 10) / 10,
      diversificationScore: Math.min(100, diversificationScore)
    };
  }
}
