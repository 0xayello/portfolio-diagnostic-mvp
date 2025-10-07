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
  const [activeTab, setActiveTab] = useState<'overview' | 'flags' | 'backtest' | 'unlocks' | 'rebalance'>('overview');

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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getAdherenceColor(diagnostic.adherenceLevel)}`}>
              {getAdherenceLabel(diagnostic.adherenceLevel)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {diagnostic.adherenceScore.toFixed(0)}/100
            </div>
            <div className="text-sm text-gray-600">Score de Aderência</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-bomdigma-600">
              {diagnostic.metrics.volatility.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Volatilidade</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {diagnostic.metrics.liquidity.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Liquidez</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {diagnostic.metrics.diversificationScore}/100
            </div>
            <div className="text-sm text-gray-600">Diversificação</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PortfolioChart 
                  title="Por Ativo" 
                  data={diagnostic.allocation.map(item => ({
                    name: item.token,
                    value: item.percentage
                  }))} 
                />
                <PortfolioChart 
                  title="Por Setor" 
                  data={Object.entries(diagnostic.sectorBreakdown).map(([sector, percentage]) => ({
                    name: sector,
                    value: percentage
                  }))} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Stablecoins</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {diagnostic.metrics.stablecoinPercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Tokens Analisados</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {diagnostic.allocation.length}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Setores</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(diagnostic.sectorBreakdown).length}
                  </div>
                </div>
              </div>
            </div>
          )}

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
