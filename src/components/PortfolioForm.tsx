import React, { useState, useEffect } from 'react';
import { PortfolioAllocation, AutocompleteOption } from '../types/portfolio';

interface PortfolioFormProps {
  initialAllocation: PortfolioAllocation[];
  onSubmit: (allocation: PortfolioAllocation[]) => void;
}

const PREDEFINED_TOKENS = ['BTC', 'ETH', 'SOL', 'USDC'];

export default function PortfolioForm({ initialAllocation, onSubmit }: PortfolioFormProps) {
  const [allocation, setAllocation] = useState<PortfolioAllocation[]>(initialAllocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AutocompleteOption[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [tokenImages, setTokenImages] = useState<Record<string, string>>({});
  const FALLBACK_LOGOS: Record<string, string> = {
    BTC: 'https://cryptoicons.org/api/icon/btc/64',
    ETH: 'https://cryptoicons.org/api/icon/eth/64',
    SOL: 'https://cryptoicons.org/api/icon/sol/64',
    USDC: 'https://cryptoicons.org/api/icon/usdc/64',
    USDT: 'https://cryptoicons.org/api/icon/usdt/64'
  };

  useEffect(() => {
    const total = allocation.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(total);
  }, [allocation]);

  // Sincroniza quando a prop initialAllocation mudar (ex.: inicialização pelo parent)
  useEffect(() => {
    if (initialAllocation && initialAllocation.length > 0) {
      setAllocation(initialAllocation);
    }
  }, [initialAllocation]);

  // Buscar imagens dos tokens visíveis usando a API de busca (CoinGecko)
  useEffect(() => {
    const loadImages = async () => {
      const symbolsToFetch = allocation
        .map(a => a.token.toUpperCase())
        .filter(sym => !tokenImages[sym]);
      for (const sym of symbolsToFetch) {
        try {
          const resp = await fetch(`/api/search-coins?q=${encodeURIComponent(sym)}`);
          const data: AutocompleteOption[] = await resp.json();
          const match = data.find(d => d.symbol.toUpperCase() === sym);
          if (match?.image) {
            setTokenImages(prev => ({ ...prev, [sym]: match.image! }));
          }
        } catch {}
      }
    };
    loadImages();
  }, [allocation]);

  const handlePercentageChange = (token: string, percentage: number) => {
    setAllocation(prev => 
      prev.map(item => 
        item.token === token 
          ? { ...item, percentage: Math.max(0, Math.min(100, percentage)) }
          : item
      )
    );
  };

  const sanitizeNumber = (value: string) => {
    const normalized = value.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search-coins?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Error searching coins:', error);
      setSearchResults([]);
    }
  };

  const addToken = (token: string) => {
    if (!allocation.find(item => item.token === token)) {
      setAllocation(prev => [...prev, { token, percentage: 0 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const removeToken = (token: string) => {
    // Permitir remover QUALQUER token, inclusive os pré-definidos
    setAllocation(prev => prev.filter(item => item.token !== token));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      alert('A soma das porcentagens deve ser exatamente 100%');
      return;
    }

    onSubmit(allocation);
  };

  const distributeEvenly = () => {
    const count = allocation.length;
    if (count === 0) return;
    const even = Math.floor((100 / count) * 10) / 10;
    const remainder = Math.round((100 - even * count) * 10) / 10;
    const updated = allocation.map((item, idx) => ({
      ...item,
      percentage: idx === 0 ? even + remainder : even,
    }));
    setAllocation(updated);
  };

  return (
    <div className="glass-card rounded-3xl shadow-2xl p-8 card-hover">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Configure sua Alocação
        </h2>
        <p className="text-gray-600">
          Ajuste as porcentagens de cada ativo no seu portfólio
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 text-center">
        {/* Token Allocation */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allocation.map((item, idx) => (
            <div key={item.token} className="relative group">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-violet-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <img
                      src={tokenImages[item.token.toUpperCase()] || FALLBACK_LOGOS[item.token.toUpperCase()]}
                      alt={`${item.token} logo`}
                      className="relative w-12 h-12 rounded-full object-contain bg-white p-1.5 shadow-lg ring-2 ring-gray-200 group-hover:ring-violet-400 transition-all duration-300"
                      onError={(e) => {
                        const sym = item.token.toUpperCase();
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGOS[sym] || '';
                      }}
                    />
                  </div>
                  <label className="text-sm font-bold text-gray-800 tracking-wide">
                    {item.token}
                  </label>
                  <div className="relative w-full">
                    <input
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      placeholder="0"
                      value={item.percentage === 0 ? '' : item.percentage}
                      onChange={(e) => handlePercentageChange(item.token, sanitizeNumber(e.target.value))}
                      onBlur={(e) => { if (e.currentTarget.value === '') handlePercentageChange(item.token, 0); }}
                      className="w-full pr-8 pl-4 py-2.5 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-300"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm font-medium">%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeToken(item.token)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                  aria-label={`Remover ${item.token}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Add Token Search */}
        <div className="relative">
          <button
            type="button"
            onClick={async () => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                try {
                  const resp = await fetch('/api/search-coins?top=true');
                  const data = await resp.json();
                  setSearchResults(data);
                } catch {}
              }
            }}
            className="mx-auto group flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all duration-300"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Adicionar outro ativo</span>
          </button>
          
          {showSearch && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-4 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-slide-down">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b-2 border-gray-200">
                <input
                  type="text"
                  placeholder="🔍 Digite o símbolo do token..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-300"
                  autoFocus
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {searchResults.map((option) => (
                      <button
                        key={option.symbol}
                        type="button"
                        onClick={() => addToken(option.symbol)}
                        className="p-3 text-left hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-violet-200 group"
                      >
                        <div className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{option.symbol}</div>
                        <div className="text-sm text-gray-600 truncate">{option.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-8 text-gray-500 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Nenhum token encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total Percentage */}
        <div className="mx-auto max-w-md">
          <div className={`flex justify-between items-center p-6 rounded-2xl transition-all duration-300 ${
            Math.abs(totalPercentage - 100) < 0.1 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300'
          }`}>
            <span className="font-bold text-gray-800 text-lg">Total:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-3xl ${
                Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalPercentage.toFixed(1)}%
              </span>
              {Math.abs(totalPercentage - 100) < 0.1 ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Ações removidas conforme solicitado */}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={Math.abs(totalPercentage - 100) > 0.1}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
          Continuar para Quiz de Perfil
        </button>
      </form>
    </div>
  );
}
