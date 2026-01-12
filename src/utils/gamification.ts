import { PortfolioAllocation } from '../types/portfolio';

// ============================================
// SPIRIT ANIMAL (PERFIL DE INVESTIDOR)
// ============================================

export interface SpiritAnimal {
  id: string;
  emoji: string;
  name: string;
  description: string;
  criteria: string;
}

export const SPIRIT_ANIMALS: SpiritAnimal[] = [
  {
    id: 'turtle',
    emoji: '🐢',
    name: 'Tartaruga',
    description: 'Devagar e sempre. Você prioriza segurança acima de tudo.',
    criteria: 'Mais de 30% em stablecoins',
  },
  {
    id: 'lion',
    emoji: '🦁',
    name: 'Leão',
    description: 'O rei da selva crypto. Você aposta no líder do mercado.',
    criteria: 'Mais de 50% em BTC',
  },
  {
    id: 'fox',
    emoji: '🦊',
    name: 'Raposa',
    description: 'Esperto e versátil. Você acredita na inovação do Ethereum.',
    criteria: 'Mais de 40% em ETH',
  },
  {
    id: 'eagle',
    emoji: '🦅',
    name: 'Águia',
    description: 'Visão aguçada para oportunidades. Caçador de altcoins.',
    criteria: 'Mais de 40% em altcoins (exceto BTC/ETH)',
  },
  {
    id: 'shiba',
    emoji: '🐕',
    name: 'Shiba',
    description: 'Você gosta de viver perigosamente! Degen assumido.',
    criteria: 'Possui memecoins no portfólio',
  },
  {
    id: 'octopus',
    emoji: '🐙',
    name: 'Polvo',
    description: 'Tentáculos em todo lugar. Diversificação é seu lema.',
    criteria: 'Mais de 8 ativos diferentes',
  },
  {
    id: 'wolf',
    emoji: '🐺',
    name: 'Lobo',
    description: 'Estrategista nato. Equilíbrio perfeito entre risco e segurança.',
    criteria: 'Score acima de 85 com boa diversificação',
  },
  {
    id: 'phoenix',
    emoji: '🔥',
    name: 'Fênix',
    description: 'Renasce das cinzas. Heavy em SOL e projetos de recuperação.',
    criteria: 'Mais de 30% em SOL',
  },
];

const MEMECOINS = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'MEME', 'WOJAK', 'BRETT', 'POPCAT'];
const STABLECOINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'FRAX', 'LUSD'];

export function calculateSpiritAnimal(allocation: PortfolioAllocation[], score: number): SpiritAnimal {
  const btcPercent = allocation.find(a => a.token === 'BTC')?.percentage || 0;
  const ethPercent = allocation.find(a => a.token === 'ETH')?.percentage || 0;
  const solPercent = allocation.find(a => a.token === 'SOL')?.percentage || 0;
  
  const stablecoinPercent = allocation
    .filter(a => STABLECOINS.includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  
  const hasMemecoins = allocation.some(a => MEMECOINS.includes(a.token));
  
  const altcoinPercent = allocation
    .filter(a => !['BTC', 'ETH', ...STABLECOINS].includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);

  const numAssets = allocation.length;

  // Priority order for spirit animal selection
  if (numAssets >= 8) return SPIRIT_ANIMALS.find(a => a.id === 'octopus')!;
  if (hasMemecoins && altcoinPercent > 20) return SPIRIT_ANIMALS.find(a => a.id === 'shiba')!;
  if (stablecoinPercent >= 30) return SPIRIT_ANIMALS.find(a => a.id === 'turtle')!;
  if (btcPercent >= 50) return SPIRIT_ANIMALS.find(a => a.id === 'lion')!;
  if (ethPercent >= 40) return SPIRIT_ANIMALS.find(a => a.id === 'fox')!;
  if (solPercent >= 30) return SPIRIT_ANIMALS.find(a => a.id === 'phoenix')!;
  if (altcoinPercent >= 40) return SPIRIT_ANIMALS.find(a => a.id === 'eagle')!;
  if (score >= 85 && numAssets >= 4) return SPIRIT_ANIMALS.find(a => a.id === 'wolf')!;
  
  // Default to wolf if balanced
  return SPIRIT_ANIMALS.find(a => a.id === 'wolf')!;
}

// ============================================
// BADGES / ACHIEVEMENTS
// ============================================

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export function calculateBadges(allocation: PortfolioAllocation[], score: number, sectorCount: number): Badge[] {
  const btcPercent = allocation.find(a => a.token === 'BTC')?.percentage || 0;
  const stablecoinPercent = allocation
    .filter(a => STABLECOINS.includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  const hasMemecoins = allocation.some(a => MEMECOINS.includes(a.token));
  const altcoinPercent = allocation
    .filter(a => !['BTC', 'ETH', 'SOL', ...STABLECOINS].includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  const numAssets = allocation.length;

  return [
    {
      id: 'hodler',
      emoji: '🏅',
      name: 'Hodler de Ferro',
      description: '50%+ do portfólio em Bitcoin',
      unlocked: btcPercent >= 50,
    },
    {
      id: 'diversifier',
      emoji: '🎯',
      name: 'Diversificador Master',
      description: 'Exposição a 5+ setores diferentes',
      unlocked: sectorCount >= 5,
    },
    {
      id: 'diamond',
      emoji: '💎',
      name: 'Diamond Hands',
      description: '80%+ do portfólio em Bitcoin',
      unlocked: btcPercent >= 80,
    },
    {
      id: 'moon',
      emoji: '🌙',
      name: 'To the Moon',
      description: '30%+ em altcoins de alto potencial',
      unlocked: altcoinPercent >= 30,
    },
    {
      id: 'shield',
      emoji: '🛡️',
      name: 'Escudo de Aço',
      description: '20%+ em stablecoins para proteção',
      unlocked: stablecoinPercent >= 20,
    },
    {
      id: 'degen',
      emoji: '🎰',
      name: 'Degen Assumido',
      description: 'Possui pelo menos uma memecoin',
      unlocked: hasMemecoins,
    },
    {
      id: 'balance',
      emoji: '⚖️',
      name: 'Equilibrista',
      description: 'Score de aderência 90+',
      unlocked: score >= 90,
    },
    {
      id: 'visionary',
      emoji: '🔮',
      name: 'Visionário',
      description: '6+ ativos no portfólio',
      unlocked: numAssets >= 6,
    },
    {
      id: 'minimalist',
      emoji: '🎍',
      name: 'Minimalista',
      description: 'Apenas 3 ou menos ativos',
      unlocked: numAssets <= 3,
    },
  ];
}

// ============================================
// FOMO vs HODL METER
// ============================================

export interface FOMOMeter {
  percentage: number; // 0 = full HODL, 100 = full FOMO
  label: string;
  emoji: string;
  description: string;
}

export function calculateFOMOMeter(allocation: PortfolioAllocation[]): FOMOMeter {
  const btcPercent = allocation.find(a => a.token === 'BTC')?.percentage || 0;
  const ethPercent = allocation.find(a => a.token === 'ETH')?.percentage || 0;
  const stablecoinPercent = allocation
    .filter(a => STABLECOINS.includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  const memecoinPercent = allocation
    .filter(a => MEMECOINS.includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  const altcoinPercent = allocation
    .filter(a => !['BTC', 'ETH', ...STABLECOINS].includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);

  // Calculate FOMO score
  const hodlScore = btcPercent * 0.8 + ethPercent * 0.6 + stablecoinPercent * 1.0;
  const fomoScore = altcoinPercent * 0.7 + memecoinPercent * 1.5;
  
  const totalScore = hodlScore + fomoScore;
  const fomoPercentage = totalScore > 0 ? Math.round((fomoScore / totalScore) * 100) : 50;
  
  // Clamp between 5 and 95
  const clampedFomo = Math.max(5, Math.min(95, fomoPercentage));

  if (clampedFomo <= 20) {
    return {
      percentage: clampedFomo,
      label: '',
      emoji: '🧊',
      description: 'Você é frio como gelo. Paciência é sua maior virtude.',
    };
  } else if (clampedFomo <= 40) {
    return {
      percentage: clampedFomo,
      label: 'HODL Moderado',
      emoji: '❄️',
      description: 'Racional e calculista. Você não se deixa levar pela emoção.',
    };
  } else if (clampedFomo <= 60) {
    return {
      percentage: clampedFomo,
      label: 'Equilibrado',
      emoji: '⚖️',
      description: 'Você tem um pé na racionalidade, mas não resiste a uma oportunidade.',
    };
  } else if (clampedFomo <= 80) {
    return {
      percentage: clampedFomo,
      label: 'FOMO Moderado',
      emoji: '🌡️',
      description: 'O mercado te empolga! Você gosta de surfar as tendências.',
    };
  } else {
    return {
      percentage: clampedFomo,
      label: 'FOMO Total',
      emoji: '🔥',
      description: 'Degen mode ativado! Você vive no limite.',
    };
  }
}

// ============================================
// CELEBRITY COMPARISON
// ============================================

export interface CelebrityMatch {
  name: string;
  image: string;
  match: number;
  description: string;
  portfolio: string;
}

export function calculateCelebrityMatch(allocation: PortfolioAllocation[]): CelebrityMatch {
  const btcPercent = allocation.find(a => a.token === 'BTC')?.percentage || 0;
  const ethPercent = allocation.find(a => a.token === 'ETH')?.percentage || 0;
  const solPercent = allocation.find(a => a.token === 'SOL')?.percentage || 0;
  const bnbPercent = allocation.find(a => a.token === 'BNB')?.percentage || 0;
  const hasMemecoins = allocation.some(a => MEMECOINS.includes(a.token));
  const numAssets = allocation.length;

  // DeFi tokens check
  const defiTokens = ['UNI', 'AAVE', 'CRV', 'YFI', 'COMP', 'MKR', 'SNX', 'SUSHI', 'LDO', 'GMX'];
  const defiPercent = allocation
    .filter(a => defiTokens.includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  
  const altcoinPercent = allocation
    .filter(a => !['BTC', 'ETH', ...STABLECOINS].includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);

  const celebrities: CelebrityMatch[] = [
    {
      name: 'Michael Saylor',
      image: '/celebrities/saylor.jpg',
      match: 0,
      description: 'CEO da MicroStrategy. Bitcoin maximalist declarado.',
      portfolio: '100% Bitcoin, sem arrependimentos.',
    },
    {
      name: 'Vitalik Buterin',
      image: '/celebrities/vitalik.jpg',
      match: 0,
      description: 'Criador do Ethereum. Visionário e inovador.',
      portfolio: 'ETH + projetos DeFi e infraestrutura.',
    },
    {
      name: 'CZ (Changpeng Zhao)',
      image: '/celebrities/cz.jpg',
      match: 0,
      description: 'Fundador da Binance. Diversificação estratégica.',
      portfolio: 'BNB + portfólio diversificado de qualidade.',
    },
    {
      name: 'Arthur Hayes',
      image: '/celebrities/hayes.jpg',
      match: 0,
      description: 'Ex-CEO da BitMEX. Trader agressivo e ousado.',
      portfolio: 'BTC + altcoins com alavancagem mental.',
    },
    {
      name: 'Balaji Srinivasan',
      image: '/celebrities/balaji.jpg',
      match: 0,
      description: 'Ex-CTO da Coinbase. Visão macro e tech-heavy.',
      portfolio: 'Mix equilibrado de BTC, ETH e L1s promissoras.',
    },
    {
      name: 'Andre Cronje',
      image: '/celebrities/cronje.jpg',
      match: 0,
      description: 'Criador do Yearn Finance. DeFi degen original.',
      portfolio: 'Heavy DeFi: YFI, CRV, AAVE e experimentais.',
    },
    {
      name: 'Fernando Ulrich',
      image: '/celebrities/ulrich.jpg',
      match: 0,
      description: 'Economista e bitcoiner brasileiro. Educador influente.',
      portfolio: 'Bitcoin first, com pitada de ETH.',
    },
    {
      name: 'Guiriba',
      image: '', // Sem foto - usar fallback de iniciais
      match: 0,
      description: 'Trader brasileiro lendário. Performance e análise técnica.',
      portfolio: 'BTC + SOL + altcoins de momentum.',
    },
    {
      name: 'Chico',
      image: '', // Sem foto - usar fallback de iniciais
      match: 0,
      description: 'Influencer crypto brasileiro. Diversificado e estratégico.',
      portfolio: 'Mix de majors + gems de médio cap.',
    },
  ];

  // 0. Michael Saylor - Bitcoin maximalist
  if (btcPercent >= 80) {
    celebrities[0].match = 95;
  } else if (btcPercent >= 60) {
    celebrities[0].match = 75;
  } else if (btcPercent >= 40) {
    celebrities[0].match = 50;
  } else {
    celebrities[0].match = 20;
  }

  // 1. Vitalik Buterin - Ethereum + DeFi
  if (ethPercent >= 50) {
    celebrities[1].match = 90;
  } else if (ethPercent >= 30) {
    celebrities[1].match = 70;
  } else if (ethPercent >= 15) {
    celebrities[1].match = 45;
  } else {
    celebrities[1].match = 15;
  }

  // 2. CZ - BNB + diversificado
  if (bnbPercent >= 20 || (numAssets >= 5 && !hasMemecoins)) {
    celebrities[2].match = 80;
  } else if (numAssets >= 4) {
    celebrities[2].match = 55;
  } else {
    celebrities[2].match = 25;
  }

  // 3. Arthur Hayes - Trader agressivo
  if (altcoinPercent >= 50 && numAssets >= 4) {
    celebrities[3].match = 90;
  } else if (altcoinPercent >= 30) {
    celebrities[3].match = 65;
  } else if (btcPercent >= 50 && ethPercent >= 20) {
    celebrities[3].match = 50;
  } else {
    celebrities[3].match = 25;
  }

  // 4. Balaji - Mix equilibrado tech-heavy
  if (btcPercent >= 30 && ethPercent >= 20 && solPercent >= 10) {
    celebrities[4].match = 90;
  } else if (btcPercent >= 25 && ethPercent >= 15 && numAssets >= 4) {
    celebrities[4].match = 70;
  } else if (btcPercent >= 20 && ethPercent >= 10) {
    celebrities[4].match = 50;
  } else {
    celebrities[4].match = 25;
  }

  // 5. Andre Cronje - DeFi heavy
  if (defiPercent >= 30) {
    celebrities[5].match = 95;
  } else if (defiPercent >= 15) {
    celebrities[5].match = 70;
  } else if (ethPercent >= 40) {
    celebrities[5].match = 50;
  } else {
    celebrities[5].match = 15;
  }

  // 6. Fernando Ulrich - Bitcoin first
  if (btcPercent >= 70) {
    celebrities[6].match = 90;
  } else if (btcPercent >= 50 && ethPercent <= 20) {
    celebrities[6].match = 75;
  } else if (btcPercent >= 40) {
    celebrities[6].match = 55;
  } else {
    celebrities[6].match = 20;
  }

  // 7. Guiriba - BTC + SOL + momentum
  if (btcPercent >= 30 && solPercent >= 20) {
    celebrities[7].match = 90;
  } else if (solPercent >= 25) {
    celebrities[7].match = 75;
  } else if (btcPercent >= 40 && altcoinPercent >= 20) {
    celebrities[7].match = 60;
  } else {
    celebrities[7].match = 25;
  }

  // 8. Chico - Diversificado
  if (numAssets >= 5 && btcPercent >= 20 && ethPercent >= 15 && altcoinPercent >= 20) {
    celebrities[8].match = 90;
  } else if (numAssets >= 4 && btcPercent >= 15) {
    celebrities[8].match = 65;
  } else if (numAssets >= 3) {
    celebrities[8].match = 40;
  } else {
    celebrities[8].match = 20;
  }

  return celebrities.reduce((best, current) => 
    current.match > best.match ? current : best
  );
}

// ============================================
// TIME MACHINE
// ============================================

export interface TimeMachineScenario {
  date: string;
  label: string;
  emoji: string;
  description: string;
  multipliers: Record<string, number>;
}

const TIME_SCENARIOS: TimeMachineScenario[] = [
  {
    date: 'Janeiro 2021',
    label: 'Pré-Bull Run',
    emoji: '🚀',
    description: 'Antes da grande alta de 2021',
    multipliers: {
      BTC: 2.1, ETH: 3.5, SOL: 25.0, BNB: 4.0, ADA: 8.0, DOT: 3.0,
      DOGE: 50.0, SHIB: 500.0, AVAX: 15.0, MATIC: 20.0, LINK: 2.5,
      UNI: 3.0, AAVE: 2.0, DEFAULT: 5.0, STABLE: 1.0,
    },
  },
  {
    date: 'Novembro 2021',
    label: 'ATH (Topo Histórico)',
    emoji: '📉',
    description: 'No topo do mercado - pior momento para comprar',
    multipliers: {
      BTC: 0.6, ETH: 0.5, SOL: 0.35, BNB: 0.7, ADA: 0.25, DOT: 0.2,
      DOGE: 0.35, SHIB: 0.15, AVAX: 0.25, MATIC: 0.5, LINK: 0.4,
      UNI: 0.3, AAVE: 0.25, DEFAULT: 0.3, STABLE: 1.0,
    },
  },
  {
    date: 'Novembro 2022',
    label: 'Quebra da FTX',
    emoji: '💥',
    description: 'O colapso que abalou o mercado crypto',
    multipliers: {
      BTC: 2.8, ETH: 3.2, SOL: 12.0, BNB: 2.0, ADA: 1.8, DOT: 1.5,
      DOGE: 2.5, SHIB: 3.0, AVAX: 4.0, MATIC: 1.5, LINK: 3.0,
      UNI: 2.0, AAVE: 2.5, FTT: 0.02, DEFAULT: 2.5, STABLE: 1.0,
    },
  },
  {
    date: 'Janeiro 2023',
    label: 'Fundo do Bear',
    emoji: '🐻',
    description: 'No fundo do bear market - melhor momento',
    multipliers: {
      BTC: 2.5, ETH: 2.8, SOL: 8.0, BNB: 1.8, ADA: 1.5, DOT: 1.3,
      DOGE: 1.8, SHIB: 2.0, AVAX: 3.0, MATIC: 1.2, LINK: 2.5,
      UNI: 1.5, AAVE: 1.8, DEFAULT: 2.0, STABLE: 1.0,
    },
  },
  {
    date: 'Abril 2024',
    label: 'Halving do Bitcoin',
    emoji: '⛏️',
    description: 'No momento do 4º halving',
    multipliers: {
      BTC: 1.4, ETH: 1.3, SOL: 1.5, BNB: 1.2, ADA: 0.9, DOT: 0.8,
      DOGE: 1.1, SHIB: 0.9, AVAX: 1.2, MATIC: 0.7, LINK: 1.5,
      UNI: 1.0, AAVE: 1.3, DEFAULT: 1.2, STABLE: 1.0,
    },
  },
];

export interface TimeMachineResult {
  scenario: TimeMachineScenario;
  portfolioChange: number;
  wouldBe: string;
}

export function calculateTimeMachine(allocation: PortfolioAllocation[]): TimeMachineResult[] {
  return TIME_SCENARIOS.map(scenario => {
    let totalMultiplier = 0;
    
    allocation.forEach(asset => {
      const multiplier = STABLECOINS.includes(asset.token)
        ? scenario.multipliers.STABLE
        : scenario.multipliers[asset.token] || scenario.multipliers.DEFAULT;
      
      totalMultiplier += (asset.percentage / 100) * multiplier;
    });

    const changePercent = (totalMultiplier - 1) * 100;

    return {
      scenario,
      portfolioChange: changePercent,
      wouldBe: changePercent >= 0 
        ? `+${changePercent.toFixed(0)}%` 
        : `${changePercent.toFixed(0)}%`,
    };
  });
}

// ============================================
// MOTIVATIONAL PHRASES / ROASTS
// ============================================

export interface MotivationalPhrase {
  text: string;
  emoji: string;
}

const HIGH_SCORE_PHRASES: MotivationalPhrase[] = [
  { text: 'Warren Buffett estaria orgulhoso... se ele investisse em crypto.', emoji: '🎩' },
  { text: 'Seu portfólio está mais sólido que a convicção de um maximalista.', emoji: '💪' },
  { text: 'Você investe melhor que 90% dos influencers de crypto.', emoji: '📊' },
];

const MEDIUM_SCORE_PHRASES: MotivationalPhrase[] = [
  { text: 'Não está ruim, mas também não está no caminho da Lambo.', emoji: '🚗' },
  { text: 'Seu portfólio tem potencial, só precisa de uns ajustes.', emoji: '🔧' },
  { text: 'Bom começo! Agora é hora de refinar a estratégia.', emoji: '🎯' },
];

const LOW_SCORE_PHRASES: MotivationalPhrase[] = [
  { text: 'Seu portfólio precisa de terapia. Nós podemos ajudar.', emoji: '🛋️' },
  { text: 'Já considerou pedir conselhos para alguém que não seja do Twitter?', emoji: '🤔' },
  { text: 'Você está a uma rugpull de virar meme você mesmo.', emoji: '💀' },
  { text: 'Pelo menos você está aqui buscando ajuda. Isso já é alguma coisa!', emoji: '🆘' },
  { text: 'Seu portfólio parece que foi montado jogando dardos.', emoji: '🎯' },
];

const MEME_PHRASES: MotivationalPhrase[] = [
  { text: 'Você realmente gosta de viver perigosamente, né?', emoji: '🎰' },
  { text: 'Pelo menos você vai ter histórias incríveis para contar.', emoji: '📖' },
  { text: 'Degen mode: ATIVADO. Boa sorte, guerreiro.', emoji: '⚔️' },
];

export function getMotivationalPhrase(score: number, hasMemecoins: boolean, memecoinPercent: number): MotivationalPhrase {
  if (hasMemecoins && memecoinPercent >= 30) {
    return MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)];
  }

  if (score >= 80) {
    return HIGH_SCORE_PHRASES[Math.floor(Math.random() * HIGH_SCORE_PHRASES.length)];
  } else if (score >= 60) {
    return MEDIUM_SCORE_PHRASES[Math.floor(Math.random() * MEDIUM_SCORE_PHRASES.length)];
  } else {
    return LOW_SCORE_PHRASES[Math.floor(Math.random() * LOW_SCORE_PHRASES.length)];
  }
}
