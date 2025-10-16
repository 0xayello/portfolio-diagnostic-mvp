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
    if (!PREDEFINED_TOKENS.includes(token)) {
      setAllocation(prev => prev.filter(item => item.token !== token));
    }
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
    <div className="bg-[#27224e] text-white rounded-lg shadow-lg p-6 card-hover">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Configure sua Alocação de Portfólio
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 text-center">
        {/* Token Allocation */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allocation.map((item) => (
            <div key={item.token} className="relative flex items-center space-x-4 p-4 bg-[#2ce699] rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#27224e] mb-2 flex items-center justify-center space-x-2">
                  {tokenImages[item.token.toUpperCase()] && (
                    <img src={tokenImages[item.token.toUpperCase()]} alt={`${item.token} logo`} className="w-6 h-6 rounded-full object-contain" />
                  )}
                  <span>{item.token}</span>
                </label>
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <input
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      placeholder="0"
                      value={item.percentage === 0 ? '' : item.percentage}
                      onChange={(e) => handlePercentageChange(item.token, sanitizeNumber(e.target.value))}
                      onBlur={(e) => { if (e.currentTarget.value === '') handlePercentageChange(item.token, 0); }}
                      className="w-24 pr-8 pl-3 py-2 text-sm border border-[#27224e]/30 rounded-md focus:ring-2 focus:ring-[#27224e] focus:border-transparent text-center text-[#27224e] bg-white placeholder-gray-400"
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-[#27224e] text-sm">%</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToken(item.token)}
                className="absolute top-2 right-2 text-black hover:opacity-80"
                aria-label={`Remover ${item.token}`}
              >
                ×
              </button>
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
            className="mx-auto max-w-xl px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            + Adicionar outro ativo
          </button>
          
          {showSearch && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <input
                type="text"
                placeholder="Digite o símbolo do token..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-bomdigma-500 rounded-t-lg"
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-0">
                  {searchResults.map((option) => (
                    <button
                      key={option.symbol}
                      type="button"
                      onClick={() => addToken(option.symbol)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{option.symbol}</div>
                      <div className="text-sm text-gray-600">{option.name}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Nenhum token encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total Percentage */}
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg mx-auto max-w-xl">
          <span className="font-semibold text-gray-800">Total:</span>
          <span className={`font-bold text-lg ${
            Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalPercentage.toFixed(1)}%
          </span>
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
