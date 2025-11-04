import React from 'react';
import { getCoinMarketCapUrl } from '../utils/coinmarketcap';

interface TokenLinkProps {
  symbol: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Componente que renderiza um link para a página do token no CoinMarketCap
 */
export function TokenLink({ symbol, className = '', children }: TokenLinkProps) {
  return (
    <a
      href={getCoinMarketCapUrl(symbol)}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-violet-600 hover:text-violet-700 underline font-semibold transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children || symbol}
    </a>
  );
}

/**
 * Renderiza um texto substituindo menções de tokens por links
 * Detecta padrões como: BTC, ETH, SOL, etc. (3-5 letras maiúsculas)
 */
export function TokenLinkedText({ text }: { text: string }) {
  // Lista de tokens comuns para identificar
  const commonTokens = [
    'BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'USDD', 'DAI', 'BUSD',
    'DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF',
    'ARB', 'OP', 'MATIC', 'AVAX', 'DOT', 'LINK',
    'UNI', 'AAVE', 'CRV', 'COMP', 'MKR', 'SNX',
    'LDO', 'RPL', 'JTO', 'PYTH', 'GRT', 'RNDR',
    'FIL', 'AR', 'INJ', 'SEI', 'SUI', 'APT',
    'TIA', 'BLUR', 'PENDLE', 'WLD', 'FET', 'AGIX',
    'JUP', 'ONDO', 'MNT', 'STX', 'RUNE', 'OCEAN',
    'IMX', 'GMX', 'HYPE'
  ];

  // Criar regex que procura por tokens (palavras em maiúsculas de 2-6 letras)
  const tokenRegex = new RegExp(`\\b(${commonTokens.join('|')})\\b`, 'g');
  
  const parts = text.split(tokenRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        // Se a parte é um token conhecido, renderiza como link
        if (commonTokens.includes(part)) {
          return <TokenLink key={index} symbol={part} />;
        }
        // Caso contrário, renderiza como texto normal
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default TokenLink;

