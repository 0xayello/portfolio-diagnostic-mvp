export const Weights = {
  horizon: 0.20,
  risk: 0.25,
  diversification: 0.25,
  objective: 0.15,
  // goodPractices: 0.15 (futuro)
} as const;

export const Targets = {
  // PONTO 1 — Perfil/Horizonte (usa BTC+ETH+SOL = BES)
  horizon: {
    short:  { targetBES: 20, slope: 1.5 }, // 100 - |BES-20| * 1.5
    mid:    { targetBES: 50, slope: 1.0 },
    long:   { targetBES: 80, slope: 0.8 },
  },

  // PONTO 2 — Risco (usa BTC + STABLES = BSC)
  risk: {
    conservative: { targetBSC: 80, slope: 1.2 },
    moderate:     { targetBSC: 50, slope: 1.0 },
    aggressive:   { targetBSC: 20, slope: 1.5 },
  },

  // PONTO 3 — Diversificação (usa core = BTC+ETH+SOL+STABLES, numAssets e sectorIndex)
  diversification: {
    conservative: {
      targetCore: 80, coreSlope: 1.0,
      sectorPenaltyFactor: 30, // penaliza diversificação excessiva
      numAssetsIdeal: 4, numAssetsSlope: 0, // sem penalização por nº de ativos no AV1
      base: 100,
    },
    moderate: {
      targetCore: 60, coreSlope: 0.8,
      numAssetsIdeal: 7, numAssetsSlope: 2,
      sectorPenaltyFactor: 0, // neutro
      base: 100,
    },
    aggressive: {
      targetCore: 30, coreSlope: 1.0,
      numAssetsIdeal: 10, numAssetsSlope: 1.5,
      sectorBonusFactor: 40, // 60 + sectorIndex*40
      base: 60,
    },
  },

  // PONTO 4 — Objetivo (usa BESS, stakeablePercent, highRisk)
  objective: {
    preserve: {
      targetBESS: 80, bessSlope: 1.0,
      highRiskPenaltyPerPct: 0.8,
    },
    income: {
      targetStake: 50, stakeSlope: 1.0,
      highRiskPenaltyPerPct: 0.5,
    },
    multiply: {
      targetHighRisk: 60, highRiskSlope: 1.0,
      bessPenaltyPerPct: 0.5,
    },
  },
} as const;

export const MessageThresholds = {
  high: 85,
  medium: 65,
  low: 45,
} as const;


