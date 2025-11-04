/**
 * Utilitário para gerar links e formatar dados do CoinMarketCap
 */

// Mapeamento manual de símbolos para slugs do CoinMarketCap - 80+ tokens
const SYMBOL_TO_SLUG: { [symbol: string]: string } = {
  // Majors
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'bnb',
  XRP: 'xrp',
  ADA: 'cardano',
  
  // Stablecoins
  USDC: 'usd-coin',
  USDT: 'tether',
  USDD: 'usdd',
  DAI: 'multi-collateral-dai',
  BUSD: 'binance-usd',
  TUSD: 'trueusd',
  FDUSD: 'first-digital-usd',
  
  // Memecoins
  DOGE: 'dogecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  FLOKI: 'floki',
  BONK: 'bonk',
  WIF: 'dogwifcoin',
  BOME: 'book-of-meme',
  
  // Layer 1s
  ARB: 'arbitrum',
  OP: 'optimism-ethereum',
  MATIC: 'polygon',
  AVAX: 'avalanche',
  DOT: 'polkadot-new',
  ATOM: 'cosmos',
  TIA: 'celestia',
  SEI: 'sei',
  SUI: 'sui',
  APT: 'aptos',
  INJ: 'injective',
  NEAR: 'near-protocol',
  FTM: 'fantom',
  ALGO: 'algorand',
  
  // Layer 2s
  MNT: 'mantle',
  STRK: 'starknet',
  IMX: 'immutable-x',
  METIS: 'metis-token',
  
  // DeFi
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  LDO: 'lido-dao',
  CRV: 'curve-dao-token',
  MKR: 'maker',
  COMP: 'compound',
  SNX: 'synthetix-network-token',
  PENDLE: 'pendle',
  JTO: 'jito',
  ONDO: 'ondo-finance',
  JUP: 'jupiter-exchange-solana',
  RUNE: 'thorchain',
  GMX: 'gmx',
  DYDX: 'dydx',
  
  // Oracles
  PYTH: 'pyth-network',
  GRT: 'the-graph',
  BAND: 'band-protocol',
  
  // AI & Compute
  WLD: 'worldcoin',
  FET: 'fetch-ai',
  AGIX: 'singularitynet',
  RNDR: 'render-token',
  OCEAN: 'ocean-protocol',
  ARKM: 'arkham',
  
  // Storage
  FIL: 'filecoin',
  AR: 'arweave',
  
  // Gaming & NFT
  BLUR: 'blur',
  GALA: 'gala',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  AXS: 'axie-infinity',
  
  // Liquid Staking
  RPL: 'rocket-pool',
  ETHFI: 'ether-fi',
  
  // Exchanges
  HYPE: 'hyperliquid',
  
  // Others
  STX: 'stacks',
  ROSE: 'oasis-network',
};

/**
 * Gera o URL do CoinMarketCap para um token
 * @param symbol - Símbolo do token (ex: BTC, ETH)
 * @returns URL completo do CoinMarketCap
 */
export function getCoinMarketCapUrl(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  const slug = SYMBOL_TO_SLUG[upperSymbol] || symbol.toLowerCase();
  return `https://coinmarketcap.com/currencies/${slug}/`;
}

/**
 * Componente de link estilizado para tokens
 * @param symbol - Símbolo do token
 * @param className - Classes CSS adicionais
 * @returns JSX do link
 */
export function getTokenLink(symbol: string, className: string = ''): string {
  return getCoinMarketCapUrl(symbol);
}

/**
 * Gera HTML de link para usar em strings
 * @param symbol - Símbolo do token
 * @param displayText - Texto a ser exibido (opcional, usa symbol por padrão)
 * @returns String HTML do link
 */
export function getTokenLinkHtml(symbol: string, displayText?: string): string {
  const url = getCoinMarketCapUrl(symbol);
  const text = displayText || symbol;
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-violet-600 hover:text-violet-700 underline font-semibold">${text}</a>`;
}

