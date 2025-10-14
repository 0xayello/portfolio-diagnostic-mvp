import React, { useState } from 'react';
import { PortfolioDiagnostic } from '../types/portfolio';
import PortfolioChart from './PortfolioChart';
import FlagsList from './FlagsList';
import BacktestChart from './BacktestChart';
import UnlockAlerts from './UnlockAlerts';
import RebalanceSuggestions from './RebalanceSuggestions';
import CTAs from './CTAs';

interface DiagnosticResultsProps {
  diagnostic: PortfolioDiagnostic;
  onBackToQuiz: () => void;
  onBackToPortfolio: () => void;
}

export default function DiagnosticResults({ 
  diagnostic, 
  onBackToQuiz, 
  onBackToPortfolio 
}: DiagnosticResultsProps) {
  const [activeTab, setActiveTab] = useState<'backtest' | 'flags' | 'unlocks' | 'rebalance'>('backtest');

  const getAdherenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAdherenceLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Alta Aderência';
      case 'medium': return 'Média Aderência';
      case 'low': return 'Baixa Aderência';
      default: return 'Indefinida';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Score */}
      <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Diagnóstico do Portfólio
          </h2>
          <button
            onClick={onBackToPortfolio}
            className="px-4 py-2 text-bomdigma-600 hover:text-bomdigma-800 transition-colors"
          >
            Nova Análise
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getAdherenceColor(diagnostic.adherenceLevel)}`}>
              {getAdherenceLabel(diagnostic.adherenceLevel)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {diagnostic.adherenceScore.toFixed(0)}/100
            </div>
            <div className="text-sm text-gray-600">Score de Aderência</div>
          </div>

          <div>
            <PortfolioChart 
              title="Distribuição por Ativo" 
              data={diagnostic.allocation.map(item => ({ name: item.token, value: item.percentage }))}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'flags', label: 'Alertas', icon: '⚠️', count: diagnostic.flags.length },
              { id: 'backtest', label: 'Backtest', icon: '📈' },
              { id: 'unlocks', label: 'Unlocks', icon: '🔓', count: diagnostic.unlockAlerts.length },
              { id: 'rebalance', label: 'Rebalanceamento', icon: '⚖️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-bomdigma-500 text-bomdigma-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'flags' && (
            <FlagsList flags={diagnostic.flags} />
          )}

          {activeTab === 'backtest' && (
            <BacktestChart backtest={diagnostic.backtest} />
          )}

          {activeTab === 'unlocks' && (
            <UnlockAlerts alerts={diagnostic.unlockAlerts} />
          )}

          {activeTab === 'rebalance' && (
            <RebalanceSuggestions suggestions={diagnostic.rebalanceSuggestions} />
          )}
        </div>
      </div>

      {/* CTAs */}
      <CTAs />
    </div>
  );
}
