import React from 'react';
import { DiagnosticFlag } from '../types/portfolio';
import { TokenLinkedText } from './TokenLink';

interface FlagsListProps {
  flags: DiagnosticFlag[];
}

export default function FlagsList({ flags }: FlagsListProps) {
  if (flags.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          Nenhum Alerta Crítico
        </h3>
        <p className="text-gray-600">
          Sua carteira está bem diversificada e alinhada com seu perfil de risco.
        </p>
      </div>
    );
  }

  const flagsByType = flags.reduce((acc, flag) => {
    if (!acc[flag.type]) {
      acc[flag.type] = [];
    }
    acc[flag.type].push(flag);
    return acc;
  }, {} as { [key: string]: DiagnosticFlag[] });

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'red': return '🚨';
      case 'yellow': return '⚠️';
      case 'green': return '✅';
      default: return 'ℹ️';
    }
  };

  const getFlagTitle = (type: string) => {
    switch (type) {
      case 'red': return 'Alertas Críticos';
      case 'yellow': return 'Atenção';
      case 'green': return 'Pontos Positivos';
      default: return 'Informações';
    }
  };

  const getFlagColor = (type: string) => {
    switch (type) {
      case 'red': return 'border-red-200 bg-red-50';
      case 'yellow': return 'border-yellow-200 bg-yellow-50';
      case 'green': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Análise de Riscos e Oportunidades
        </h3>
        <p className="text-gray-600">
          Identificamos {flags.length} ponto{flags.length !== 1 ? 's' : ''} de atenção na sua carteira.
        </p>
      </div>

      {Object.entries(flagsByType).map(([type, typeFlags]) => (
        <div key={type} className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFlagIcon(type)}</span>
            <h4 className="text-lg font-semibold text-gray-800">
              {getFlagTitle(type)} ({typeFlags.length})
            </h4>
          </div>
          
          <div className="space-y-3">
            {typeFlags.map((flag, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${getFlagColor(flag.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-1">
                      <TokenLinkedText text={flag.message} />
                    </p>
                    {flag.actionable && (
                      <p className="text-sm text-gray-600">
                        💡 <TokenLinkedText text={flag.actionable} />
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                      {flag.category}
                    </span>
                    {flag.severity > 0 && (
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < flag.severity 
                                ? type === 'red' ? 'bg-red-500' : type === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">
          📋 Resumo da Análise
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">Alertas Críticos:</span>
            <span className="ml-2 text-blue-600">
              {flagsByType.red?.length || 0}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Atenção:</span>
            <span className="ml-2 text-blue-600">
              {flagsByType.yellow?.length || 0}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Pontos Positivos:</span>
            <span className="ml-2 text-blue-600">
              {flagsByType.green?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer + CTA Paradigma Pro */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {/* Disclaimer */}
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <span className="font-semibold text-gray-900">Importante:</span> Este diagnóstico é uma análise automatizada e não substitui uma consultoria personalizada por um profissional do mercado. Os resultados são indicativos e não devem ser considerados como recomendações definitivas de investimento.
            </p>
          </div>

          {/* Divisor */}
          <div className="border-t border-purple-200"></div>

          {/* CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm">
              <div className="font-semibold text-purple-900 mb-1">💎 Quer uma análise personalizada?</div>
              <div className="text-gray-700">
                Entre para o <span className="font-bold text-purple-700">Paradigma PRO</span> e tenha acesso 24/7 aos nossos analistas especializados.
              </div>
            </div>
            <a
              href="https://paradigma.education/pro" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <span>Conheça o Paradigma PRO</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
