/**
 * Utilitário para gerar links e formatar dados do CoinMarketCap
 */

// Mapeamento manual de símbolos para slugs do CoinMarketCap
const SYMBOL_TO_SLUG: { [symbol: string]: string } = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDC: 'usd-coin',
  USDT: 'tether',
  USDD: 'usdd',
  DAI: 'multi-collateral-dai',
  BUSD: 'binance-usd',
  DOGE: 'dogecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  FLOKI: 'floki',
  BONK: 'bonk',
  WIF: 'dogwifcoin',
  ARB: 'arbitrum',
  OP: 'optimism-ethereum',
  MATIC: 'polygon',
  AVAX: 'avalanche',
  DOT: 'polkadot-new',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  CRV: 'curve-dao-token',
  COMP: 'compound',
  MKR: 'maker',
  SNX: 'synthetix-network-token',
  LDO: 'lido-dao',
  RPL: 'rocket-pool',
  JTO: 'jito',
  PYTH: 'pyth-network',
  GRT: 'the-graph',
  RNDR: 'render-token',
  FIL: 'filecoin',
  AR: 'arweave',
  INJ: 'injective',
  SEI: 'sei',
  SUI: 'sui',
  APT: 'aptos',
  TIA: 'celestia',
  BLUR: 'blur',
  PENDLE: 'pendle',
  WLD: 'worldcoin',
  FET: 'fetch-ai',
  AGIX: 'singularitynet',
  JUP: 'jupiter',
  ONDO: 'ondo-finance',
  MNT: 'mantle',
  STX: 'stacks',
  RUNE: 'thorchain',
  OCEAN: 'ocean-protocol',
  IMX: 'immutable-x',
  GMX: 'gmx',
  HYPE: 'hyperliquid',
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

