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
import { CoinMarketCapService } from './coinmarketcap';

export class DiagnosticService {
  private coinGeckoService: CoinGeckoService;
  private coinMarketCapService: CoinMarketCapService;

  constructor() {
    this.coinGeckoService = new CoinGeckoService();
    this.coinMarketCapService = new CoinMarketCapService();
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
    
    const MAJOR_COINS = ['BTC', 'ETH', 'SOL'];
    const STABLECOINS = ['USDC', 'USDT', 'DAI', 'BUSD'];
    
    // Flags por ativo com análise contextualizada
    allocation.forEach(item => {
      const sector = this.getTokenSector(item.token);
      const isMajor = MAJOR_COINS.includes(item.token);
      const isStable = STABLECOINS.includes(item.token);
      
      // ≥20% em ativo que não seja BTC/ETH/SOL/USDC/USDT → Yellow
      if (item.percentage >= 20 && !isMajor && !isStable) {
        const sectorContext = this.getSectorRiskContext(sector);
        flags.push({
          type: 'yellow',
          category: 'asset',
          message: `⚠️ Concentração Alta: ${item.token} (${sector}) representa ${item.percentage.toFixed(1)}% da carteira`,
          actionable: `${sectorContext} Reduza para 10-15% e diversifique em ativos menos correlacionados.`,
          severity: 2
        });
      }
      
      // ≥40% em ativo que não seja BTC/ETH/SOL → Red
      if (item.percentage >= 40 && !isMajor) {
        flags.push({
          type: 'red',
          category: 'asset',
          message: `🚨 Risco Crítico: ${item.token} representa ${item.percentage.toFixed(1)}% - Exposição excessiva a um único ativo`,
          actionable: `AÇÃO URGENTE: Reduza para no máximo 20%. ${this.getConcentrationAdvice(item.token, sector, profile)}`,
          severity: 4
        });
      }
      
      // >60% em qualquer único ativo → Red Crítico
      if (item.percentage > 60) {
        flags.push({
          type: 'red',
          category: 'asset',
          message: `🚨 Portfólio Extremamente Concentrado: ${item.token} representa ${item.percentage.toFixed(1)}%`,
          actionable: `RISCO SISTÊMICO: Distribua imediatamente para múltiplos ativos. ${isMajor ? 'Mesmo em majors, mantenha no máximo 40%.' : 'Para altcoins, máximo recomendado é 15%.'}`,
          severity: 5
        });
      }
      
      // Análise específica por setor
      if (sector === 'Meme' && item.percentage > 5) {
        flags.push({
          type: item.percentage > 10 ? 'red' : 'yellow',
          category: 'asset',
          message: `🎲 Exposição Alta em Memecoin: ${item.token} (${item.percentage.toFixed(1)}%)`,
          actionable: 'Memecoins são extremamente voláteis e especulativos. Recomendado máximo 3-5% em perfil arrojado, 0-2% em moderado, 0% em conservador.',
          severity: item.percentage > 10 ? 3 : 2
        });
      }
      
      if ((sector === 'Gaming' || sector === 'Metaverse') && item.percentage > 10) {
        flags.push({
          type: 'yellow',
          category: 'asset',
          message: `🎮 Exposição Setorial: ${item.token} em Gaming/Metaverse (${item.percentage.toFixed(1)}%)`,
          actionable: 'Tokens de gaming são cíclicos e dependentes de adoção. Considere reduzir para 5-8% e diversificar em outros narrativos.',
          severity: 2
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
    
    // Flags por setor - Análise Profissional
    Object.entries(sectorBreakdown).forEach(([sector, percentage]) => {
      // Concentração setorial crítica
      if (percentage > 50) {
        const severity = profile.riskTolerance === 'low' ? 'red' : 'yellow';
        const sectorAnalysis = this.getSectorDiversificationAdvice(sector, percentage, profile);
        flags.push({
          type: severity,
          category: 'sector',
          message: `📊 Concentração Setorial: ${percentage.toFixed(1)}% em ${sector}`,
          actionable: sectorAnalysis,
          severity: severity === 'red' ? 4 : 3
        });
      }
      
      // Análise específica por tipo de setor
      if (sector === 'Meme' && percentage > 10) {
        flags.push({
          type: 'red',
          category: 'sector',
          message: `🎰 Exposição Excessiva em Memecoins: ${percentage.toFixed(1)}%`,
          actionable: 'Memecoins não devem representar mais que 5% de um portfólio diversificado. Altíssima volatilidade e risco de perda total.',
          severity: 4
        });
      }
      
      if ((sector === 'DEX' || sector === 'Lending') && percentage > 30 && profile.riskTolerance === 'low') {
        flags.push({
          type: 'yellow',
          category: 'sector',
          message: `⚠️ Concentração em DeFi (${sector}): ${percentage.toFixed(1)}%`,
          actionable: 'Para perfil conservador, considere reduzir exposição DeFi e aumentar em majors (BTC/ETH) e stables.',
          severity: 2
        });
      }
      
      if (sector === 'Layer 2' && percentage > 35) {
        flags.push({
          type: 'yellow',
          category: 'sector',
          message: `🔗 Alta Exposição em Layer 2: ${percentage.toFixed(1)}%`,
          actionable: 'L2s estão correlacionadas ao sucesso da Ethereum. Diversifique com L1s alternativas ou outras teses.',
          severity: 2
        });
      }
    });
    
    // Flags por perfil - stablecoins (CRÍTICO)
    const STABLECOINS_LIST = ['USDC', 'USDT', 'DAI', 'BUSD'];
    const stablecoinPercentage = allocation
      .filter(item => STABLECOINS_LIST.includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance);
    
    if (stablecoinPercentage === 0 && profile.riskTolerance !== 'high') {
      flags.push({
        type: 'red',
        category: 'profile',
        message: `🚨 Zero Stablecoins: Carteira sem proteção de capital`,
        actionable: `CRÍTICO: Aloque ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}% em USDC/USDT para gerenciar volatilidade e ter liquidez para oportunidades.`,
        severity: 4
      });
    } else if (stablecoinPercentage < expectedStablecoinRange.min) {
      const severityType = profile.riskTolerance === 'low' ? 'red' : 'yellow';
      flags.push({
        type: severityType,
        category: 'profile',
        message: `💵 Stablecoins Insuficientes: ${stablecoinPercentage.toFixed(1)}% (recomendado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: `${this.getStablecoinAdvice(stablecoinPercentage, expectedStablecoinRange, profile)}`,
        severity: severityType === 'red' ? 3 : 2
      });
    } else if (stablecoinPercentage > expectedStablecoinRange.max) {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `💰 Excesso de Stablecoins: ${stablecoinPercentage.toFixed(1)}% (recomendado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: `Você está perdendo potencial de valorização. Para perfil ${profile.riskTolerance === 'high' ? 'arrojado' : profile.riskTolerance === 'medium' ? 'moderado' : 'conservador'}, realoque ${(stablecoinPercentage - expectedStablecoinRange.max).toFixed(1)}% em ${this.getSuggestedAllocationByProfile(profile)}.`,
        severity: 1
      });
    }
    
    // Análise de diversificação geral
    const numAssets = allocation.length;
    if (numAssets < 3) {
      flags.push({
        type: 'red',
        category: 'asset',
        message: `📉 Portfólio Subdiversificado: Apenas ${numAssets} ${numAssets === 1 ? 'ativo' : 'ativos'}`,
        actionable: 'RISCO ALTO: Aumente para no mínimo 5-8 ativos em setores diferentes para reduzir risco não-sistemático.',
        severity: 4
      });
    } else if (numAssets < 5 && profile.riskTolerance !== 'high') {
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `📊 Diversificação Limitada: ${numAssets} ativos`,
        actionable: 'Considere expandir para 6-10 ativos bem selecionados para melhor relação risco/retorno.',
        severity: 2
      });
    }
    
    // Análise de horizonte temporal vs alocação
    this.analyzeHorizonAlignment(allocation, profile, flags);
    
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

      console.log('🔍 Buscando unlocks no CoinMarketCap para:', unique);

      // Buscar apenas do CoinMarketCap
      const unlockEvents = await this.coinMarketCapService.getUpcomingUnlocks(unique, 180);

      console.log('✅ CoinMarketCap retornou:', unlockEvents.length, 'eventos');
      
      if (unlockEvents.length > 0) {
        console.log('📊 Detalhes dos unlocks encontrados:');
        unlockEvents.forEach(e => {
          console.log(`  - ${e.token}: ${e.amount.toLocaleString()} tokens (${e.percentage.toFixed(2)}%) em ${e.unlockDate}`);
        });
      }

      return unlockEvents.map(u => ({
        token: u.token,
        unlockDate: u.unlockDate,
        percentage: u.percentage,
        amount: u.amount,
        type: 'token_unlock' as const,
        severity: u.percentage >= 10 ? ('red' as const) : ('yellow' as const),
      }));
    } catch (e) {
      console.error('❌ Erro ao buscar unlock alerts:', e);
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

    // alinhar pelo ponto em comum: começar no MAIOR entre as primeiras datas disponíveis de todos os tokens e BTC
    const firstDates: string[] = [];
    firstDates.push(btcSeries[0]?.date);
    for (const token of symbols) {
      const s = seriesMap[token] || [];
      if (s.length) firstDates.push(s[0].date);
    }
    const startAt = firstDates.filter(Boolean).sort()[firstDates.length ? firstDates.length - 1 : 0];
    const allDates = baseDates.length ? baseDates : Object.keys(priceSeriesByToken).sort();
    const dates = allDates.filter(d => !startAt || d >= startAt);
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
  
  // ========== MÉTODOS DE ANÁLISE PROFISSIONAL ==========
  
  private getSectorRiskContext(sector: string): string {
    const sectorInsights: { [key: string]: string } = {
      'Meme': 'Memecoins são ativos de altíssimo risco com volatilidade extrema e sem fundamento.',
      'Gaming': 'Gaming tokens dependem de adoção de usuários, são cíclicos e sensíveis a narrativas.',
      'DEX': 'DEXs competem por liquidez e volume em mercado saturado. Risco de impermanent loss.',
      'Lending': 'Protocolos de lending têm risco de smart contract, liquidações e inadimplência.',
      'Layer 2': 'L2s são dependentes do sucesso da Layer 1 base (Ethereum). Alta correlação.',
      'Smart Contract Platform': 'L1s competem por desenvolvedores, TVL e market share. Altamente competitivo.',
      'Oracle': 'Oracles são infraestrutura crítica mas com forte competição. Winner-takes-most.',
      'Derivatives': 'Derivativos cripto têm risco adicional de alavancagem e liquidações.',
      'Yield Farming': 'Yield farming tem risco de rugs, variação de APY e exploits de protocol.',
      'AI': 'Tokens de AI são altamente especulativos, dependentes de adoção real vs hype.',
      'RWA': 'Real World Assets têm risco regulatório mas potencial institucional forte.',
      'Liquid Staking': 'Staking líquido tem risco de smart contract mas gera yield consistente.',
      'Infrastructure': 'Projetos de infraestrutura são de longo prazo com moat defensivo.',
      'Storage': 'Storage descentralizado compete com serviços centralizados consolidados.',
      'NFT': 'NFT marketplaces dependem de volume e são sensíveis a ciclos de mercado.',
      'Payment': 'Tokens de pagamento enfrentam competição de stablecoins e regulação.',
      'Stablecoin': 'Stablecoins têm menor volatilidade mas risco de depeg e regulatório.',
      'Store of Value': 'Store of value estabelecidos mas com narrativa consolidada.',
    };
    return sectorInsights[sector] || 'Setor emergente com riscos não totalmente mapeados. Diversificação recomendada.';
  }
  
  private getConcentrationAdvice(token: string, sector: string, profile: InvestorProfile): string {
    const horizon = profile.horizon;
    const risk = profile.riskTolerance;
    
    if (['BTC', 'ETH'].includes(token)) {
      return `Mesmo com ${token}, concentração acima de 40% é arriscada. Diversifique em outros majors e stables.`;
    }
    
    if (sector === 'Meme') {
      return `Memecoins são apostas especulativas. Realize lucros e rebalanceie para ativos fundamentalmente sólidos.`;
    }
    
    if (risk === 'low') {
      return `Perfil conservador: Rebalanceie para 60% BTC/ETH, 25% stables, 15% altcoins selecionadas.`;
    }
    
    if (horizon === 'short') {
      return `Horizonte curto: Aumente stables e majors para reduzir volatilidade de curto prazo.`;
    }
    
    return `Distribua entre 5-8 ativos de qualidade em setores descorrelacionados.`;
  }
  
  private getSectorDiversificationAdvice(sector: string, percentage: number, profile: InvestorProfile): string {
    if (sector === 'Smart Contract Platform') {
      return `Exposição concentrada em L1s. Considere adicionar DeFi blue-chips, oracles ou ativos de infraestrutura.`;
    }
    
    if (sector === 'DEX' || sector === 'Lending') {
      return `DeFi concentrado em ${sector}. Balance com exposure em L1s, RWA ou outras narrativas.`;
    }
    
    if (sector === 'Stablecoin') {
      return `Excesso de stables reduz potencial de retorno. Considere alocar em BTC/ETH e altcoins de qualidade.`;
    }
    
    if (profile.riskTolerance === 'low') {
      return `Perfil conservador: Distribua ${(percentage - 40).toFixed(0)}% para BTC/ETH/stables e mantenha no máximo 40% em ${sector}.`;
    }
    
    return `Rebalanceie para no máximo 30-40% em ${sector} e diversifique em 2-3 setores adicionais.`;
  }
  
  private getStablecoinAdvice(current: number, expected: { min: number; max: number }, profile: InvestorProfile): string {
    const diff = expected.min - current;
    
    if (profile.horizon === 'short') {
      return `Horizonte curto precisa de liquidez. Converta ${diff.toFixed(0)}% de altcoins voláteis para stables.`;
    }
    
    if (profile.riskTolerance === 'low') {
      return `Perfil conservador necessita colchão de segurança. Aumente stables para ${expected.min}% vendendo posições de maior risco.`;
    }
    
    if (profile.objective.includes('passive_income')) {
      return `Para renda passiva, mantenha ${expected.min}-${expected.max}% em stables gerando yield em protocolos seguros (AAVE, Compound).`;
    }
    
    return `Aloque ${diff.toFixed(0)}% adicional em USDC para gestão de risco e aproveitar oportunidades de compra.`;
  }
  
  private getSuggestedAllocationByProfile(profile: InvestorProfile): string {
    if (profile.riskTolerance === 'low') {
      return 'BTC (30-40%), ETH (20-30%), e DeFi blue-chips (10-15%)';
    }
    
    if (profile.riskTolerance === 'high' && profile.horizon === 'long') {
      return 'altcoins de mid-cap com fundamentos sólidos e narrativas emergentes';
    }
    
    if (profile.horizon === 'short') {
      return 'majors líquidos (BTC/ETH/SOL) para facilitar saída';
    }
    
    if (profile.objective.includes('multiply')) {
      return 'altcoins de qualidade com potencial de 3-10x (Layer 1s, DeFi, RWA)';
    }
    
    return 'mix balanceado de majors (50%), DeFi (20%) e altcoins selecionadas (30%)';
  }
  
  private analyzeHorizonAlignment(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    profile: InvestorProfile,
    flags: DiagnosticFlag[]
  ): void {
    const majorPercentage = allocation
      .filter(item => ['BTC', 'ETH', 'SOL'].includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const memePercentage = allocation
      .filter(item => this.getTokenSector(item.token) === 'Meme')
      .reduce((sum, item) => sum + item.percentage, 0);
    
    // Curto prazo precisa de liquidez
    if (profile.horizon === 'short' && majorPercentage < 50) {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `⏱️ Desalinhamento Temporal: Horizonte curto com ${majorPercentage.toFixed(0)}% em majors`,
        actionable: `Para horizonte de até 1 ano, mantenha 60-70% em ativos líquidos (BTC/ETH/SOL/stables) para facilitar saídas.`,
        severity: 2
      });
    }
    
    // Longo prazo pode ter mais altcoins
    if (profile.horizon === 'long' && majorPercentage > 70 && profile.riskTolerance === 'high') {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `🎯 Oportunidade: Horizonte longo com ${majorPercentage.toFixed(0)}% em majors`,
        actionable: `Com 3+ anos de horizonte e perfil arrojado, considere alocar 20-30% em altcoins de fundamento sólido para maior potencial de retorno.`,
        severity: 1
      });
    }
    
    // Conservador não pode ter memecoins
    if (profile.riskTolerance === 'low' && memePercentage > 0) {
      flags.push({
        type: 'red',
        category: 'profile',
        message: `🚫 Incompatibilidade de Perfil: Conservador com ${memePercentage.toFixed(1)}% em memecoins`,
        actionable: `Perfil conservador NÃO deve ter exposure em memecoins. Realoque 100% para BTC/ETH/stables.`,
        severity: 4
      });
    }
    
    // Análise de objetivo vs alocação
    if (profile.objective.includes('preserve') && majorPercentage < 60) {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `🛡️ Objetivo Preservação: Apenas ${majorPercentage.toFixed(0)}% em majors`,
        actionable: `Para preservar capital, aloque 60-70% em BTC/ETH, 20-30% em stables, e máximo 10-20% em altcoins.`,
        severity: 2
      });
    }
  }
}
