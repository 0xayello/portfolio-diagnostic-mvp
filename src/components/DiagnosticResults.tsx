import React, { useState } from 'react';
import { PortfolioDiagnostic } from '../types/portfolio';
import PortfolioChart from './PortfolioChart';
import FlagsList from './FlagsList';
import BacktestChart from './BacktestChart';
import UnlockAlerts from './UnlockAlerts';
import RebalanceSuggestions from './RebalanceSuggestions';
import CTAs from './CTAs';
import { getCoinMarketCapUrl } from '../utils/coinmarketcap';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header com Score */}
      <div className="glass-card rounded-3xl shadow-2xl p-8 card-hover overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full filter blur-3xl opacity-20 -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Diagnóstico do Portfólio</h2>
            </div>
            <button 
              onClick={onBackToPortfolio} 
              className="group flex items-center gap-2 px-4 py-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Nova Análise</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center py-6">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-bold shadow-lg ${getAdherenceColor(diagnostic.adherenceLevel)}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getAdherenceLabel(diagnostic.adherenceLevel)}
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mt-4">
                {diagnostic.adherenceScore.toFixed(0)}<span className="text-3xl">/100</span>
              </div>
              <div className="text-base text-gray-600 mt-2 font-medium">Score de Aderência ao Perfil</div>
            <div className="mt-8 inline-flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
              <button 
                onClick={() => setDiagView('performance')} 
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  diagView === 'performance' 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📈 Performance
              </button>
              <button 
                onClick={() => setDiagView('allocation')} 
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  diagView === 'allocation' 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🥧 Alocação
              </button>
            </div>
          </div>

          <div className="w-full mt-6">
            {diagView === 'allocation' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <PortfolioChart
                    title="Distribuição por Ativo"
                    data={diagnostic.allocation.map(item => ({ name: item.token, value: item.percentage }))}
                    theme="light"
                    hideLegend
                  />
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Seus Ativos</h4>
                  </div>
                  <div className="space-y-3">
                    {diagnostic.allocation.map((item) => (
                      <div key={item.token} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-violet-300 transition-all">
                        <a 
                          href={getCoinMarketCapUrl(item.token)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-gray-900 hover:text-violet-600 transition-colors underline"
                        >
                          {item.token}
                        </a>
                        <span className="text-violet-600 font-bold text-lg">{item.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <BacktestChart backtest={diagnostic.backtest} series={diagnostic.backtestSeries} theme="light" />
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Tabs unificadas: apenas Alertas (inclui unlocks) */}
      <div className="glass-card rounded-3xl shadow-2xl overflow-hidden">
        <div className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <nav className="flex px-8 py-2">
            <button className="group relative py-4 px-1 font-bold text-base flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-gray-900">Alertas Importantes</span>
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                {diagnostic.flags.length + diagnostic.unlockAlerts.length}
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-full"></div>
            </button>
          </nav>
        </div>

        <div className="p-8 space-y-8 bg-gradient-to-br from-white to-gray-50">
          <FlagsList flags={diagnostic.flags} />
          <UnlockAlerts alerts={diagnostic.unlockAlerts} />
        </div>
      </div>

      {/* CTAs */}
      <CTAs />
    </div>
  );
}
