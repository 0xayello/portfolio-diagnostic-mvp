import { PortfolioInput, ScoreReport } from './types';
import { computeSubscores } from './scorers';
import { weighted } from './math';
import { Weights } from './config';
import { comboMsgs, diversificationMsgs, horizonMsgs, objectiveMsgs, riskMsgs } from './messages';

export function scorePortfolio(input: PortfolioInput): ScoreReport {
  const subs = computeSubscores(input);

  const total = weighted([
    [subs.horizon,         Weights.horizon],
    [subs.risk,            Weights.risk],
    [subs.diversification, Weights.diversification],
    [subs.objective,       Weights.objective],
  ]);

  // Mensagens
  const msgs = [
    ...horizonMsgs(input.horizon, subs.horizon),
    ...riskMsgs(input.risk, subs.risk),
    ...diversificationMsgs(input.risk, subs.diversification),
    ...objectiveMsgs(input.objective, subs.objective),
    ...comboMsgs(input.horizon, input.risk, input.objective, subs),
  ];

  return {
    total,
    subscores: subs,
    messages: msgs,
  };
}

export * from './types';


