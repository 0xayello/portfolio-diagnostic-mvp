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
  private static readonly STAKEABLE_ASSETS = ['ETH', 'SOL', 'DOT', 'ATOM', 'AVAX', 'NEAR', 'MATIC', 'ADA', 'ALGO', 'FTM']; // Ativos que geram yield via staking

  // Constantes de thresholds - Valores centralizados para fácil manutenção
  private static readonly THRESHOLDS = {
    // Concentração setorial
    SECTOR_CONCENTRATION_WARNING: 50,
    
    // Bitcoin específico  
    EXCLUSIVELY_BTC_RATIO: 95,
    BTC_RATIO_CONSERVATIVE_MIN: 60,
    
    // Concentração individual
    NON_MAJOR_CONCENTRATION_CRITICAL: 40,
    NON_MAJOR_CONCENTRATION_WARNING: 20,
    MAJOR_ETH_SOL_CONCENTRATION_WARNING: 60, // Apenas ETH/SOL, BTC excluído
    
    // Diversificação
    FEW_ASSETS_MAJOR_MIN: 70,
    IDEAL_ASSETS_MIN: 4,
    IDEAL_ASSETS_MAX: 8,
    OVER_DIVERSIFICATION: 15,
    
    // Correlação de ecossistemas
    ECOSYSTEM_CORRELATION_CRITICAL: 60,
    ECOSYSTEM_CORRELATION_WARNING: 45,
    
    // Renda passiva
    PASSIVE_INCOME_MIN_YIELD: 50,
    PASSIVE_INCOME_EXCELLENT_YIELD: 70,
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

  // Blue-chips estabelecidos (alta liquidez, histórico longo, market cap >$1B)
  // Agora usa sectors.json ao invés de array hardcoded
  private isBlueChip(token: string): boolean {
    const tokenData = sectorsData[token as keyof typeof sectorsData];
    return tokenData?.tier === 'blue-chip';
  }

  // Mid-caps estabelecidos (market cap $200M-$1B, histórico >1 ano)
  // Agora usa sectors.json ao invés de array hardcoded
  private isMidCapEstablished(token: string): boolean {
    const tokenData = sectorsData[token as keyof typeof sectorsData];
    return tokenData?.tier === 'mid-cap';
  }

  // Verifica se token é novo/experimental (<1 ano)
  // Dinâmico: sempre calcula 12 meses antes da data atual
  private isNewToken(token: string): boolean {
    const tokenData = sectorsData[token as keyof typeof sectorsData] as any;
    if (!tokenData || !tokenData.launchDate) return false;
    
    const launchDate = new Date(tokenData.launchDate);
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    
    return launchDate > cutoffDate;
  }

  // Verifica se token é muito novo (<6 meses)
  // Dinâmico: sempre calcula 6 meses antes da data atual
  private isVeryNewToken(token: string): boolean {
    const tokenData = sectorsData[token as keyof typeof sectorsData] as any;
    if (!tokenData || !tokenData.launchDate) return false;
    
    const launchDate = new Date(tokenData.launchDate);
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    return launchDate > cutoffDate;
  }

  // Obtém ecossistema do token
  private getTokenEcosystem(token: string): string {
    const tokenData = sectorsData[token as keyof typeof sectorsData];
    return tokenData?.ecosystem || 'Unknown';
  }

  // Verifica liquidez baseado em volume24h vs marketCap
  private hasLowLiquidity(tokenData?: TokenData): boolean {
    if (!tokenData || !tokenData.volume24h || !tokenData.marketCap) return false;
    const liquidityRatio = (tokenData.volume24h / tokenData.marketCap) * 100;
    return liquidityRatio < 5; // <5% de volume/market cap = baixa liquidez
  }

  private generateFlags(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    profile: InvestorProfile,
    sectorBreakdown: { [sector: string]: number }
  ): DiagnosticFlag[] {
    const flags: DiagnosticFlag[] = [];
    
    // ========================================================================
    // OTIMIZAÇÃO: Calcular percentages uma única vez usando Map
    // ========================================================================
    
    const allocMap = new Map(allocation.map(a => [a.token, a]));
    
    // Percentages individuais (calculados UMA VEZ)
    const btcAllocation = allocMap.get('BTC');
    const ethAllocation = allocMap.get('ETH');
    const solAllocation = allocMap.get('SOL');
    
    const btcPercentage = btcAllocation?.percentage || 0;
    const ethPercentage = ethAllocation?.percentage || 0;
    const solPercentage = solAllocation?.percentage || 0;
    const ethSolPercentage = ethPercentage + solPercentage;
    
    // Usar constantes da classe
    const MAJOR_TIER_1 = DiagnosticService.MAJOR_TIER_1;
    const MAJOR_TIER_2 = DiagnosticService.MAJOR_TIER_2;
    const MAJOR_COINS = DiagnosticService.MAJOR_COINS;
    const MAJOR_STABLECOINS = DiagnosticService.MAJOR_STABLECOINS;
    const STABLECOINS = MAJOR_STABLECOINS; // Alias para compatibilidade
    
    // Flags por ativo com análise contextualizada
    allocation.forEach(item => {
      const sector = this.getTokenSector(item.token);
      const isMajor = MAJOR_COINS.includes(item.token);
      const isStable = STABLECOINS.includes(item.token);
      const isBlueChip = this.isBlueChip(item.token);
      const isMidCap = this.isMidCapEstablished(item.token);
      const isNew = this.isNewToken(item.token);
      const isVeryNew = this.isVeryNewToken(item.token);
      const hasLowLiq = this.hasLowLiquidity(item.tokenData);
      
      // Limites por tipo de ativo
      let maxAllowed: number;
      if (isBlueChip) {
        maxAllowed = profile.riskTolerance === 'low' ? 5 : 10; // 5% conservador, 10% moderado/arrojado
      } else if (isMidCap) {
        // Mid-caps: 5% conservador, 8% moderado, 15% arrojado
        if (profile.riskTolerance === 'low') {
          maxAllowed = 5;
        } else if (profile.riskTolerance === 'medium') {
          maxAllowed = 8;
        } else {
          maxAllowed = 15; // Arrojado: 15%
        }
      } else if (isVeryNew) {
        maxAllowed = 5; // Máximo 5% mesmo em perfil arrojado para tokens muito novos
      } else if (isNew) {
        maxAllowed = profile.riskTolerance === 'low' ? 3 : 5; // 3% conservador, 5% moderado/arrojado
      } else {
        maxAllowed = 15; // Limite padrão para outros altcoins
      }
      
      // Validação de concentração individual
      if (item.percentage > maxAllowed && !isMajor && !isStable) {
        let message = `⚠️ Concentração Alta: ${item.token} (${sector}) representa ${item.percentage.toFixed(1)}% da carteira`;
        let actionable = `Reduza para no máximo ${maxAllowed}% e diversifique em ativos menos correlacionados.`;
        
        if (isVeryNew) {
          message = `🚨 Token Muito Novo: ${item.token} (${sector}) com ${item.percentage.toFixed(1)}%`;
          actionable = `Token lançado há menos de 6 meses. Limite a 5% máximo devido a histórico limitado e alta volatilidade.`;
        } else if (isNew) {
          message = `⚠️ Token Novo: ${item.token} (${sector}) com ${item.percentage.toFixed(1)}%`;
          actionable = `Token lançado há menos de 1 ano. Histórico limitado. Reduza para no máximo ${maxAllowed}% e monitore de perto.`;
        } else {
          const sectorContext = this.getSectorRiskContext(sector);
          actionable = `${sectorContext} ${actionable}`;
        }
        
        if (hasLowLiq) {
          actionable += ` ATENÇÃO: Este token apresenta baixa liquidez, o que pode dificultar saídas rápidas.`;
        }
        
        flags.push({
          type: isVeryNew || item.percentage > maxAllowed * 1.5 ? 'red' : 'yellow',
          category: 'asset',
          message,
          actionable,
          severity: isVeryNew || item.percentage > maxAllowed * 1.5 ? 4 : 2
        });
      }
      
      // Validação específica para tokens muito novos com concentração >10%
      if (isVeryNew && item.percentage > 10 && !isMajor && !isStable) {
        flags.push({
          type: 'red',
          category: 'asset',
          message: `🚨 Risco Crítico: ${item.token} (token muito novo) com ${item.percentage.toFixed(1)}%`,
          actionable: `Token lançado há menos de 6 meses. Concentração acima de 10% é extremamente arriscada. Reduza para no máximo 5% devido a histórico limitado, alta volatilidade e possível baixa liquidez.`,
          severity: 5
        });
      }
      
      // Validação de liquidez baixa
      if (hasLowLiq && item.percentage > 10 && !isMajor && !isStable) {
        flags.push({
          type: 'yellow',
          category: 'liquidity',
          message: `💧 Baixa Liquidez: ${item.token} com ${item.percentage.toFixed(1)}%`,
          actionable: `Este token apresenta baixa liquidez (volume <5% do market cap). Concentração acima de 10% pode dificultar saídas rápidas em momentos de stress. Considere reduzir para no máximo 10% ou migrar para ativos com maior liquidez.`,
          severity: 2
        });
      }
      
      // Validação antiga mantida para compatibilidade (≥20% e ≥40%)
      if (item.percentage >= 20 && !isMajor && !isStable && !isBlueChip && !isMidCap && !isNew) {
        const sectorContext = this.getSectorRiskContext(sector);
        flags.push({
          type: 'yellow',
          category: 'asset',
          message: `⚠️ Concentração Alta: ${item.token} (${sector}) representa ${item.percentage.toFixed(1)}% da carteira`,
          actionable: `${sectorContext} Reduza para 10-15% e diversifique em ativos menos correlacionados.`,
          severity: 2
        });
      }
      
      // TRATAMENTO ESPECIAL PARA BITCOIN (antes das regras gerais de concentração)
      if (item.token === 'BTC') {
        const isConservativeLongTerm = profile.riskTolerance === 'low' && profile.horizon === 'long';
        const isConservativeMediumTerm = profile.riskTolerance === 'low' && profile.horizon === 'medium';
        const isModerateOrAggressive = profile.riskTolerance === 'medium' || profile.riskTolerance === 'high';
        
        // Conservador + Longo Prazo: NÃO gera alertas para BTC alto
        // Bitcoin é defensivo, perfil conservador + longo prazo = estratégia válida
        // (Validação de stables cuidará da liquidez se necessário)
        
        // Conservador + Médio Prazo: permite até 90% sem alertas
        if (isConservativeMediumTerm && item.percentage > 90) {
          flags.push({
            type: 'yellow',
            category: 'asset',
            message: `💎 Alta Concentração em Bitcoin: ${item.percentage.toFixed(1)}% em BTC`,
            actionable: `Para médio prazo, considere manter 10-15% em stablecoins para aproveitar oportunidades e gerenciar volatilidade.`,
            severity: 1
          });
        } 
        // Moderado/Arrojado: permite até 90% sem alertas, >90% = sugestão leve (SEM penalizar score)
        else if (isModerateOrAggressive && item.percentage > 90) {
          const profileText = profile.riskTolerance === 'medium' ? 'moderado' : 'arrojado';
          const msg = DIAGNOSTIC_MESSAGES.btc_concentrated.moderate_aggressive;
          flags.push({
            type: 'yellow',
            category: 'asset',
            message: `${msg.title}: ${msg.message(item.percentage)}`,
            actionable: msg.actionable(profileText),
            severity: 0  // SEM PENALIDADE - apenas sugestão informativa
          });
        }
        
        // NÃO aplicar as regras gerais de concentração para BTC
        // Continuar para o próximo item (pular as validações seguintes)
      } else {
        // REGRAS GERAIS PARA OUTROS ATIVOS (ETH, SOL, altcoins)
        
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
        
        // >60% em qualquer único ativo (exceto BTC) → Red Crítico
        if (item.percentage > 60) {
          flags.push({
            type: 'red',
            category: 'asset',
            message: `🚨 Portfólio Extremamente Concentrado: ${item.token} representa ${item.percentage.toFixed(1)}%`,
            actionable: `RISCO SISTÊMICO: Distribua imediatamente para múltiplos ativos. ${isMajor ? 'Mesmo em majors (ETH/SOL), mantenha no máximo 40%.' : 'Para altcoins, máximo recomendado é 15%.'}`,
            severity: 5
          });
        }
      }
      
      // Análise de memecoins por token individual será consolidada no alerta geral de memecoins mais abaixo
      
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
      // EXCEÇÃO: Bitcoin (Store of Value) não gera alerta de concentração setorial
      // Bitcoin é tratado como categoria única, não como "setor comum"
      const isBitcoinSector = sector === 'Store of Value' || sector === 'Bitcoin';
      const btcPercentage = allocation.find(a => a.token === 'BTC')?.percentage || 0;
      const isMainlyBitcoin = isBitcoinSector && btcPercentage > 80;
      
      // Concentração setorial crítica (exceto Meme e Bitcoin)
      if (percentage > 50 && sector !== 'Meme' && !isMainlyBitcoin) {
        const severity = profile.riskTolerance === 'low' ? 'red' : 'yellow';
        const sectorAnalysis = this.getSectorDiversificationAdvice(sector, percentage, profile);
        
        // Mudar "Store of Value" para "Bitcoin" quando for majoritariamente BTC
        const sectorName = isBitcoinSector && btcPercentage > 50 ? 'Bitcoin' : sector;
        
        flags.push({
          type: severity,
          category: 'sector',
          message: `📊 Concentração Setorial: ${percentage.toFixed(1)}% em ${sectorName}`,
          actionable: sectorAnalysis,
          severity: severity === 'red' ? 4 : 3
        });
      }
      
      // Análise específica por tipo de setor - MEMECOINS TOTAL (CONSOLIDADO)
      if (sector === 'Meme') {
        // Limites por perfil - UNIFICADO: Arrojado sempre 15%
        const maxByProfile: { [key: string]: number } = {
          low: 0,      // Conservador: 0%
          medium: 5,   // Moderado: 5%
          high: 15     // Arrojado: 15% (unificado)
        };
        
        const maxAllowed = maxByProfile[profile.riskTolerance as keyof typeof maxByProfile] || 5;
        
        // Listar memecoins individuais
        const memecoins = allocation.filter(a => {
          const sector = this.getTokenSector(a.token);
          return sector === 'Meme';
        });
        const memecoinsList = memecoins.map(m => `${m.token} (${Math.round(m.percentage)}%)`).join(', ');
        
        if (percentage > maxAllowed) {
          const isHighPercentage = percentage > 60;
          const isCritical = maxAllowed === 0; // Conservador com qualquer memecoin é crítico
          
          // Ao reduzir memecoins, sugerir distribuição inteligente baseada no perfil
          let redistributionSuggestion = '';
          if (profile.riskTolerance === 'low') {
            redistributionSuggestion = 'BTC/ETH e stables';
          } else if (profile.riskTolerance === 'high') {
            redistributionSuggestion = 'majors ou altcoins de qualidade';
          } else {
            redistributionSuggestion = 'majors, altcoins ou stables';
          }
          
          flags.push({
            type: isCritical || isHighPercentage ? 'red' : 'yellow',
            category: 'sector',
            message: `🎲 Exposição em Memecoins: ${Math.round(percentage)}%${memecoinsList ? ` - ${memecoinsList}` : ''}`,
            actionable: `Memecoins são extremamente voláteis e especulativos. Recomendado máximo ${maxAllowed}% para seu perfil. Você está ${Math.round(percentage - maxAllowed)}% acima do recomendado. Distribua para ${redistributionSuggestion} e mantenha no máximo ${maxAllowed}% em memecoins.`,
            severity: isCritical || isHighPercentage ? 5 : 3
          });
        } else if (percentage > 0 && percentage <= maxAllowed) {
          // ✅ PONTO POSITIVO: Memecoin dentro do limite
          flags.push({
            type: 'green',
            category: 'sector',
            message: `✅ Exposição Controlada em Memecoins: ${Math.round(percentage)}%`,
            actionable: `Sua exposição em memecoins (${Math.round(percentage)}%) está dentro do limite de ${maxAllowed}% para perfil ${profile.riskTolerance === 'high' ? 'arrojado' : profile.riskTolerance === 'medium' ? 'moderado' : 'conservador'}. Você mantém oportunidades especulativas sem comprometer a carteira.`,
            severity: 0
          });
        }
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
    
    // Flags por perfil - Major Stablecoins (CRÍTICO) - Faixa 10-50%
    const STABLECOINS_LIST = DiagnosticService.MAJOR_STABLECOINS; // USDC, USDT, DAI, PYUSD
    const stablecoinPercentage = allocation
      .filter(item => STABLECOINS_LIST.includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance, profile.horizon, profile.objective);
    
    // Análise de Stablecoins: verificar se está dentro da faixa ideal
    if (stablecoinPercentage === 0 && profile.riskTolerance === 'low') {
      flags.push({
        type: 'red',
        category: 'profile',
        message: `🚨 Zero Major Stablecoins: Carteira sem proteção de capital`,
        actionable: `CRÍTICO para perfil conservador: Aloque ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}% em major stablecoins para gerenciar volatilidade e ter liquidez.`,
        severity: 4
      });
    } else if (stablecoinPercentage === 0 && profile.riskTolerance === 'high') {
      // Arrojado com zero stablecoins - Yellow flag (recomendação, não erro)
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `💡 Zero Major Stablecoins: Sem liquidez para oportunidades`,
        actionable: `Mesmo em perfil arrojado, recomenda-se manter pelo menos 5% em major stablecoins para ter liquidez e aproveitar oportunidades de mercado. Considere alocar 5-10% em major stablecoins.`,
        severity: 1
      });
    } else if (stablecoinPercentage < expectedStablecoinRange.min) {
      // EXCEÇÃO: Se a insuficiência de stables é causada por alta concentração em BTC (>80%), é Yellow (não Red)
      const btcPercentage = allocation.find(a => a.token === 'BTC')?.percentage || 0;
      const isHighBTCConcentration = btcPercentage >= 80;
      
      // Se tem >80% BTC, stablecoins baixos são aceitáveis (yellow leve)
      // Caso contrário, usar severidade padrão (red para conservador, yellow para outros)
      const severityType = isHighBTCConcentration ? 'yellow' : (profile.riskTolerance === 'low' ? 'red' : 'yellow');
      const severityLevel = isHighBTCConcentration ? 1 : (severityType === 'red' ? 3 : 2);
      
      flags.push({
        type: severityType,
        category: 'profile',
        message: `💵 Major Stablecoins Insuficientes: ${stablecoinPercentage.toFixed(1)}% (recomendado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: `${this.getStablecoinAdvice(stablecoinPercentage, expectedStablecoinRange, profile, isHighBTCConcentration)}`,
        severity: severityLevel
      });
    } else if (stablecoinPercentage > expectedStablecoinRange.max) {
      // ALERTA SEPARADO: Excesso de Major Stablecoins
      const excessStables = stablecoinPercentage - expectedStablecoinRange.max;
      const stableReduction = excessStables;
      
      // Mensagem focada apenas em stablecoins (sem misturar com majors)
      // IMPORTANTE: Ao reduzir stables, sugerir apenas majors e altcoins (NÃO stables)
      let actionableMessage: string;
      if (profile.riskTolerance === 'high' && profile.horizon === 'short') {
        actionableMessage = `Para perfil arrojado e curto prazo, reduza stables de ${stablecoinPercentage.toFixed(0)}% para ${expectedStablecoinRange.max}% (reduzir ${stableReduction.toFixed(0)}%). Aumente altcoins de qualidade com esses ${stableReduction.toFixed(0)}%.`;
      } else {
        actionableMessage = `Você está perdendo potencial de valorização. Reduza stables de ${stablecoinPercentage.toFixed(0)}% para ${expectedStablecoinRange.max}% e realoque ${excessStables.toFixed(1)}% em majors ou altcoins.`;
      }
      
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `💰 Excesso de Major Stablecoins: ${stablecoinPercentage.toFixed(1)}% (recomendado: ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}%)`,
        actionable: actionableMessage,
        severity: 1
      });
    } else {
      // ✅ PONTO POSITIVO: Alocação de stablecoins está correta!
      // Verificar se a faixa é específica para renda passiva
      const isPassiveIncomeRange = profile.objective.includes('passive_income') && 
        expectedStablecoinRange.min >= 15 && expectedStablecoinRange.max >= 30;
      
      let actionableMessage: string;
      if (isPassiveIncomeRange) {
        actionableMessage = `Sua alocação em major stablecoins (${stablecoinPercentage.toFixed(1)}%) está dentro da faixa recomendada de ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}% para quem busca renda passiva. Isso garante boa gestão de risco, liquidez e permite gerar yield em protocolos estabelecidos.`;
      } else {
        actionableMessage = `Sua alocação em major stablecoins (${stablecoinPercentage.toFixed(1)}%) está dentro da faixa recomendada de ${expectedStablecoinRange.min}-${expectedStablecoinRange.max}% para perfil ${profile.riskTolerance === 'high' ? 'arrojado' : profile.riskTolerance === 'medium' ? 'moderado' : 'conservador'}. Isso garante boa gestão de risco e liquidez.`;
      }
      
      flags.push({
        type: 'green',
        category: 'profile',
        message: `✅ Alocação Ideal de Major Stablecoins: ${stablecoinPercentage.toFixed(1)}%`,
        actionable: actionableMessage,
        severity: 0
      });
    }
    
    // Análise de diversificação geral - NOVA LÓGICA
    // 1-3 ativos: OK se BTC+ETH+SOL, senão Red
    // Até 8: padrão ideal
    // Até 15: OK se arrojado + curto prazo
    // >15: over-diversification
    
    const numAssets = allocation.length;
    const majorPercentage = allocation
      .filter(item => MAJOR_COINS.includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    // Verifica se portfólio é apenas majors + stablecoins (estratégia válida)
    const isOnlyMajorsAndStables = allocation.every(item => 
      MAJOR_COINS.includes(item.token) || STABLECOINS.includes(item.token)
    );
    
    // Calcular core assets (majors + stables)
    const corePercentage = majorPercentage + allocation
      .filter(item => STABLECOINS.includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    if (numAssets <= 3) {
      // OK se tem majors+stables >= 70% (estratégia conservadora válida, especialmente com BTC)
      if (!isOnlyMajorsAndStables || corePercentage < 70) {
        flags.push({
          type: 'red',
          category: 'asset',
          message: `📉 Portfólio Concentrado: ${numAssets} ${numAssets === 1 ? 'ativo' : 'ativos'} (${corePercentage.toFixed(0)}% em majors+stables)`,
          actionable: 'Com poucos ativos, concentre em BTC+ETH+SOL+stables (70%+) ou diversifique para 5-8 ativos de qualidade.',
          severity: 4
        });
      } else {
        // ✅ PONTO POSITIVO: Poucos ativos mas concentrados em majors
        // Desmembrar BTC de ETH/SOL na mensagem (usa variáveis já calculadas no início)
        
        let majorsDescription = '';
        if (btcPercentage > 0 && ethSolPercentage > 0) {
          majorsDescription = `BTC (${btcPercentage.toFixed(0)}%) + ETH/SOL (${ethSolPercentage.toFixed(0)}%)`;
        } else if (btcPercentage > 0) {
          majorsDescription = `Bitcoin (${btcPercentage.toFixed(0)}%)`;
        } else {
          majorsDescription = `BTC/ETH/SOL`;
        }
        
        flags.push({
          type: 'green',
          category: 'asset',
          message: `✅ Concentração Estratégica em Majors: ${numAssets} ${numAssets === 1 ? 'ativo' : 'ativos'}`,
          actionable: `Excelente! ${majorPercentage.toFixed(0)}% em ${majorsDescription} é uma estratégia sólida de baixo risco e boa liquidez. Abordagem "keep it simple" comprovada.`,
          severity: 0
        });
      }
    } else if (numAssets >= 4 && numAssets <= 8) {
      // ✅ PONTO POSITIVO: Número ideal de ativos
      flags.push({
        type: 'green',
        category: 'asset',
        message: `✅ Diversificação Ideal: ${numAssets} ativos`,
        actionable: `Ótima diversificação com ${numAssets} ativos. Isso permite exposição a diferentes teses sem diluir demais o portfólio. Ideal para gestão ativa.`,
        severity: 0
      });
    } else if (numAssets > 15) {
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `📊 Over-diversification: ${numAssets} ativos`,
        actionable: 'Muitos ativos diluem performance. Considere concentrar em 8-12 posições de alta convicção.',
        severity: 2
      });
    } else if (numAssets > 8 && profile.riskTolerance !== 'high') {
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `📊 Muitos Ativos: ${numAssets} ativos para perfil ${profile.riskTolerance === 'medium' ? 'moderado' : 'conservador'}`,
        actionable: 'Perfis conservadores/moderados funcionam melhor com 5-8 ativos bem selecionados.',
        severity: 1
      });
    }
    
    // Análise de BTC+ETH+SOL juntos (40-100% ideal)
    // Usa variáveis já calculadas no início (btcPercentage, ethSolPercentage)
    const majorCoinsTotal = btcPercentage + ethSolPercentage;
    
    // PRIORIDADE: Horizonte + Tolerância ao Risco têm prioridade sobre Objetivos
    // Detectar contradições entre perfil e objetivos
    const isConservativeLongTerm = profile.riskTolerance === 'low' && profile.horizon === 'long';
    const isAggressiveShortTerm = profile.riskTolerance === 'high' && profile.horizon === 'short';
    const isModerateMedium = profile.riskTolerance === 'medium' && profile.horizon === 'medium';
    
    // Verificar contradições
    const hasPreserveObjective = profile.objective.includes('preserve');
    const hasMultiplyObjective = profile.objective.includes('multiply');
    
    let hasContradiction = false;
    let contradictionMessage = '';
    
    if (isAggressiveShortTerm && hasPreserveObjective) {
      hasContradiction = true;
      contradictionMessage = '⚠️ Contradição detectada: Você selecionou perfil arrojado e curto prazo, mas também escolheu "preservar capital" como objetivo. Para esse diagnóstico, desconsideramos o último ponto.';
    } else if (isConservativeLongTerm && hasMultiplyObjective) {
      hasContradiction = true;
      contradictionMessage = '⚠️ Contradição detectada: Você selecionou perfil conservador e longo prazo, mas também escolheu "multiplicar patrimônio" como objetivo. Para esse diagnóstico, desconsideramos o último ponto.';
    }
    
    if (hasContradiction) {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: contradictionMessage,
        actionable: 'Revise seus objetivos para alinhá-los com seu perfil de risco e horizonte de investimento, ou vice-versa.',
        severity: 2
      });
    }
    
    // Determinar limites de majors baseado em HORIZONTE + RISCO (prioridade sobre objetivos)
    let maxMajorsByProfile: number;
    let minMajorsByProfile: number;
    
    if (isAggressiveShortTerm) {
      // Arrojado + Curto Prazo: majors máx 40%
      maxMajorsByProfile = 40;
      minMajorsByProfile = 20;
    } else if (isConservativeLongTerm) {
      // Conservador + Longo Prazo: majors 60-80%
      maxMajorsByProfile = 80;
      minMajorsByProfile = 60;
    } else if (profile.riskTolerance === 'low') {
      // Conservador (qualquer horizonte): majors 50-70%
      maxMajorsByProfile = 70;
      minMajorsByProfile = 50;
    } else if (profile.horizon === 'short') {
      // Curto Prazo (moderado/arrojado): majors máx 50%
      maxMajorsByProfile = 50;
      minMajorsByProfile = 30;
    } else {
      // Padrão: majors 40-70%
      maxMajorsByProfile = 70;
      minMajorsByProfile = 40;
    }
    
    // Verificar excesso de majors (baseado em horizonte + risco, não objetivos)
    // EXCEÇÃO: NÃO alertar se os "majors" são exclusivamente BTC (>95% do total de majors é BTC)
    const btcRatioOfMajors = majorCoinsTotal > 0 ? (btcPercentage / majorCoinsTotal) * 100 : 0;
    const isExclusivelyBTC = btcRatioOfMajors > 95; // Se >95% dos majors é BTC, considerar "exclusivamente BTC"
    
    if (majorCoinsTotal > maxMajorsByProfile && !isExclusivelyBTC) {
      const excess = majorCoinsTotal - maxMajorsByProfile;
      // Ao reduzir majors, sugerir apenas altcoins (NÃO sugerir majors novamente)
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `💰 Excesso de Majors (BTC, ETH e SOL): ${majorCoinsTotal.toFixed(0)}% (recomendado: máx ${maxMajorsByProfile}%)`,
        actionable: `Para perfil ${profile.riskTolerance === 'high' ? 'arrojado' : profile.riskTolerance === 'medium' ? 'moderado' : 'conservador'} e ${profile.horizon === 'short' ? 'curto' : profile.horizon === 'medium' ? 'médio' : 'longo'} prazo, reduza majors de ${majorCoinsTotal.toFixed(0)}% para no máximo ${maxMajorsByProfile}% (reduzir ${excess.toFixed(0)}%). Aumente altcoins de qualidade com esses ${excess.toFixed(0)}%.`,
        severity: 2
      });
    } else if (majorCoinsTotal >= minMajorsByProfile && majorCoinsTotal <= maxMajorsByProfile) {
      // ✅ PONTO POSITIVO: Majors na faixa ideal (baseado em horizonte + risco)
      // Verificar distribuição entre tier 1 (BTC) e tier 2 (ETH/SOL)
      let distributionWarning = false;
      if (isConservativeLongTerm) {
        // BTC deve ter pelo menos 60% dos majors
        const btcRatioOfMajors = majorCoinsTotal > 0 ? (btcPercentage / majorCoinsTotal) * 100 : 0;
        if (btcRatioOfMajors < 60) {
          flags.push({
            type: 'yellow',
            category: 'asset',
            message: `⚠️ Distribuição de Majors: BTC (${btcPercentage.toFixed(1)}%) vs ETH/SOL (${ethSolPercentage.toFixed(1)}%)`,
            actionable: `Para perfil conservador e longo prazo, BTC deve ter peso maior (≥60% dos majors). Considere aumentar exposição em BTC.`,
            severity: 2
          });
          distributionWarning = true;
        }
      } else if (isAggressiveShortTerm) {
        // ETH/SOL devem ter pelo menos 40% dos majors
        const ethSolRatioOfMajors = majorCoinsTotal > 0 ? (ethSolPercentage / majorCoinsTotal) * 100 : 0;
        if (ethSolRatioOfMajors < 40) {
          flags.push({
            type: 'yellow',
            category: 'asset',
            message: `⚠️ Distribuição de Majors: BTC (${btcPercentage.toFixed(1)}%) vs ETH/SOL (${ethSolPercentage.toFixed(1)}%)`,
            actionable: `Para perfil arrojado e curto prazo, ETH/SOL devem ter peso maior (≥40% dos majors). Considere aumentar exposição em ETH/SOL.`,
            severity: 2
          });
          distributionWarning = true;
        }
      }
      
      // Só mostrar flag verde se não houver warning de distribuição e não houver contradição
      if (!distributionWarning && !hasContradiction) {
        flags.push({
          type: 'green',
          category: 'asset',
          message: `✅ Exposição Sólida em Majors: ${majorCoinsTotal.toFixed(0)}%`,
          actionable: `Excelente alocação de ${majorCoinsTotal.toFixed(0)}% em BTC/ETH/SOL. Essa base sólida garante liquidez, menor volatilidade e correlação com o mercado cripto geral.`,
          severity: 0
        });
      }
    } else if (majorCoinsTotal < minMajorsByProfile && profile.riskTolerance !== 'high') {
      flags.push({
        type: profile.riskTolerance === 'low' ? 'red' : 'yellow',
        category: 'asset',
        message: `⚠️ Baixa Exposição em Majors: BTC+ETH+SOL = ${majorCoinsTotal.toFixed(1)}%`,
        actionable: `Ideal: ${minMajorsByProfile}-${maxMajorsByProfile}% em majors (BTC, ETH, SOL). Aumente em ${(minMajorsByProfile - majorCoinsTotal).toFixed(0)}% para reduzir risco.`,
        severity: profile.riskTolerance === 'low' ? 3 : 2
      });
    }
    
    // Identificar outras stablecoins (alto risco) - não são major stablecoins
    // Exemplos: USDE (Ethena - sintética, depende de funding rates), FRAX, LUSD, MIM, USDD, TUSD, FDUSD, BUSD
    // NOTA: ENA é o token de governança do protocolo Ethena (DeFi volátil), não é stablecoin
    const OTHER_STABLECOINS = ['USDE', 'FRAX', 'LUSD', 'MIM', 'USDD', 'TUSD', 'FDUSD', 'BUSD'];
    const otherStablecoinsAllocation = allocation.filter(
      item => OTHER_STABLECOINS.includes(item.token.toUpperCase())
    );
    const otherStablecoinsPercentage = otherStablecoinsAllocation.reduce((sum, item) => sum + item.percentage, 0);
    
    // Validação de Outras Stablecoins (alto risco)
    if (otherStablecoinsPercentage > 0) {
      const maxAllowed = profile.riskTolerance === 'low' ? 0 : profile.riskTolerance === 'medium' ? 5 : 10;
      
      if (otherStablecoinsPercentage > maxAllowed) {
        const otherStablecoinsList = otherStablecoinsAllocation.map(s => `${s.token} (${Math.round(s.percentage)}%)`).join(', ');
        flags.push({
          type: profile.riskTolerance === 'low' ? 'red' : 'yellow',
          category: 'other_stablecoins',
          message: `⚠️ Exposição em Outras Stablecoins: ${otherStablecoinsPercentage.toFixed(1)}%${otherStablecoinsList ? ` - ${otherStablecoinsList}` : ''}`,
          actionable: `Você tem ${otherStablecoinsPercentage.toFixed(1)}% em stablecoins não-majors. Essas têm maior risco de depeg e menor liquidez que major stablecoins. Para maior segurança, considere migrar para major stablecoins. Se mantiver, limite a ${maxAllowed}% máximo e monitore de perto.`,
          severity: profile.riskTolerance === 'low' ? 4 : 2
        });
      } else if (otherStablecoinsPercentage > 0) {
        // Mesmo dentro do limite, alertar sobre o risco
        flags.push({
          type: 'yellow',
          category: 'other_stablecoins',
          message: `💡 Exposição em Outras Stablecoins: ${otherStablecoinsPercentage.toFixed(1)}%`,
          actionable: `Stablecoins não-majors têm maior risco de depeg e menor liquidez. Para maior segurança, considere migrar para major stablecoins.`,
          severity: 1
        });
      }
    }
    
    // Análise de altcoins (excluindo majors, major stablecoins E outras stablecoins)
    const altcoinsAllocation = allocation.filter(
      item => !MAJOR_COINS.includes(item.token) && 
              !DiagnosticService.MAJOR_STABLECOINS.includes(item.token) &&
              !OTHER_STABLECOINS.includes(item.token.toUpperCase())
    );
    
    const altcoinsTotal = altcoinsAllocation.reduce((sum, item) => sum + item.percentage, 0);
    
    // Altcoins: máximo 40% (mais se arrojado + curto prazo)
    const maxAltcoins = profile.riskTolerance === 'high' && profile.horizon === 'short' ? 60 : 40;
    
    if (altcoinsTotal > maxAltcoins) {
      flags.push({
        type: 'yellow',
        category: 'asset',
        message: `🎲 Alta Exposição em Altcoins: ${altcoinsTotal.toFixed(1)}% (excluindo majors e stables)`,
        actionable: `Máximo recomendado: ${maxAltcoins}% em altcoins. Considere rebalancear ${(altcoinsTotal - maxAltcoins).toFixed(0)}% para BTC/ETH/SOL.`,
        severity: altcoinsTotal > maxAltcoins * 1.5 ? 3 : 2
      });
    }
    
    // Análise de concentração setorial em ALTCOINS
    // IMPORTANTE: Excluir MEMECOINS desta análise (memecoins têm alerta próprio)
    // Só emitir alertas se houver pelo menos 2 altcoins OU se altcoins representam >20% do portfólio
    if (altcoinsAllocation.length > 0) {
      const altcoinsBySector: { [sector: string]: number } = {};
      const altcoinsByChain: { [chain: string]: number } = {};
      
      // Filtrar altcoins genuínos (excluindo memecoins)
      const genuineAltcoins = altcoinsAllocation.filter(item => {
        const sector = this.getTokenSector(item.token);
        return sector !== 'Meme';
      });
      
      const genuineAltcoinsTotal = genuineAltcoins.reduce((sum, item) => sum + item.percentage, 0);
      
      // CRITÉRIO IMPORTANTE: Só alertar se houver pelo menos 2 altcoins OU se representam >20% do portfólio
      const shouldAlertConcentration = genuineAltcoins.length >= 2 || genuineAltcoinsTotal > 20;
      
      if (shouldAlertConcentration) {
        genuineAltcoins.forEach(item => {
          const sector = this.getTokenSector(item.token);
          const tokenData = sectorsData[item.token as keyof typeof sectorsData];
          const chain = tokenData?.chain || 'Unknown';
          
          // Percentual dentro das altcoins genuínas, não do portfólio total
          const percentOfAltcoins = genuineAltcoinsTotal > 0 ? (item.percentage / genuineAltcoinsTotal) * 100 : 0;
          
          altcoinsBySector[sector] = (altcoinsBySector[sector] || 0) + percentOfAltcoins;
          altcoinsByChain[chain] = (altcoinsByChain[chain] || 0) + percentOfAltcoins;
        });
        
        // Alertar se >70% das altcoins genuínas em mesmo setor (threshold aumentado para 70%)
        Object.entries(altcoinsBySector).forEach(([sector, percentage]) => {
          if (percentage > 70 && sector !== 'Stablecoin') {
            flags.push({
              type: 'yellow',
              category: 'sector',
              message: `🎯 Concentração Setorial em Altcoins: ${percentage.toFixed(0)}% em ${sector} (excluindo BTC, ETH, SOL e stables)`,
              actionable: `⚠️ RISCO DE CORRELAÇÃO: Quando ${percentage.toFixed(0)}% ou mais das suas altcoins estão no mesmo setor, você está exposto a riscos sistêmicos específicos desse setor. Em momentos de stress de mercado, ativos correlacionados tendem a cair juntos, amplificando perdas. Diversifique em 2-3 setores descorrelacionados.`,
              severity: 2
            });
          }
        });
        
        // Análise de concentração por CHAIN (apenas para L1s/chains principais)
        // Agrupar por chain L1 (Ethereum, Solana, etc) - não por projetos individuais
        const altcoinsByL1Chain: { [chain: string]: number } = {};
        
        genuineAltcoins.forEach(item => {
          const tokenData = sectorsData[item.token as keyof typeof sectorsData];
          let l1Chain = tokenData?.chain || 'Unknown';
          
          // Mapear L2s para suas L1s correspondentes
          if (['Ethereum L2', 'Arbitrum', 'Optimism', 'Polygon', 'Mantle', 'Starknet'].includes(l1Chain)) {
            l1Chain = 'Ethereum'; // L2s são parte do ecossistema Ethereum
          }
          
          const percentOfAltcoins = genuineAltcoinsTotal > 0 ? (item.percentage / genuineAltcoinsTotal) * 100 : 0;
          altcoinsByL1Chain[l1Chain] = (altcoinsByL1Chain[l1Chain] || 0) + percentOfAltcoins;
        });
        
        // Alertar se >60% das altcoins em mesma L1 (exceto chains estabelecidas: Ethereum, Solana)
        // Chains estabelecidas têm threshold maior (>70%) pois são mais seguras
        Object.entries(altcoinsByL1Chain).forEach(([chain, percentage]) => {
          const establishedChains = ['Ethereum', 'Solana', 'Bitcoin', 'Multi-chain', 'Unknown'];
          const isEstablished = establishedChains.includes(chain);
          const threshold = isEstablished ? 70 : 60; // Chains estabelecidas: 70%, outras: 60%
          
          if (percentage > threshold && !['Multi-chain', 'Unknown'].includes(chain)) {
            flags.push({
              type: 'yellow',
              category: 'sector',
              message: `⛓️ Concentração em Chain: ${percentage.toFixed(0)}% das altcoins em ${chain}`,
              actionable: `Alta exposição à ${chain}. Considere diversificar em outras chains para reduzir risco de ecossistema.`,
              severity: 2
            });
          }
        });
      }
    }
    
    // Análise de horizonte temporal vs alocação
    this.analyzeHorizonAlignment(allocation, profile, flags);
    
    // ========================================================================
    // NOVA VALIDAÇÃO: CORRELAÇÃO DE ECOSSISTEMAS
    // ========================================================================
    
    this.validateEcosystemConcentration(allocation, profile, flags);
    
    // ========================================================================
    // NOVA VALIDAÇÃO: RENDA PASSIVA (se objetivo for passive_income)
    // ========================================================================
    
    if (profile.objective.includes('passive_income')) {
      this.validatePassiveIncomeStrategy(allocation, btcPercentage, profile, flags);
    }
    
    return flags.sort((a, b) => b.severity - a.severity);
  }

  // ============================================================================
  // VALIDAÇÃO: CORRELAÇÃO DE ECOSSISTEMAS
  // ============================================================================
  
  private validateEcosystemConcentration(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    profile: InvestorProfile,
    flags: DiagnosticFlag[]
  ): void {
    // Agrupar por ecosystem
    const ecosystemMap: { [ecosystem: string]: number } = {};
    
    allocation.forEach(item => {
      const ecosystem = this.getTokenEcosystem(item.token);
      if (ecosystem && ecosystem !== 'Unknown') {
        ecosystemMap[ecosystem] = (ecosystemMap[ecosystem] || 0) + item.percentage;
      }
    });
    
    Object.entries(ecosystemMap).forEach(([ecosystem, percentage]) => {
      // EXCEÇÃO: Bitcoin é ecossistema único - NÃO alertar sobre correlação
      // Alta concentração em Bitcoin é estratégia válida (já tratada em outro lugar)
      if (ecosystem === 'Bitcoin') {
        return; // Pular validação de correlação para Bitcoin
      }
      
      if (percentage > DiagnosticService.THRESHOLDS.ECOSYSTEM_CORRELATION_CRITICAL) {
        const mainAsset = ecosystem === 'Ethereum' ? 'ETH' : 
                         ecosystem === 'Solana' ? 'SOL' : 
                         ecosystem === 'Arbitrum' ? 'ETH' :
                         ecosystem === 'Optimism' ? 'ETH' :
                         ecosystem;
        
        const msg = DIAGNOSTIC_MESSAGES.concentration.ecosystem;
        flags.push({
          type: 'red',
          category: 'correlation',
          message: `${msg.title}: ${msg.message(percentage, ecosystem)}`,
          actionable: msg.actionable(percentage, ecosystem, mainAsset),
          severity: 4
        });
      } else if (percentage > DiagnosticService.THRESHOLDS.ECOSYSTEM_CORRELATION_WARNING) {
        flags.push({
          type: 'yellow',
          category: 'correlation',
          message: `⚠️ Concentração em Ecossistema: ${percentage.toFixed(1)}% em ${ecosystem}`,
          actionable: `Ativos do mesmo ecossistema tendem a se mover juntos. Considere diversificar em outros ecossistemas para reduzir correlação.`,
          severity: 2
        });
      }
    });
  }

  // ============================================================================
  // VALIDAÇÃO: RENDA PASSIVA
  // ============================================================================
  
  private validatePassiveIncomeStrategy(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    btcPercentage: number,
    profile: InvestorProfile,
    flags: DiagnosticFlag[]
  ): void {
    const STAKEABLE = DiagnosticService.STAKEABLE_ASSETS;
    const YIELD_STABLECOINS = DiagnosticService.MAJOR_STABLECOINS;
    
    const stakeablePercentage = allocation
      .filter(a => STAKEABLE.includes(a.token))
      .reduce((sum, a) => sum + a.percentage, 0);
    
    const yieldStablesPercentage = allocation
      .filter(a => YIELD_STABLECOINS.includes(a.token))
      .reduce((sum, a) => sum + a.percentage, 0);
    
    const totalYieldGenerating = stakeablePercentage + yieldStablesPercentage;
    
    // BTC não gera yield - alertar se >40% em BTC para objetivo de renda passiva
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
    
    // Validar se tem ativos suficientes geradores de yield
    if (totalYieldGenerating < DiagnosticService.THRESHOLDS.PASSIVE_INCOME_MIN_YIELD) {
      const msg = DIAGNOSTIC_MESSAGES.passive_income.insufficient_yield;
      flags.push({
        type: 'yellow',
        category: 'objective',
        message: `${msg.title}: ${msg.message(totalYieldGenerating)}`,
        actionable: msg.actionable(totalYieldGenerating, stakeablePercentage, yieldStablesPercentage),
        severity: 2
      });
    } else if (totalYieldGenerating >= DiagnosticService.THRESHOLDS.PASSIVE_INCOME_EXCELLENT_YIELD) {
      const msg = DIAGNOSTIC_MESSAGES.passive_income.excellent_yield;
      flags.push({
        type: 'green',
        category: 'objective',
        message: `${msg.title}: ${msg.message(totalYieldGenerating)}`,
        actionable: msg.actionable(stakeablePercentage, yieldStablesPercentage),
        severity: 0
      });
    }
  }

  private getExpectedStablecoinRange(riskTolerance: string, horizon?: string, objectives?: string[]): { min: number; max: number } {
    // Ajustar para objetivo "renda passiva" - permite mais stablecoins
    if (objectives && objectives.includes('passive_income')) {
      if (riskTolerance === 'low') {
        return { min: 20, max: 50 }; // Aumentado de 40% para 50%
      }
      if (riskTolerance === 'medium') {
        return { min: 15, max: 40 }; // Aumentado de 20% para 40%
      }
      // Arrojado com renda passiva
      return { min: 10, max: 30 }; // Aumentado de 10% para 30%
    }
    
    // Faixas padrão baseadas em tolerância ao risco
    if (riskTolerance === 'low') {
      // Conservador: 20-40%
      return { min: 20, max: 40 };
    }
    
    if (riskTolerance === 'medium') {
      // Moderado: 10-20%
      return { min: 10, max: 20 };
    }
    
    // Arrojado: 0-10%
    return { min: 0, max: 10 };
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
    const expectedStablecoinRange = this.getExpectedStablecoinRange(profile.riskTolerance, profile.horizon, profile.objective);
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
      'DeFi Tokens': 'DeFi tokens têm risco de rugs, variação de APY e exploits de protocol.',
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
    
    if (['BTC', 'ETH', 'SOL'].includes(token)) {
      return `Concentração em majors é menos arriscada, mas idealmente BTC+ETH+SOL juntos devem ser 40-100%. Diversifique entre os três.`;
    }
    
    if (sector === 'Meme') {
      const maxAllowed = risk === 'high' ? '20%' : risk === 'medium' ? '5%' : '0%';
      return `Memecoins são apostas especulativas. Para seu perfil, máximo ${maxAllowed}. Realize lucros e rebalanceie para ativos fundamentalmente sólidos.`;
    }
    
    if (risk === 'low') {
      return `Perfil conservador: Rebalanceie para 50-60% BTC/ETH/SOL, 20-30% stables, máximo 20% altcoins.`;
    }
    
    if (horizon === 'short') {
      return `Horizonte curto: Mantenha 60%+ em ativos líquidos (majors + stables) para facilitar saídas.`;
    }
    
    return `Altcoins não devem passar de 40% do portfólio. Distribua entre 5-8 ativos de qualidade em setores descorrelacionados.`;
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
    
    if (sector === 'Meme') {
      // Nunca deve chegar aqui pois Meme tem tratamento separado
      const maxAllowed = profile.riskTolerance === 'low' ? 0 : profile.riskTolerance === 'medium' ? 5 : 20;
      return `Perfil ${profile.riskTolerance === 'low' ? 'conservador' : profile.riskTolerance === 'medium' ? 'moderado' : 'arrojado'}: Distribua ${Math.round(percentage)}% para BTC/ETH/SOL/stables e mantenha no máximo ${maxAllowed}% em Meme.`;
    }
    
    if (profile.riskTolerance === 'low') {
      return `Perfil conservador: Distribua ${Math.round(percentage - 40)}% para BTC/ETH/stables e mantenha no máximo 40% em ${sector}.`;
    }
    
    return `Rebalanceie para no máximo 30-40% em ${sector} e diversifique em 2-3 setores adicionais.`;
  }
  
  private getStablecoinAdvice(current: number, expected: { min: number; max: number }, profile: InvestorProfile, isHighBTCConcentration: boolean = false): string {
    const diff = expected.min - current;
    
    // EXCEÇÃO: Se tem alta concentração em BTC (>80%), dar mensagem mais suave
    if (isHighBTCConcentration) {
      return `Sua alocação em BTC é excelente. Considere manter ${expected.min}% em stablecoins apenas para liquidez de emergências e oportunidades.`;
    }
    
    if (profile.riskTolerance === 'low') {
      return `Perfil conservador necessita colchão de segurança. Aumente stables para ${expected.min}% vendendo posições de maior risco.`;
    }
    
    if (profile.objective.includes('passive_income')) {
      return `Para renda passiva, mantenha ${expected.min}-${expected.max}% em major stablecoins gerando yield em protocolos estabelecidos.`;
    }
    
    if (profile.riskTolerance === 'high') {
      return `Mesmo em perfil arrojado, mantenha ${expected.min}-${expected.max}% em major stablecoins para gestão de risco e aproveitar oportunidades.`;
    }
    
    return `Aloque ${diff.toFixed(0)}% adicional em major stablecoins para gestão de risco e liquidez.`;
  }
  
  private getSuggestedAllocationByProfile(profile: InvestorProfile): string {
    if (profile.riskTolerance === 'low') {
      return 'BTC+ETH+SOL (50-70%), stables (20-30%), DeFi blue-chips (máx 10%)';
    }
    
    if (profile.riskTolerance === 'high' && profile.horizon === 'short') {
      return 'majors (40-50%), altcoins qualidade (30-40%), stables (10-20%)';
    }
    
    if (profile.riskTolerance === 'high' && profile.horizon === 'long') {
      return 'majors (40-50%), altcoins mid-cap (30-40%), stables (10-15%)';
    }
    
    if (profile.horizon === 'short') {
      return 'ativos líquidos: majors (50-60%) + stables (20-30%)';
    }
    
    if (profile.objective.includes('multiply')) {
      return 'majors (40-50%), altcoins selecionadas (30-40%), stables (10-15%)';
    }
    
    return 'majors (50-60%), altcoins qualidade (20-30%), stables (15-20%)';
  }
  
  private analyzeHorizonAlignment(
    allocation: (PortfolioAllocation & { tokenData?: TokenData })[],
    profile: InvestorProfile,
    flags: DiagnosticFlag[]
  ): void {
    const MAJOR_COINS = DiagnosticService.MAJOR_COINS;
    const STABLECOINS = DiagnosticService.MAJOR_STABLECOINS; // Apenas USDC, USDT, DAI
    
    const majorPercentage = allocation
      .filter(item => MAJOR_COINS.includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const stablePercentage = allocation
      .filter(item => STABLECOINS.includes(item.token))
      .reduce((sum, item) => sum + item.percentage, 0);
    
    const liquidPercentage = majorPercentage + stablePercentage;
    
    // Longo prazo arrojado pode ser mais agressivo
    if (profile.horizon === 'long' && majorPercentage > 80 && profile.riskTolerance === 'high') {
      flags.push({
        type: 'yellow',
        category: 'profile',
        message: `🎯 Oportunidade: Horizonte longo arrojado com ${majorPercentage.toFixed(0)}% em majors`,
        actionable: `Com 3+ anos de horizonte e perfil arrojado, considere alocar 20-40% em altcoins de qualidade para maior potencial de retorno.`,
        severity: 1
      });
    }
    
    // Análise de objetivo vs alocação - PRESERVAR CAPITAL
    if (profile.objective.includes('preserve')) {
      if (majorPercentage < 50) {
        flags.push({
          type: 'yellow',
          category: 'profile',
          message: `🛡️ Objetivo Preservação: Apenas ${majorPercentage.toFixed(0)}% em majors`,
          actionable: `Para preservar capital, priorize segurança sobre crescimento. Aloque 50-70% em BTC/ETH/SOL (com foco em BTC para menor volatilidade), 20-30% em major stablecoins (USDC/USDT/DAI/PYUSD) para liquidez e proteção, e máximo 20% em altcoins estabelecidos. Evite memecoins e projetos experimentais.`,
          severity: 2
        });
      }
      
      // Verificar altcoins acima de 20%
      const altcoinsTotal = allocation
        .filter(item => !DiagnosticService.MAJOR_COINS.includes(item.token) && 
                        !DiagnosticService.MAJOR_STABLECOINS.includes(item.token))
        .reduce((sum, item) => sum + item.percentage, 0);
      
      if (altcoinsTotal > 20) {
        flags.push({
          type: 'yellow',
          category: 'profile',
          message: `⚠️ Exposição em Altcoins acima do ideal para preservação`,
          actionable: `Com objetivo de preservar capital, limite altcoins a 20% máximo. Priorize projetos estabelecidos com alta liquidez e evite projetos novos ou de alto risco. Considere reduzir ${(altcoinsTotal - 20).toFixed(1)}% para majors/stables.`,
          severity: 2
        });
      }
      
      // Verificar memecoins (deve ser 0%)
      const memecoinsTotal = allocation
        .filter(item => {
          const sector = this.getTokenSector(item.token);
          return sector === 'Meme';
        })
        .reduce((sum, item) => sum + item.percentage, 0);
      
      if (memecoinsTotal > 0) {
        // Ao eliminar memecoins em perfil conservador, sugerir apenas majors e stables
        flags.push({
          type: 'red',
          category: 'profile',
          message: `🚨 Memecoins incompatíveis com preservação de capital`,
          actionable: `Memecoins são extremamente voláteis e especulativos. Para preservar capital, elimine 100% da exposição em memecoins e realoque em majors (BTC/ETH/SOL) ou stables.`,
          severity: 4
        });
      }
    }
    
    // Objetivo multiplicar capital - validação de distribuição
    if (profile.objective.includes('multiply')) {
      if (majorPercentage > 80 && profile.riskTolerance !== 'low') {
        flags.push({
          type: 'yellow',
          category: 'profile',
          message: `📈 Objetivo Multiplicação: ${majorPercentage.toFixed(0)}% em majors pode limitar upside`,
          actionable: `Para multiplicar capital, considere alocar 20-40% em altcoins de mid-cap com fundamentos sólidos.`,
          severity: 1
        });
      }
      
      // Validação de distribuição BTC vs ETH/SOL para multiplicar
      if (majorPercentage >= 40 && profile.riskTolerance === 'high') {
        const btcAlloc = allocation.find(item => item.token === 'BTC');
        const ethSolAlloc = allocation.filter(item => DiagnosticService.MAJOR_TIER_2.includes(item.token));
        const btcPct = btcAlloc?.percentage || 0;
        const ethSolPct = ethSolAlloc.reduce((sum, item) => sum + item.percentage, 0);
        
        // Para multiplicar em perfil arrojado, ETH/SOL devem ter mais peso
        if (majorPercentage > 0) {
          const ethSolRatio = (ethSolPct / majorPercentage) * 100;
          if (ethSolRatio < 40) {
            flags.push({
              type: 'yellow',
              category: 'profile',
              message: `📈 Distribuição para Multiplicação: BTC (${btcPct.toFixed(1)}%) vs ETH/SOL (${ethSolPct.toFixed(1)}%)`,
              actionable: `Para multiplicar capital com perfil arrojado, ETH/SOL devem ter peso maior (≥40% dos majors) devido ao maior potencial de crescimento. Considere aumentar exposição em ETH/SOL.`,
              severity: 2
            });
          }
        }
      }
    }
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
