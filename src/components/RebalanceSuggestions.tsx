import React from 'react';
import { RebalanceSuggestion } from '../types/portfolio';
import TokenLink from './TokenLink';

interface RebalanceSuggestionsProps {
  suggestions: RebalanceSuggestion[];
}

export default function RebalanceSuggestions({ suggestions }: RebalanceSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          Carteira Bem Balanceada
        </h3>
        <p className="text-gray-600">
          Sua carteira já está bem distribuída. Continue monitorando regularmente.
        </p>
      </div>
    );
  }

  const getChangeType = (current: number, suggested: number) => {
    if (suggested > current) return 'increase';
    if (suggested < current) return 'decrease';
    return 'maintain';
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase': return '📈';
      case 'decrease': return '📉';
      default: return '➡️';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase': return 'text-green-600 bg-green-50 border-green-200';
      case 'decrease': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'increase': return 'Aumentar';
      case 'decrease': return 'Diminuir';
      default: return 'Manter';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Sugestões de Rebalanceamento
        </h3>
        <p className="text-gray-600">
          Baseado no seu perfil de investidor, sugerimos os seguintes ajustes para otimizar sua carteira.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800">
              📊 Resumo das Sugestões
            </h4>
            <p className="text-sm text-blue-700">
              {suggestions.length} ajuste{suggestions.length !== 1 ? 's' : ''} recomendado{suggestions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {suggestions.reduce((sum, s) => Math.abs(sum + (s.suggestedPercentage - s.currentPercentage)), 0).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Total de Ajuste</div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const changeType = getChangeType(suggestion.currentPercentage, suggestion.suggestedPercentage);
          const changeAmount = suggestion.suggestedPercentage - suggestion.currentPercentage;
          
          return (
            <div 
              key={index}
              className={`p-6 rounded-lg border-l-4 ${getChangeColor(changeType)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getChangeIcon(changeType)}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      <TokenLink symbol={suggestion.token} />
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      changeType === 'increase' 
                        ? 'bg-green-100 text-green-800' 
                        : changeType === 'decrease'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getChangeLabel(changeType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current vs Suggested */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Atual</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {suggestion.currentPercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Sugerido</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {suggestion.suggestedPercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Mudança</div>
                  <div className={`text-xl font-bold ${
                    changeAmount > 0 ? 'text-green-600' : changeAmount < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {changeAmount > 0 ? '+' : ''}{changeAmount.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Atual</span>
                  <span>Sugerido</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gray-400"
                    style={{ width: `${Math.min(suggestion.currentPercentage, 100)}%` }}
                  />
                  <div 
                    className={`absolute top-0 h-full ${
                      changeType === 'increase' ? 'bg-green-500' : 
                      changeType === 'decrease' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      left: `${Math.min(suggestion.currentPercentage, 100)}%`,
                      width: `${Math.abs(changeAmount)}%`
                    }}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-1">💡 Motivo:</h5>
                <p className="text-sm text-gray-700">{suggestion.reason}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Implementation Guide */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
          <span className="text-xl mr-2">🚀</span>
          Como Implementar as Sugestões
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-700 mb-2">Estratégia Gradual</h5>
            <ul className="space-y-1 text-sm text-green-600">
              <li>• Implemente mudanças em etapas (25% por semana)</li>
              <li>• Monitore o impacto no portfólio</li>
              <li>• Ajuste conforme condições de mercado</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-green-700 mb-2">Considerações</h5>
            <ul className="space-y-1 text-sm text-green-600">
              <li>• Avalie taxas de transação</li>
              <li>• Considere impostos sobre ganhos</li>
              <li>• Mantenha reserva de emergência</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">
              Aviso Importante
            </h4>
            <p className="text-sm text-yellow-700">
              Estas sugestões são baseadas no seu perfil de investidor e nas regras de diversificação. 
              Consulte sempre um profissional financeiro antes de fazer mudanças significativas na sua carteira.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
