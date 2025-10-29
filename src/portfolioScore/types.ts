export type Horizon = 'short' | 'mid' | 'long';
export type Risk = 'conservative' | 'moderate' | 'aggressive';
export type Objective = 'preserve' | 'income' | 'multiply';

export interface AssetBreakdown {
  btc: number;        // % do portfólio (0-100)
  eth: number;
  sol: number;
  stables: number;    // somar todas stables
  top20Alt: number;   // altcoins fora BTC/ETH/SOL dentro do top 20
  defi: number;       // DeFi/risk assets (pode sobrepor top20Alt no AV1 se não tiver granularidade)
  memeSmall: number;  // small caps / memecoins / high risk
  other: number;      // tudo que não encaixar nas acima
}

export interface SectorDiversification {
  // índice 0..1: 0 = tudo num setor; 1 = bem distribuído
  // AV1: pode vir calculado externamente ou estimado pelo nº de setores distintos > 5
  sectorIndex: number;
}

export interface StakingInfo {
  // % do portfólio em tokens com staking/yield sólido e líquido (ETH/SOL/ATOM/AVAX etc.)
  stakeablePercent: number; // 0-100
}

export interface PortfolioInput {
  horizon: Horizon;
  risk: Risk;
  objective: Objective;
  assets: AssetBreakdown;
  numAssets: number;                 // nº de ativos distintos
  sectors: SectorDiversification;
  staking: StakingInfo;
}

export interface Subscores {
  horizon: number;       // 0-100
  risk: number;          // 0-100
  diversification: number;// 0-100
  objective: number;     // 0-100
}

export interface WeightedScore {
  total: number;         // 0-100
  subscores: Subscores;
}

export interface ScoreReport extends WeightedScore {
  messages: string[];    // diagnóstico textual automático
}


