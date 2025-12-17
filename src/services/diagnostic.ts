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
import { DIAGNOSTIC_MESSAGES } from '../messages/diagnostic-messages';

export class DiagnosticService {
  private coinGeckoService: CoinGeckoService;
  private coinMarketCapService: CoinMarketCapService;

  // Constantes de classificação de ativos
  private static readonly MAJOR_TIER_1 = ['BTC']; // Major tier 1
  private static readonly MAJOR_TIER_2 = ['ETH', 'SOL']; // Major tier 2
  private static readonly MAJOR_COINS = [...DiagnosticService.MAJOR_TIER_1, ...DiagnosticService.MAJOR_TIER_2]; // Todos os majors
  private static readonly MAJOR_STABLECOINS = ['USDC', 'USDT', 'DAI', 'PYUSD']; // Major stablecoins (incluindo PYUSD)
  // Outras stablecoins (alto risco): USDE, FRAX, LUSD, MIM, USDD, etc.
  // Ativos com potencial de yield (staking, incentivos, lending etc.)
  // OBS: "yield" pode variar em mecanismo e risco; aqui é usado como proxy de elegibilidade para objetivo de renda passiva.
  private static readonly YIELD_ASSETS = [
    'ETH', 'SOL', 'DOT', 'ATOM', 'AVAX', 'NEAR', 'MATIC', 'ADA', 'ALGO', 'FTM',
    'SUI', 'APT', 'SEI', 'INJ', 'ENA', 'HYPE', 'AAVE', 'TIA', 'LDO', 'PENDLE',
  ];

  // Constantes de thresholds - Valores centralizados para fácil manutenção
  private static readonly THRESHOLDS = {
    // Renda passiva (percentuais do portfólio)
    PASSIVE_INCOME_MIN_YIELD_ASSETS: 50,
    PASSIVE_INCOME_EXCELLENT_YIELD_ASSETS: 70,
    PASSIVE_INCOME_BTC_WARNING: 40,
  } as const;

  constructor() {
    this.coinGeckoService = new CoinGeckoService();
    this.coinMarketCapService = new CoinMarketCapService();
  }

  async generateDiagnostic(
    allocation: PortfolioAllocation[], 
    profile: InvestorProfile,
    backtestPeriod: number = 180
  ): Promise<PortfolioDiagnostic> {
    // ========================================================================
    // VALIDAÇÃO DE INPUT (defesa em profundidade)
    // ========================================================================
    
    if (!allocation || allocation.length === 0) {
      throw new Error('Portfolio cannot be empty');
    }
    
    const totalPercentage = allocation.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) { // Tolerância 0.1% por arredondamento
      throw new Error(`Percentages must sum to 100%, got ${totalPercentage.toFixed(2)}%`);
    }
    
    // Validar percentages individuais
    allocation.forEach(a => {
      if (a.percentage < 0) {
        throw new Error(`Negative percentage not allowed: ${a.token} = ${a.percentage}%`);
      }
      if (a.percentage > 100) {
        throw new Error(`Percentage cannot exceed 100%: ${a.token} = ${a.percentage}%`);
      }
    });
    
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
    
    // Calcular backtest (agregado) e série normalizada com período customizado
    const backtest = await this.calculateBacktest(enrichedAllocation, backtestPeriod);
    const backtestSeries = await this.calculateBacktestSeries(enrichedAllocation, backtestPeriod);
    
    // Buscar unlocks (integração com CoinMarketCap)
    const unlockAlerts = await this.getUnlockAlerts(symbols);
    
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
    void sectorBreakdown; // Mantido para métricas/UI; não usamos para flags nas regras simplificadas.
    const flags: DiagnosticFlag[] = [];
    
    const MAJOR_COINS = DiagnosticService.MAJOR_COINS;
    const MAJOR_STABLECOINS = DiagnosticService.MAJOR_STABLECOINS;
    const OTHER_STABLECOINS = ['USDE', 'FRAX', 'LUSD', 'MIM', 'USDD', 'TUSD', 'FDUSD', 'BUSD'];

    const allocMap = new Map(allocation.map(a => [a.token.toUpperCase(), a]));
    const btcPercentage = allocMap.get('BTC')?.percentage || 0;
    const ethPercentage = allocMap.get('ETH')?.percentage || 0;
    const solPercentage = allocMap.get('SOL')?.percentage || 0;
    const majorsPercentage = btcPercentage + ethPercentage + solPercentage;

    const majorStablePercentage = allocation
      .filter(a => MAJOR_STABLECOINS.includes(a.token.toUpperCase()))
      .reduce((sum, a) => sum + a.percentage, 0);

    const otherStablecoinsAllocation = allocation.filter(a => OTHER_STABLECOINS.includes(a.token.toUpperCase()));
    const otherStablecoinsPercentage = otherStablecoinsAllocation.reduce((sum, a) => sum + a.percentage, 0);

    const memecoinsAllocation = allocation.filter(a => this.getTokenSector(a.token) === 'Meme');
    const memecoinPercentage = memecoinsAllocation.reduce((sum, a) => sum + a.percentage, 0);

    const hasPreserve = profile.objective.includes('preserve');
    const hasMultiply = profile.objective.includes('multiply');
    const hasPassiveIncome = profile.objective.includes('passive_income');

    // 1) Contradições (apenas aviso)
    if (profile.riskTolerance === 'high' && profile.horizon === 'short' && hasPreserve) {
        flags.push({
          type: 'yellow',
        category: 'profile',
        message: '⚠️ Contradição nas escolhas: arrojado + curto prazo com objetivo de preservação',
        actionable: 'Revise suas escolhas: preservar capital normalmente pede mais estabilidade e horizonte mais longo.',
          severity: 2
        });
      }
    if (profile.riskTolerance === 'low' && profile.horizon === 'long' && hasMultiply) {
        flags.push({
          type: 'yellow',
        category: 'profile',
        message: '⚠️ Contradição nas escolhas: conservador + longo prazo com objetivo de multiplicação',
        actionable: 'Revise suas escolhas: multiplicar patrimônio normalmente implica aceitar mais volatilidade e risco.',
          severity: 2
        });
      }
      
    // 2) BTC especial
    if (btcPercentage > 90 && profile.riskTolerance === 'low' && profile.horizon === 'medium') {
          flags.push({
            type: 'yellow',
            category: 'asset',
        message: `💎 Alta Concentração em Bitcoin: ${btcPercentage.toFixed(1)}% em BTC`,
        actionable: 'Para médio prazo, considere manter parte em stablecoins (dentro da faixa do seu perfil) para liquidez e oportunidades.',
            severity: 1
          });
    } else if (btcPercentage > 90 && (profile.riskTolerance === 'medium' || profile.riskTolerance === 'high')) {
          const profileText = profile.riskTolerance === 'medium' ? 'moderado' : 'arrojado';
          const msg = DIAGNOSTIC_MESSAGES.btc_concentrated.moderate_aggressive;
          flags.push({
            type: 'yellow',
            category: 'asset',
        message: `${msg.title}: ${msg.message(btcPercentage)}`,
            actionable: msg.actionable(profileText),
        severity: 0 // informativo (sem penalidade)
      });
    }

    // 3) Major stablecoins (faixas por perfil + objetivo)
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance, profile.objective);
    if (majorStablePercentage === 0 && profile.riskTolerance === 'low') {
          flags.push({
            type: 'red',
        category: 'profile',
        message: '🚨 Zero Major Stablecoins: carteira sem proteção/liquidez',
        actionable: `Para seu perfil, considere manter ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}% em major stablecoins (USD) para liquidez e gestão de risco.`,
            severity: 4
          });
    } else if (majorStablePercentage === 0 && profile.riskTolerance === 'high') {
        flags.push({
          type: 'yellow',
        category: 'profile',
        message: '💡 Zero Major Stablecoins: sem colchão de liquidez',
        actionable: `Mesmo em perfil arrojado, faz sentido manter alguma liquidez. Considere manter stablecoins dentro da faixa ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%.`,
        severity: 1
      });
    } else if (majorStablePercentage < expectedStablecoinRange.min) {
          flags.push({
        type: profile.riskTolerance === 'low' ? 'red' : 'yellow',
        category: 'profile',
        message: `💵 Major Stablecoins abaixo do mínimo: ${majorStablePercentage.toFixed(1)}% (recomendado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: 'Aumente a parcela em major stablecoins reduzindo posições mais voláteis, para melhorar liquidez e controle de risco.',
        severity: profile.riskTolerance === 'low' ? 3 : 2
      });
    } else if (majorStablePercentage > expectedStablecoinRange.max) {
        flags.push({
          type: 'yellow',
        category: 'profile',
        message: `💰 Major Stablecoins acima do máximo: ${majorStablePercentage.toFixed(1)}% (recomendado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: 'Excesso de stablecoins pode reduzir potencial de valorização. Avalie realocar gradualmente para majors, mantendo a faixa do seu perfil.',
        severity: 1
      });
          } else {
      const profileText = profile.riskTolerance === 'high' ? 'arrojado' : profile.riskTolerance === 'medium' ? 'moderado' : 'conservador';
          flags.push({
            type: 'green',
        category: 'profile',
        message: `✅ Major Stablecoins na faixa ideal: ${majorStablePercentage.toFixed(1)}%`,
        actionable: `Você está dentro da faixa recomendada (${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%) para perfil ${profileText}.`,
            severity: 0
          });
      }
      
    // 4) Outras stablecoins (alerta de risco estrutural)
    if (otherStablecoinsPercentage > 0) {
      const list = otherStablecoinsAllocation.map(s => `${s.token.toUpperCase()} (${Math.round(s.percentage)}%)`).join(', ');
        flags.push({
          type: 'yellow',
        category: 'other_stablecoins',
        message: `⚠️ Exposição em stablecoins não-major: ${otherStablecoinsPercentage.toFixed(1)}%${list ? ` - ${list}` : ''}`,
        actionable: 'Stablecoins não-major tendem a ter maior risco de depeg/estrutura. Se o objetivo é segurança e liquidez, priorize major stablecoins.',
          severity: 2
        });
      }
      
    // 5) Memecoins (consolidado)
    const memecoinMaxByProfile: Record<string, number> = { low: 0, medium: 5, high: 15 };
    const memecoinMaxAllowed = memecoinMaxByProfile[profile.riskTolerance] ?? 5;
    const memecoinsList = memecoinsAllocation.map(m => `${m.token.toUpperCase()} (${Math.round(m.percentage)}%)`).join(', ');
    if (memecoinPercentage > memecoinMaxAllowed) {
      const isCritical = memecoinMaxAllowed === 0 || memecoinPercentage > 60;
        flags.push({
        type: isCritical ? 'red' : 'yellow',
          category: 'sector',
        message: `🎲 Exposição em Memecoins: ${Math.round(memecoinPercentage)}%${memecoinsList ? ` - ${memecoinsList}` : ''}`,
        actionable: `Recomendado máximo ${memecoinMaxAllowed}% para seu perfil. Reduza a exposição e realoque para uma base mais resiliente (majors e/ou major stablecoins) mantendo a faixa do seu perfil.`,
        severity: isCritical ? 5 : 3
      });
    } else if (memecoinPercentage > 0) {
      const profileText = profile.riskTolerance === 'high' ? 'arrojado' : profile.riskTolerance === 'medium' ? 'moderado' : 'conservador';
      flags.push({
        type: 'green',
        category: 'sector',
        message: `✅ Exposição Controlada em Memecoins: ${Math.round(memecoinPercentage)}%`,
        actionable: `Sua exposição em memecoins está dentro do limite (${memecoinMaxAllowed}%) para perfil ${profileText}.`,
        severity: 0
      });
    }
    
    // 6) Diversificação (número de ativos)
    const numAssets = allocation.length;
    if (numAssets >= 4 && numAssets <= 8) {
      flags.push({
        type: 'green',
        category: 'asset',
        message: `✅ Diversificação Ideal: ${numAssets} ativos`,
        actionable: 'Você está na faixa ideal (4–8), que costuma equilibrar diversificação e simplicidade.',
        severity: 0
      });
    } else if (numAssets > 15) {
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `📊 Over-diversification: ${numAssets} ativos`,
        actionable: 'Muitos ativos podem diluir convicção e dificultar gestão. Considere concentrar em menos posições com melhor racional.',
        severity: 2
      });
    } else if (numAssets <= 3) {
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `📉 Portfólio com poucos ativos: ${numAssets} ${numAssets === 1 ? 'ativo' : 'ativos'}`,
        actionable: 'Poucos ativos aumentam risco de concentração. Se essa for sua estratégia, garanta que ela esteja alinhada ao seu objetivo e horizonte.',
        severity: 2
      });
    }
    
    // 7) Majors (simplificado)
    if (majorsPercentage < 40) {
      flags.push({
        type: profile.riskTolerance === 'low' ? 'red' : 'yellow',
        category: 'asset',
        message: `⚠️ Baixa exposição em Majors: ${majorsPercentage.toFixed(1)}% (BTC+ETH+SOL)`,
        actionable: 'Majors tendem a formar a “base” de risco/liquidez do portfólio. Avalie aumentar majors e reduzir ativos mais voláteis.',
        severity: profile.riskTolerance === 'low' ? 3 : 2
      });
    }
    if (hasMultiply && majorsPercentage > 80 && profile.riskTolerance !== 'low') {
        flags.push({
          type: 'yellow',
        category: 'profile',
        message: `📈 Objetivo Multiplicar: ${majorsPercentage.toFixed(0)}% em majors pode limitar upside`,
        actionable: 'Se o objetivo é multiplicar, considere aumentar a parcela fora de majors de forma controlada (sem comprometer gestão de risco).',
          severity: 1
        });
    }

    // 8) Concentração por ativo (regra única, sem classificações avançadas)
    allocation.forEach(item => {
      const token = item.token.toUpperCase();
      const isMajor = MAJOR_COINS.includes(token);
      const isMajorStable = MAJOR_STABLECOINS.includes(token);
      if (isMajor || isMajorStable) return;

      if (item.percentage >= 40) {
      flags.push({
          type: 'red',
        category: 'asset',
          message: `🚨 Concentração muito alta em um único ativo: ${token} = ${item.percentage.toFixed(1)}%`,
          actionable: 'Reduza a concentração para mitigar risco específico e melhorar sua capacidade de rebalancear em diferentes cenários.',
          severity: 4
        });
      } else if (item.percentage >= 20) {
            flags.push({
              type: 'yellow',
          category: 'asset',
          message: `⚠️ Concentração alta em um único ativo: ${token} = ${item.percentage.toFixed(1)}%`,
          actionable: 'Considere reduzir a posição para diminuir risco idiossincrático e aumentar diversificação.',
              severity: 2
            });
          }
        });
        
    // 9) Objetivo preserve
    if (hasPreserve) {
      if (memecoinPercentage > 0) {
        flags.push({
          type: 'red',
          category: 'profile',
          message: '🚨 Memecoins incompatíveis com objetivo de preservação',
          actionable: 'Para preservar capital, evite exposição a memecoins e priorize uma base mais defensiva (majors + liquidez).',
          severity: 4
        });
      }
      if (majorsPercentage < 50) {
        flags.push({
          type: 'yellow',
          category: 'profile',
          message: `🛡️ Preservação: majors abaixo do recomendado (${majorsPercentage.toFixed(0)}%)`,
          actionable: 'Para preservação, aumente a base em majors e mantenha stablecoins dentro da faixa do seu perfil.',
          severity: 2
        });
      }
    }

    // 10) Objetivo passive_income
    if (hasPassiveIncome) {
      const yieldAssets = DiagnosticService.YIELD_ASSETS;
    const stakeablePercentage = allocation
        .filter(a => yieldAssets.includes(a.token.toUpperCase()))
      .reduce((sum, a) => sum + a.percentage, 0);
    
      const yieldAssetsPercentage = stakeablePercentage + majorStablePercentage;

    if (btcPercentage > DiagnosticService.THRESHOLDS.PASSIVE_INCOME_BTC_WARNING) {
      const msg = DIAGNOSTIC_MESSAGES.passive_income.btc_not_yielding;
      flags.push({
        type: 'yellow',
        category: 'objective',
        message: `${msg.title}: ${msg.message(btcPercentage)}`,
        actionable: msg.actionable(btcPercentage),
        severity: 2
      });
    }
    
      if (yieldAssetsPercentage < DiagnosticService.THRESHOLDS.PASSIVE_INCOME_MIN_YIELD_ASSETS) {
      flags.push({
        type: 'yellow',
        category: 'objective',
          message: `💰 Renda Passiva: baixa parcela em ativos com potencial de yield (${yieldAssetsPercentage.toFixed(1)}%)`,
          actionable: 'Se renda passiva é prioridade, aumente gradualmente a parcela em ativos com potencial de yield e mantenha stablecoins dentro da faixa do seu perfil.',
        severity: 2
      });
      } else if (yieldAssetsPercentage >= DiagnosticService.THRESHOLDS.PASSIVE_INCOME_EXCELLENT_YIELD_ASSETS) {
      flags.push({
        type: 'green',
        category: 'objective',
          message: `✅ Renda Passiva: boa parcela em ativos com potencial de yield (${yieldAssetsPercentage.toFixed(1)}%)`,
          actionable: 'Estrutura coerente para renda passiva: mantenha disciplina de risco e revise periodicamente a distribuição.',
        severity: 0
      });
    }
  }

    return flags.sort((a, b) => b.severity - a.severity);
  }

  private getExpectedStablecoinRange(riskTolerance: string, objectives?: string[]): { min: number; max: number } {
    const hasPassiveIncome = !!objectives?.includes('passive_income');

    if (hasPassiveIncome) {
      if (riskTolerance === 'low') return { min: 10, max: 50 };
      if (riskTolerance === 'medium') return { min: 10, max: 40 };
      return { min: 0, max: 30 };
    }

    if (riskTolerance === 'low') return { min: 10, max: 40 };
    if (riskTolerance === 'medium') return { min: 10, max: 20 };
    return { min: 0, max: 20 };
  }

  private calculateAdherenceScore(flags: DiagnosticFlag[], profile: InvestorProfile): number {
    // Nova fórmula: Score inicial 100, penalidades progressivas
    let score = 100;
    
    flags.forEach(flag => {
      // Pesos ajustados baseados na severidade
      // Flags verdes (severity 0) não penalizam
      switch (flag.severity) {
        case 5: score -= 25; break; // Red crítico (severidade máxima)
        case 4: score -= 15; break; // Red alto
        case 3: score -= 12; break; // Red
        case 2: score -= 8; break;  // Yellow alto
        case 1: score -= 3; break;  // Yellow
        case 0: break; // Green (pontos positivos) - não penaliza
        default: break; // Qualquer outra - não penaliza
      }
    });
    
    // Garantir que o score fique entre 0 e 100
    return Math.max(0, Math.min(100, score));
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
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance, profile.objective);
    const currentStablecoinPercentage = allocation
      .filter(item => DiagnosticService.MAJOR_STABLECOINS.includes(item.token))
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


  private async calculateBacktest(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    maxDays: number = 180
  ): Promise<any[]> {
    const symbols = Array.from(new Set(allocation.map(a => a.token).map(s => s.toUpperCase())));
    // Períodos dinâmicos baseados no maxDays
    const periods = [30, 90, 180, 365].filter(p => p <= maxDays);
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
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    days: number = 180
  ) {
    const symbols = Array.from(new Set(allocation.map(a => a.token.toUpperCase())));
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

      // Calcular performance individual de cada token
      const tokenPerformances: { [token: string]: number } = {};
      allocation.forEach(item => {
        const token = item.token.toUpperCase();
        const s = seriesMap[token] || [];
        const tokenFirstPrice = s.find(p => p.date === firstDate)?.price || s[0]?.price;
        const exact = s.find(p => p.date === date)?.price;
        const prev = s.reduce((acc, p) => (p.date <= date ? p.price : acc), undefined as number | undefined);
        const currentPrice = exact ?? prev;
        
        if (tokenFirstPrice && currentPrice) {
          tokenPerformances[token] = ((currentPrice - tokenFirstPrice) / tokenFirstPrice) * 100;
        } else {
          tokenPerformances[token] = 0;
        }
      });

      return { date, portfolio: portfolioPct, btc: btcPct, tokens: tokenPerformances };
    });

    return points;
  }

  private calculateMetrics(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    sectorBreakdown: { [sector: string]: number }
  ) {
    const stablecoinPercentage = allocation
      .filter(item => DiagnosticService.MAJOR_STABLECOINS.includes(item.token))
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

  // Integração com CoinMarketCap para unlocks
  private async getUnlockAlerts(symbols: string[]): Promise<UnlockAlert[]> {
    try {
      const unlocks = await this.coinMarketCapService.getUpcomingUnlocks(symbols, 180);
      
      return unlocks.map(unlock => {
        // Determinar severidade baseado na porcentagem do unlock
        const severity: 'yellow' | 'red' = unlock.percentage > 5 ? 'red' : 'yellow';
        
        return {
          token: unlock.token,
          unlockDate: unlock.unlockDate,
          percentage: unlock.percentage,
          amount: unlock.amount,
          type: 'token_unlock' as const,
          severity
        };
      });
    } catch (error) {
      console.error('Erro ao buscar unlocks:', error);
      return []; // Retorna array vazio em caso de erro
    }
  }
}
