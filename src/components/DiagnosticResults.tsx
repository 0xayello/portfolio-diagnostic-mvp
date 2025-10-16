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
  const [activeTab, setActiveTab] = useState<'flags' | 'unlocks' | 'backtest'>('unlocks');
  const [diagView, setDiagView] = useState<'performance' | 'allocation'>('performance');

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
      {/* Header com Score + Pizza no lado direito */}
      <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Diagnóstico do Portfólio</h2>
          <button onClick={onBackToPortfolio} className="px-4 py-2 text-bomdigma-600 hover:text-bomdigma-800 transition-colors">Nova Análise</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Esquerda: score e toggle */}
          <div className="lg:col-span-2 text-center lg:text-left">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getAdherenceColor(diagnostic.adherenceLevel)}`}>
              {getAdherenceLabel(diagnostic.adherenceLevel)}
            </div>
            <div className="text-4xl font-bold text-gray-900 mt-2">{diagnostic.adherenceScore.toFixed(0)}/100</div>
            <div className="text-sm text-gray-600">Score de Aderência</div>
            <div className="mt-6 inline-flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setDiagView('performance')} className={`px-4 py-2 rounded-md text-sm font-medium ${diagView === 'performance' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>Performance</button>
              <button onClick={() => setDiagView('allocation')} className={`px-4 py-2 rounded-md text-sm font-medium ${diagView === 'allocation' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>Allocation</button>
            </div>
          </div>

          {/* Direita: pizza compacta com legenda menor */}
          <div className="lg:col-span-1">
            <PortfolioChart
              title="Distribuição por Ativo"
              data={diagnostic.allocation.map(item => ({ name: item.token, value: item.percentage }))}
              theme="light"
              hideLegend
            />
          </div>
        </div>
      </div>

      {/* Tabs unificadas: apenas Alertas (inclui unlocks) */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 border-bomdigma-500 text-bomdigma-600`}>
              <span>⚠️</span>
              <span>Alertas</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{diagnostic.flags.length + diagnostic.unlockAlerts.length}</span>
            </button>
          </nav>
        </div>

        <div className="p-6 space-y-8">
          <FlagsList flags={diagnostic.flags} />
          <UnlockAlerts alerts={diagnostic.unlockAlerts} />
        </div>
      </div>

      {/* CTAs */}
      <CTAs />
    </div>
  );
}
