/**
 * SISTEMA DE REGRAS DE ADERÊNCIA - Portfolio Diagnostic
 * 
 * Sistema completo de validação de portfólio baseado em:
 * - Horizonte de Investimento (Curto/Médio/Longo Prazo)
 * - Tolerância ao Risco (Conservador/Moderado/Arrojado)
 * - Objetivos (Preservar Capital/Renda Passiva/Multiplicar Capital)
 */

import { InvestorProfile, PortfolioAllocation, DiagnosticFlag } from '../types/portfolio';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface RuleViolation {
  type: 'red' | 'yellow';
  category: string;
  message: string;
  actionable: string;
  severity: number; // 1-5 (5 = mais grave)
  penaltyPoints: number; // Pontos deduzidos do score
}

export interface AdherenceScore {
  totalScore: number; // 0-100
  level: 'high' | 'medium' | 'low';
  violations: RuleViolation[];
  summary: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MAJOR_COINS = ['BTC', 'ETH', 'SOL'];
const STABLECOINS = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FDUSD'];

// Pesos de penalidade por severidade
const PENALTY_WEIGHTS = {
  CRITICAL: 25,    // Severidade 5 - Red crítico
  RED_HIGH: 15,    // Severidade 4 - Red alto
  RED: 12,         // Severidade 3 - Red
  YELLOW_HIGH: 8,  // Severidade 2 - Yellow alto
  YELLOW: 3,       // Severidade 1 - Yellow
};

// ============================================================================
// REGRAS POR HORIZONTE DE INVESTIMENTO
// ============================================================================

export function getMemecoinsLimitByHorizon(horizon: string): number {
  switch (horizon) {
    case 'long': return 0;
    case 'medium': return 5;
    case 'short': return 20;
    default: return 5;
  }
}

export function getMajorsLimitByHorizon(horizon: string): { min: number; max: number } {
  switch (horizon) {
    case 'long': return { min: 40, max: 100 };
    case 'medium': return { min: 40, max: 100 }; // Médio prazo flexível
    case 'short': return { min: 40, max: 100 }; // Curto prazo mantém 40-100
    default: return { min: 40, max: 100 };
  }
}

export function getAltcoinsLimitByHorizon(horizon: string): number {
  switch (horizon) {
    case 'long': return 20;
    case 'medium': return 40;
    case 'short': return 60;
    default: return 40;
  }
}

// ============================================================================
// REGRAS POR TOLERÂNCIA AO RISCO
// ============================================================================

export function getMemecoinsLimitByRisk(risk: string): number {
  switch (risk) {
    case 'low': return 0;
    case 'medium': return 5;
    case 'high': return 20;
    default: return 5;
  }
}

export function getMajorsLimitByRisk(risk: string): { min: number; max: number } {
  switch (risk) {
    case 'low': return { min: 40, max: 100 };
    case 'medium': return { min: 40, max: 100 };
    case 'high': return { min: 40, max: 100 };
    default: return { min: 40, max: 100 };
  }
}

export function getAltcoinsLimitByRisk(risk: string): number {
  switch (risk) {
    case 'low': return 20;
    case 'medium': return 40;
    case 'high': return 60;
    default: return 40;
  }
}

export function getStablecoinsLimitByRisk(risk: string): { min: number; max: number } {
  switch (risk) {
    case 'low': return { min: 15, max: 40 };
    case 'medium': return { min: 10, max: 20 };
    case 'high': return { min: 5, max: 10 };
    default: return { min: 10, max: 20 };
  }
}

// ============================================================================
// REGRAS POR OBJETIVO
// ============================================================================

export function getMemecoinsLimitByObjective(objectives: string[]): number {
  if (objectives.includes('preserve')) return 0;
  if (objectives.includes('multiply')) return 20;
  return 0; // Renda passiva não interfere
}

export function getMajorsLimitByObjective(objectives: string[]): { min: number; max: number } {
  if (objectives.includes('preserve')) return { min: 50, max: 100 };
  if (objectives.includes('passive_income')) return { min: 40, max: 100 };
  if (objectives.includes('multiply')) return { min: 40, max: 80 };
  return { min: 40, max: 100 };
}

export function getAltcoinsLimitByObjective(objectives: string[]): number {
  if (objectives.includes('preserve')) return 20;
  if (objectives.includes('passive_income')) return 60;
  if (objectives.includes('multiply')) return 100;
  return 40;
}

export function getStablecoinsLimitByObjective(objectives: string[]): { min: number; max: number } {
  if (objectives.includes('preserve')) return { min: 15, max: 60 };
  if (objectives.includes('passive_income')) return { min: 10, max: 60 };
  if (objectives.includes('multiply')) return { min: 5, max: 15 };
  return { min: 10, max: 40 };
}

// ============================================================================
// CALCULADORA DE ADERÊNCIA
// ============================================================================

export class AdherenceCalculator {
  private violations: RuleViolation[] = [];

  constructor(
    private allocation: PortfolioAllocation[],
    private profile: InvestorProfile
  ) {}

  /**
   * Calcula o score de aderência (0-100)
   * Score inicial: 100
   * Penalidades progressivas por violação
   */
  public calculateScore(): AdherenceScore {
    this.violations = [];

    // Executar todas as validações
    this.validateMemecoins();
    this.validateMajors();
    this.validateAltcoins();
    this.validateStablecoins();
    this.validateNumberOfAssets();
    this.validateAssetConcentration();
    this.validateSectorConcentration();

    // Calcular score final
    const totalPenalty = this.violations.reduce((sum, v) => sum + v.penaltyPoints, 0);
    const totalScore = Math.max(0, Math.min(100, 100 - totalPenalty));
    
    // Determinar nível
    const level = this.getAdherenceLevel(totalScore);
    
    // Gerar resumo
    const summary = this.generateSummary(totalScore, level);

    return {
      totalScore,
      level,
      violations: this.violations,
      summary
    };
  }

  // ========================================================================
  // VALIDAÇÃO: MEMECOINS
  // ========================================================================

  private validateMemecoins(): void {
    const memecoins = this.allocation.filter(a => this.isMeme(a.token));
    const totalMemePercentage = memecoins.reduce((sum, a) => sum + a.percentage, 0);

    // Limites combinados (menor entre todos os critérios)
    const limitByRisk = getMemecoinsLimitByRisk(this.profile.riskTolerance);
    const limitByHorizon = getMemecoinsLimitByHorizon(this.profile.horizon);
    const limitByObjective = getMemecoinsLimitByObjective(this.profile.objective);
    
    const maxLimit = Math.min(limitByRisk, limitByHorizon, limitByObjective);

    // Verificar cada memecoin individual
    memecoins.forEach(meme => {
      const excess = meme.percentage - maxLimit;
      
      if (excess > 0) {
        // Conservador é mais rigoroso
        if (this.profile.riskTolerance === 'low' && meme.percentage > 0) {
          if (meme.percentage > 5) {
            this.addViolation({
              type: 'red',
              category: 'memecoins',
              message: `🎲 Exposição Crítica em Memecoin: ${meme.token} (${meme.percentage.toFixed(1)}%)`,
              actionable: `Perfil conservador NÃO deve ter memecoins. Elimine 100% da posição em ${meme.token}.`,
              severity: 4,
              penaltyPoints: PENALTY_WEIGHTS.RED_HIGH
            });
          } else {
            this.addViolation({
              type: 'yellow',
              category: 'memecoins',
              message: `⚠️ Exposição Baixa em Memecoin: ${meme.token} (${meme.percentage.toFixed(1)}%)`,
              actionable: `Perfil conservador deve evitar memecoins. Reduza exposição em ${meme.token} para 0%.`,
              severity: 2,
              penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
            });
          }
        } else {
          // Para outros perfis, verificar se excede mais de 10% do limite
          if (excess > maxLimit * 0.1) {
            this.addViolation({
              type: 'red',
              category: 'memecoins',
              message: `🚨 Exposição Alta em Memecoin: ${meme.token} (${meme.percentage.toFixed(1)}%)`,
              actionable: `Máximo recomendado: ${maxLimit}% para seu perfil. Reduza ${excess.toFixed(1)}% de ${meme.token}.`,
              severity: 3,
              penaltyPoints: PENALTY_WEIGHTS.RED
            });
          } else {
            this.addViolation({
              type: 'yellow',
              category: 'memecoins',
              message: `⚠️ Exposição Moderada em Memecoin: ${meme.token} (${meme.percentage.toFixed(1)}%)`,
              actionable: `Próximo do limite de ${maxLimit}%. Considere reduzir ${excess.toFixed(1)}% de ${meme.token}.`,
              severity: 2,
              penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
            });
          }
        }
      }
    });

    // Verificar total de memecoins
    if (totalMemePercentage > maxLimit * 1.5) {
      this.addViolation({
        type: 'red',
        category: 'memecoins',
        message: `🚨 Exposição Total Excessiva em Memecoins: ${totalMemePercentage.toFixed(1)}%`,
        actionable: `Total muito acima do limite de ${maxLimit}%. Reduza ${(totalMemePercentage - maxLimit).toFixed(1)}% em memecoins.`,
        severity: 4,
        penaltyPoints: PENALTY_WEIGHTS.RED_HIGH
      });
    } else if (totalMemePercentage > maxLimit) {
      this.addViolation({
        type: 'yellow',
        category: 'memecoins',
        message: `⚠️ Exposição Total Alta em Memecoins: ${totalMemePercentage.toFixed(1)}%`,
        actionable: `Limite recomendado: ${maxLimit}%. Considere reduzir ${(totalMemePercentage - maxLimit).toFixed(1)}%.`,
        severity: 3,
        penaltyPoints: PENALTY_WEIGHTS.RED
      });
    }
  }

  // ========================================================================
  // VALIDAÇÃO: MAJORS (BTC, ETH, SOL)
  // ========================================================================

  private validateMajors(): void {
    const majors = this.allocation.filter(a => MAJOR_COINS.includes(a.token));
    const totalMajorsPercentage = majors.reduce((sum, a) => sum + a.percentage, 0);

    // Limites combinados
    const limitByRisk = getMajorsLimitByRisk(this.profile.riskTolerance);
    const limitByHorizon = getMajorsLimitByHorizon(this.profile.horizon);
    const limitByObjective = getMajorsLimitByObjective(this.profile.objective);

    // Pegar o mínimo mais restritivo e máximo menos restritivo
    const minLimit = Math.max(limitByRisk.min, limitByHorizon.min, limitByObjective.min);
    const maxLimit = Math.min(limitByRisk.max, limitByHorizon.max, limitByObjective.max);

    // Verificar se está abaixo do mínimo
    if (totalMajorsPercentage < minLimit) {
      const deficit = minLimit - totalMajorsPercentage;
      
      if (this.profile.riskTolerance === 'low') {
        this.addViolation({
          type: 'red',
          category: 'majors',
          message: `🚨 Baixa Exposição em Majors: BTC+ETH+SOL = ${totalMajorsPercentage.toFixed(1)}%`,
          actionable: `Perfil conservador precisa de ${minLimit}%+ em majors. Aumente ${deficit.toFixed(1)}% em BTC/ETH/SOL.`,
          severity: 3,
          penaltyPoints: PENALTY_WEIGHTS.RED
        });
      } else {
        this.addViolation({
          type: 'yellow',
          category: 'majors',
          message: `⚠️ Baixa Exposição em Majors: BTC+ETH+SOL = ${totalMajorsPercentage.toFixed(1)}%`,
          actionable: `Ideal: ${minLimit}-${maxLimit}%. Considere aumentar ${deficit.toFixed(1)}% em BTC/ETH/SOL.`,
          severity: 2,
          penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
        });
      }
    }

    // Verificar se objetivo é multiplicar e tem muitos majors
    if (this.profile.objective.includes('multiply') && totalMajorsPercentage >= 80) {
      this.addViolation({
        type: 'yellow',
        category: 'majors',
        message: `💡 Alta Exposição em Majors: ${totalMajorsPercentage.toFixed(1)}% (Objetivo: Multiplicar)`,
        actionable: `Com objetivo de multiplicação, considere realocar 10-20% para altcoins de qualidade.`,
        severity: 1,
        penaltyPoints: PENALTY_WEIGHTS.YELLOW
      });
    }
  }

  // ========================================================================
  // VALIDAÇÃO: ALTCOINS
  // ========================================================================

  private validateAltcoins(): void {
    const altcoins = this.allocation.filter(a => 
      !MAJOR_COINS.includes(a.token) && 
      !STABLECOINS.includes(a.token) &&
      !this.isMeme(a.token)
    );
    const totalAltcoinsPercentage = altcoins.reduce((sum, a) => sum + a.percentage, 0);

    // Limites combinados (menor é mais restritivo)
    const limitByRisk = getAltcoinsLimitByRisk(this.profile.riskTolerance);
    const limitByHorizon = getAltcoinsLimitByHorizon(this.profile.horizon);
    const limitByObjective = getAltcoinsLimitByObjective(this.profile.objective);

    const maxLimit = Math.min(limitByRisk, limitByHorizon, limitByObjective);

    // Verificar excesso
    if (totalAltcoinsPercentage > maxLimit) {
      const excess = totalAltcoinsPercentage - maxLimit;

      // Conservador específico
      if (this.profile.riskTolerance === 'low') {
        if (totalAltcoinsPercentage > 40) {
          this.addViolation({
            type: 'red',
            category: 'altcoins',
            message: `🚨 Exposição Excessiva em Altcoins: ${totalAltcoinsPercentage.toFixed(1)}%`,
            actionable: `Perfil conservador: máximo ${maxLimit}%. Reduza ${excess.toFixed(1)}% para majors/stables.`,
            severity: 4,
            penaltyPoints: PENALTY_WEIGHTS.RED_HIGH
          });
        } else {
          this.addViolation({
            type: 'yellow',
            category: 'altcoins',
            message: `⚠️ Exposição Alta em Altcoins: ${totalAltcoinsPercentage.toFixed(1)}%`,
            actionable: `Próximo do limite conservador de ${maxLimit}%. Considere reduzir ${excess.toFixed(1)}%.`,
            severity: 2,
            penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
          });
        }
      } else {
        if (excess > maxLimit * 0.5) {
          this.addViolation({
            type: 'red',
            category: 'altcoins',
            message: `🚨 Exposição Muito Alta em Altcoins: ${totalAltcoinsPercentage.toFixed(1)}%`,
            actionable: `Máximo recomendado: ${maxLimit}%. Reduza ${excess.toFixed(1)}% para majors.`,
            severity: 3,
            penaltyPoints: PENALTY_WEIGHTS.RED
          });
        } else {
          this.addViolation({
            type: 'yellow',
            category: 'altcoins',
            message: `⚠️ Exposição Alta em Altcoins: ${totalAltcoinsPercentage.toFixed(1)}%`,
            actionable: `Limite: ${maxLimit}%. Considere reduzir ${excess.toFixed(1)}% para diversificar.`,
            severity: 2,
            penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
          });
        }
      }
    }
  }

  // ========================================================================
  // VALIDAÇÃO: STABLECOINS
  // ========================================================================

  private validateStablecoins(): void {
    const stables = this.allocation.filter(a => STABLECOINS.includes(a.token));
    const totalStablesPercentage = stables.reduce((sum, a) => sum + a.percentage, 0);

    // Limites combinados
    const limitByRisk = getStablecoinsLimitByRisk(this.profile.riskTolerance);
    const limitByObjective = getStablecoinsLimitByObjective(this.profile.objective);

    const minLimit = Math.max(limitByRisk.min, limitByObjective.min);
    const maxLimit = Math.min(limitByRisk.max, limitByObjective.max);

    // Zero stables é crítico
    if (totalStablesPercentage === 0) {
      this.addViolation({
        type: 'red',
        category: 'stablecoins',
        message: `🚨 Zero Stablecoins: Sem proteção de capital`,
        actionable: `CRÍTICO: Aloque ${minLimit}%+ em USDC/USDT para gerenciar volatilidade e liquidez.`,
        severity: 4,
        penaltyPoints: PENALTY_WEIGHTS.RED_HIGH
      });
      return;
    }

    // Abaixo do mínimo
    if (totalStablesPercentage < minLimit) {
      const deficit = minLimit - totalStablesPercentage;

      // Preservar Capital específico
      if (this.profile.objective.includes('preserve')) {
        if (totalStablesPercentage < 5) {
          this.addViolation({
            type: 'red',
            category: 'stablecoins',
            message: `🚨 Stablecoins Insuficientes: ${totalStablesPercentage.toFixed(1)}%`,
            actionable: `Objetivo preservar capital: mínimo ${minLimit}%. Aumente ${deficit.toFixed(1)}% em USDC.`,
            severity: 3,
            penaltyPoints: PENALTY_WEIGHTS.RED
          });
        } else {
          this.addViolation({
            type: 'yellow',
            category: 'stablecoins',
            message: `⚠️ Stablecoins Abaixo do Ideal: ${totalStablesPercentage.toFixed(1)}%`,
            actionable: `Para preservar capital: recomendado ${minLimit}%. Aumente ${deficit.toFixed(1)}%.`,
            severity: 2,
            penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
          });
        }
      } else if (this.profile.riskTolerance === 'low') {
        this.addViolation({
          type: 'red',
          category: 'stablecoins',
          message: `🚨 Stablecoins Insuficientes: ${totalStablesPercentage.toFixed(1)}%`,
          actionable: `Perfil conservador: mínimo ${minLimit}%. Aumente ${deficit.toFixed(1)}% em USDC/USDT.`,
          severity: 3,
          penaltyPoints: PENALTY_WEIGHTS.RED
        });
      } else {
        this.addViolation({
          type: 'yellow',
          category: 'stablecoins',
          message: `⚠️ Stablecoins Baixas: ${totalStablesPercentage.toFixed(1)}%`,
          actionable: `Recomendado: ${minLimit}-${maxLimit}%. Considere aumentar ${deficit.toFixed(1)}%.`,
          severity: 2,
          penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
        });
      }
    }

    // Acima do máximo (perda de potencial)
    if (totalStablesPercentage > maxLimit) {
      const excess = totalStablesPercentage - maxLimit;
      
      this.addViolation({
        type: 'yellow',
        category: 'stablecoins',
        message: `💡 Excesso de Stablecoins: ${totalStablesPercentage.toFixed(1)}%`,
        actionable: `Perdendo potencial de valorização. Realoque ${excess.toFixed(1)}% em BTC/ETH ou altcoins.`,
        severity: 1,
        penaltyPoints: PENALTY_WEIGHTS.YELLOW
      });
    }
  }

  // ========================================================================
  // VALIDAÇÃO: NÚMERO DE ATIVOS
  // ========================================================================

  private validateNumberOfAssets(): void {
    const numAssets = this.allocation.length;
    const majors = this.allocation.filter(a => MAJOR_COINS.includes(a.token));
    const totalMajorsPercentage = majors.reduce((sum, a) => sum + a.percentage, 0);

    // Ideal: 4-8 ativos (1-3 se for apenas majors com 70%+)
    if (numAssets < 4) {
      if (totalMajorsPercentage >= 70) {
        // OK: poucos ativos mas são majors
        return;
      } else {
        this.addViolation({
          type: 'red',
          category: 'diversification',
          message: `🚨 Portfólio Concentrado: ${numAssets} ativo${numAssets > 1 ? 's' : ''} (${totalMajorsPercentage.toFixed(0)}% em majors)`,
          actionable: `Com poucos ativos, concentre 70%+ em BTC/ETH/SOL ou diversifique para 5-8 ativos.`,
          severity: 4,
          penaltyPoints: PENALTY_WEIGHTS.RED_HIGH
        });
      }
    } else if (numAssets >= 8 && numAssets <= 15) {
      // Moderado para perfis médio/arrojado e curto/médio prazo
      if (this.profile.riskTolerance === 'low' || this.profile.horizon === 'long') {
        this.addViolation({
          type: 'yellow',
          category: 'diversification',
          message: `⚠️ Muitos Ativos: ${numAssets} ativos para perfil ${this.profile.riskTolerance}`,
          actionable: `Perfis conservadores/longo prazo funcionam melhor com 5-8 ativos bem selecionados.`,
          severity: 1,
          penaltyPoints: PENALTY_WEIGHTS.YELLOW
        });
      }
    } else if (numAssets > 15) {
      this.addViolation({
        type: 'yellow',
        category: 'diversification',
        message: `⚠️ Over-diversification: ${numAssets} ativos`,
        actionable: `Muitos ativos diluem performance. Concentre em 8-12 posições de alta convicção.`,
        severity: 2,
        penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
      });
    }
  }

  // ========================================================================
  // VALIDAÇÃO: CONCENTRAÇÃO EM UM ÚNICO ATIVO
  // ========================================================================

  private validateAssetConcentration(): void {
    this.allocation.forEach(asset => {
      const isMajor = MAJOR_COINS.includes(asset.token);
      const isStable = STABLECOINS.includes(asset.token);

      if (!isMajor && !isStable) {
        // Ativos não-majors
        if (asset.percentage >= 30) {
          this.addViolation({
            type: 'red',
            category: 'concentration',
            message: `🚨 Concentração Crítica: ${asset.token} (${asset.percentage.toFixed(1)}%)`,
            actionable: `AÇÃO URGENTE: Reduza para máximo 20%. Distribua ${(asset.percentage - 20).toFixed(1)}% em outros ativos.`,
            severity: 4,
            penaltyPoints: PENALTY_WEIGHTS.RED_HIGH
          });
        } else if (asset.percentage >= 20) {
          this.addViolation({
            type: 'yellow',
            category: 'concentration',
            message: `⚠️ Concentração Alta: ${asset.token} (${asset.percentage.toFixed(1)}%)`,
            actionable: `Reduza para 10-15% e diversifique em ativos menos correlacionados.`,
            severity: 2,
            penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
          });
        }
      }
    });
  }

  // ========================================================================
  // VALIDAÇÃO: CONCENTRAÇÃO SETORIAL
  // ========================================================================

  private validateSectorConcentration(): void {
    // Calcular altcoins (excluindo majors e stables)
    const altcoins = this.allocation.filter(a => 
      !MAJOR_COINS.includes(a.token) && 
      !STABLECOINS.includes(a.token)
    );
    const totalAltcoins = altcoins.reduce((sum, a) => sum + a.percentage, 0);

    if (totalAltcoins < 10) return; // Não relevante se tem pouca altcoin

    // Agrupar por setor (simplificado - você pode expandir)
    const sectorMap: { [sector: string]: number } = {};
    altcoins.forEach(a => {
      const sector = this.getTokenSector(a.token);
      sectorMap[sector] = (sectorMap[sector] || 0) + a.percentage;
    });

    // Verificar concentração em setor
    Object.entries(sectorMap).forEach(([sector, percentage]) => {
      const percentOfAltcoins = (percentage / totalAltcoins) * 100;

      if (percentOfAltcoins >= 40) {
        this.addViolation({
          type: 'red',
          category: 'sector',
          message: `🚨 Concentração Setorial: ${percentOfAltcoins.toFixed(0)}% das altcoins em ${sector}`,
          actionable: `Reduza concentração em ${sector}. Diversifique em outros setores.`,
          severity: 3,
          penaltyPoints: PENALTY_WEIGHTS.RED
        });
      } else if (percentOfAltcoins >= 30) {
        this.addViolation({
          type: 'yellow',
          category: 'sector',
          message: `⚠️ Concentração Moderada: ${percentOfAltcoins.toFixed(0)}% das altcoins em ${sector}`,
          actionable: `Considere diversificar em outros setores para reduzir correlação.`,
          severity: 2,
          penaltyPoints: PENALTY_WEIGHTS.YELLOW_HIGH
        });
      }
    });
  }

  // ========================================================================
  // MÉTODOS AUXILIARES
  // ========================================================================

  private addViolation(violation: RuleViolation): void {
    this.violations.push(violation);
  }

  private isMeme(token: string): boolean {
    const memecoins = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME'];
    return memecoins.includes(token.toUpperCase());
  }

  private getTokenSector(token: string): string {
    // Simplificado - expandir com sectors.json
    const sectorMap: { [key: string]: string } = {
      ARB: 'Layer 2', OP: 'Layer 2', MNT: 'Layer 2',
      UNI: 'DeFi', AAVE: 'DeFi', CRV: 'DeFi', LDO: 'DeFi',
      LINK: 'Oracle', PYTH: 'Oracle', GRT: 'Oracle',
      WLD: 'AI', FET: 'AI', AGIX: 'AI', RNDR: 'AI',
    };
    return sectorMap[token.toUpperCase()] || 'Others';
  }

  private getAdherenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  private generateSummary(score: number, level: string): string {
    const redFlags = this.violations.filter(v => v.type === 'red').length;
    const yellowFlags = this.violations.filter(v => v.type === 'yellow').length;

    if (level === 'high') {
      return `Seu portfólio tem boa diversificação e aderência moderada ao perfil, mas apresenta ${redFlags} alerta${redFlags !== 1 ? 's' : ''} crítico${redFlags !== 1 ? 's' : ''} e ${yellowFlags} ponto${yellowFlags !== 1 ? 's' : ''} de atenção.`;
    } else if (level === 'medium') {
      return `Seu portfólio tem aderência moderada ao perfil, mas está exposto demais a altcoins e com baixa liquidez para curto prazo.`;
    } else {
      return `Seu portfólio apresenta baixa aderência ao perfil, com múltiplos alertas críticos. Rebalanceamento urgente recomendado.`;
    }
  }
}

