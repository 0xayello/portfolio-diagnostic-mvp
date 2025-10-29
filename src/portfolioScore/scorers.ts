import { PortfolioInput, Subscores } from './types';
import { clamp, absDiff, norm } from './math';
import { Targets as T } from './config';

export function scoreHorizon(input: PortfolioInput): number {
  const { horizon, assets } = input;
  const BES = assets.btc + assets.eth + assets.sol; // 0..100
  const cfg = T.horizon[horizon];
  const raw = 100 - absDiff(BES, cfg.targetBES) * cfg.slope;
  return norm(clamp(raw));
}

export function scoreRisk(input: PortfolioInput): number {
  const { risk, assets } = input;
  const BSC = assets.btc + assets.stables; // 0..100
  const cfg = T.risk[risk];
  const raw = 100 - absDiff(BSC, cfg.targetBSC) * cfg.slope;
  return norm(clamp(raw));
}

export function scoreDiversification(input: PortfolioInput): number {
  const { risk, assets, numAssets, sectors } = input;
  const core = assets.btc + assets.eth + assets.sol + assets.stables; // 0..100
  const cfg = T.diversification[risk];
  const sectorIndex = sectors?.sectorIndex ?? 0.5; // neutro se não informado

  if (risk === 'conservative') {
    // 100 - |core-80|*1.0 - (sectorIndex*30)
    const coreTerm = 100 - absDiff(core, cfg.targetCore) * cfg.coreSlope;
    const sectorPenalty = (sectorIndex || 0) * (cfg.sectorPenaltyFactor || 0);
    const raw = coreTerm - sectorPenalty;
    return norm(clamp(raw));
  }

  if (risk === 'moderate') {
    // 100 - |core-60|*0.8 - |numAssets-7|*2
    const coreTerm = 100 - absDiff(core, cfg.targetCore) * cfg.coreSlope;
    const numPenalty = Math.abs(numAssets - cfg.numAssetsIdeal) * (cfg.numAssetsSlope || 0);
    const raw = coreTerm - numPenalty;
    return norm(clamp(raw));
  }

  // aggressive:
  // (60 + sectorIndex*40) - |core-30|*1.0 - |numAssets-10|*1.5
  const sectorBonus = (sectorIndex || 0) * (cfg.sectorBonusFactor || 0);
  const base = (cfg.base || 0) + sectorBonus;
  const corePenalty = absDiff(core, cfg.targetCore) * cfg.coreSlope;
  const numPenalty = Math.abs(numAssets - cfg.numAssetsIdeal) * (cfg.numAssetsSlope || 0);
  const raw = base - corePenalty - numPenalty;
  return norm(clamp(raw));
}

export function scoreObjective(input: PortfolioInput): number {
  const { objective, assets, staking } = input;
  const BESS = assets.btc + assets.eth + assets.sol + assets.stables;
  const highRisk = assets.memeSmall; // AV1: usar memeSmall como proxy high risk
  const stakeable = staking.stakeablePercent;

  if (objective === 'preserve') {
    // 100 - |BESS - 80|*1.0 - (highRisk*0.8)
    const raw = 100 - absDiff(BESS, T.objective.preserve.targetBESS) * T.objective.preserve.bessSlope
                - (highRisk * T.objective.preserve.highRiskPenaltyPerPct);
    return norm(clamp(raw));
  }

  if (objective === 'income') {
    // 100 - |stake - 50|*1.0 - (highRisk*0.5)
    const raw = 100 - absDiff(stakeable, T.objective.income.targetStake) * T.objective.income.stakeSlope
                - (highRisk * T.objective.income.highRiskPenaltyPerPct);
    return norm(clamp(raw));
  }

  // multiply:
  // 100 - |highRisk - 60|*1.0 - (BESS*0.5)
  const raw = 100 - absDiff(highRisk, T.objective.multiply.targetHighRisk) * T.objective.multiply.highRiskSlope
              - (BESS * T.objective.multiply.bessPenaltyPerPct);
  return norm(clamp(raw));
}

export function computeSubscores(input: PortfolioInput): Subscores {
  return {
    horizon:          scoreHorizon(input),
    risk:             scoreRisk(input),
    diversification:  scoreDiversification(input),
    objective:        scoreObjective(input),
  };
}


