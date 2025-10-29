// Testes de fumaça (Vitest/Jest compatível)
import { describe, it, expect } from 'vitest';
import { scorePortfolio } from '../src/portfolioScore';
import { PortfolioInput } from '../src/portfolioScore/types';

const base: PortfolioInput = {
  horizon: 'long',
  risk: 'moderate',
  objective: 'preserve',
  numAssets: 7,
  assets: {
    btc: 40, eth: 25, sol: 10, stables: 15,
    top20Alt: 5, defi: 3, memeSmall: 2, other: 0,
  },
  sectors: { sectorIndex: 0.6 },
  staking: { stakeablePercent: 45 },
};

describe('portfolio score AV1', () => {
  it('computes a coherent long/moderate/preserve portfolio', () => {
    const r = scorePortfolio(base);
    expect(r.total).toBeGreaterThan(60);
    expect(r.subscores.horizon).toBeGreaterThan(60);
    expect(r.messages.length).toBeGreaterThan(0);
  });

  it('aggressive, short horizon, multiply objective', () => {
    const input: PortfolioInput = {
      ...base,
      horizon: 'short',
      risk: 'aggressive',
      objective: 'multiply',
      assets: {
        btc: 5, eth: 5, sol: 5, stables: 5,
        top20Alt: 20, defi: 30, memeSmall: 25, other: 5,
      },
      numAssets: 12,
      sectors: { sectorIndex: 0.9 },
      staking: { stakeablePercent: 20 },
    };
    const r = scorePortfolio(input);
    expect(r.subscores.risk).toBeGreaterThan(60);
    expect(r.subscores.objective).toBeGreaterThan(50);
  });
});


