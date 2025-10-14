import React, { useState, useEffect } from 'react';
import { PortfolioAllocation, AutocompleteOption } from '../types/portfolio';

interface PortfolioFormProps {
  initialAllocation: PortfolioAllocation[];
  onSubmit: (allocation: PortfolioAllocation[]) => void;
}

const PREDEFINED_TOKENS = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT'];

export default function PortfolioForm({ initialAllocation, onSubmit }: PortfolioFormProps) {
  const [allocation, setAllocation] = useState<PortfolioAllocation[]>(initialAllocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AutocompleteOption[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    const total = allocation.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(total);
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

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Configure sua Alocação de Portfólio
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Allocation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Distribuição por Ativo</h3>
          
          {allocation.map((item) => (
            <div key={item.token} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {item.token}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      placeholder="0"
                      value={item.percentage === 0 ? '' : item.percentage}
                      onChange={(e) => handlePercentageChange(item.token, sanitizeNumber(e.target.value))}
                      onBlur={(e) => { if (e.currentTarget.value === '') handlePercentageChange(item.token, 0); }}
                      className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bomdigma-500 focus:border-transparent text-right"
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-gray-500 text-sm">%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {[10, 25, 33, 50].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePercentageChange(item.token, p)}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {!PREDEFINED_TOKENS.includes(item.token) && (
                <button
                  type="button"
                  onClick={() => removeToken(item.token)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Token Search */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            + Adicionar outro ativo
          </button>
          
          {showSearch && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <input
                type="text"
                placeholder="Digite o símbolo do token..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-bomdigma-500 rounded-t-lg"
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
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
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
          <span className="font-semibold text-gray-800">Total:</span>
          <span className={`font-bold text-lg ${
            Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalPercentage.toFixed(1)}%
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={distributeEvenly}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Distribuir Igualmente
          </button>
          
          <button
            type="button"
            onClick={() => setAllocation(prev => prev.map(item => ({ ...item, percentage: 0 })))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Limpar Tudo
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={Math.abs(totalPercentage - 100) > 0.1}
          className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continuar para Quiz de Perfil
        </button>
      </form>
    </div>
  );
}
