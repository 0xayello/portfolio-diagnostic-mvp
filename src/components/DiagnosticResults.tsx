import React, { useState, useMemo } from 'react';
import { PortfolioDiagnostic } from '../types/portfolio';
import PortfolioChart from './PortfolioChart';
import FlagsList from './FlagsList';
import BacktestChart from './BacktestChart';
import CTAs from './CTAs';
import DisclaimerCTA from './DisclaimerCTA';
import { getCoinMarketCapUrl } from '../utils/coinmarketcap';
import {
  calculateSpiritAnimal,
  calculateBadges,
  calculateFOMOMeter,
  calculateCelebrityMatch,
  calculateTimeMachine,
  getMotivationalPhrase,
  SPIRIT_ANIMALS,
} from '../utils/gamification';

interface DiagnosticResultsProps {
  diagnostic: PortfolioDiagnostic;
  onBackToQuiz: () => void;
  onBackToPortfolio: () => void;
}

type TabId = 'performance' | 'allocation' | 'spirit' | 'badges' | 'timemachine' | 'celebrity' | 'alerts';

const MEMECOINS = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'MEME'];

export default function DiagnosticResults({ 
  diagnostic, 
  onBackToQuiz, 
  onBackToPortfolio 
}: DiagnosticResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('performance');
  const [currentDiagnostic, setCurrentDiagnostic] = useState(diagnostic);
  const [loadingPeriod, setLoadingPeriod] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(180);

  const sectorCount = diagnostic.sectorBreakdown ? Object.keys(diagnostic.sectorBreakdown).length : 0;
  const score = diagnostic.adherenceScore;

  // Gamification calculations
  const spiritAnimal = useMemo(() => calculateSpiritAnimal(diagnostic.allocation, score), [diagnostic.allocation, score]);
  const badges = useMemo(() => calculateBadges(diagnostic.allocation, score, sectorCount), [diagnostic.allocation, score, sectorCount]);
  const fomoMeter = useMemo(() => calculateFOMOMeter(diagnostic.allocation), [diagnostic.allocation]);
  const celebrityMatch = useMemo(() => calculateCelebrityMatch(diagnostic.allocation), [diagnostic.allocation]);
  const timeMachineResults = useMemo(() => calculateTimeMachine(diagnostic.allocation), [diagnostic.allocation]);

  const hasMemecoins = diagnostic.allocation.some(a => MEMECOINS.includes(a.token));
  const memecoinPercent = diagnostic.allocation
    .filter(a => MEMECOINS.includes(a.token))
    .reduce((sum, a) => sum + a.percentage, 0);
  
  const motivationalPhrase = useMemo(
    () => getMotivationalPhrase(score, hasMemecoins, memecoinPercent),
    [score, hasMemecoins, memecoinPercent]
  );

  const unlockedBadges = badges.filter(b => b.unlocked);

  const handlePeriodChange = async (days: number) => {
    setSelectedPeriod(days);
    setLoadingPeriod(true);
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocation: diagnostic.allocation.map(a => ({ token: a.token, percentage: a.percentage })),
          profile: diagnostic.profile,
          backtestPeriod: days
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setCurrentDiagnostic(result);
      }
    } catch (error) {
      console.error('Error updating backtest period:', error);
    } finally {
      setLoadingPeriod(false);
    }
  };

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

  const tabs = [
    { id: 'performance' as TabId, label: 'Performance', icon: '📈' },
    { id: 'allocation' as TabId, label: 'Alocação', icon: '🥧' },
    { id: 'spirit' as TabId, label: 'Perfil', icon: spiritAnimal.emoji },
    { id: 'badges' as TabId, label: 'Conquistas', icon: '🏆' },
    { id: 'timemachine' as TabId, label: 'Time Machine', icon: '⏰' },
    { id: 'celebrity' as TabId, label: 'Celebridade', icon: '👥' },
    { id: 'alerts' as TabId, label: 'Alertas', icon: '⚠️' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Score */}
      <div className="glass-card rounded-3xl shadow-2xl p-8 card-hover overflow-hidden relative">
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
              
              {/* Frase Motivacional */}
              <div className="mt-4 max-w-xl mx-auto">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <span className="text-2xl mr-2">{motivationalPhrase.emoji}</span>
                  <span className="text-gray-700 italic">{motivationalPhrase.text}</span>
                </div>
              </div>

              {/* Badges desbloqueadas - inline */}
              {unlockedBadges.length > 0 && (
                <div className="mt-4 flex justify-center gap-2 flex-wrap">
                  {unlockedBadges.slice(0, 4).map(badge => (
                    <div key={badge.id} className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      <span>{badge.emoji}</span>
                      <span>{badge.name}</span>
                    </div>
                  ))}
                  {unlockedBadges.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      +{unlockedBadges.length - 4} mais
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Perfil de Investidor - Card Exclusivo */}
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{spiritAnimal.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm text-violet-600 font-medium mb-1">Seu Perfil de Investidor</div>
                  <div className="text-2xl font-bold text-gray-900">{spiritAnimal.name}</div>
                  <div className="text-gray-600 mt-1 italic">"{spiritAnimal.description}"</div>
                </div>
                <button 
                  onClick={() => setActiveTab('spirit')}
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  Ver todos
                </button>
              </div>
            </div>

            {/* FOMO vs HODL Meter */}
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>🌡️</span> Termômetro FOMO vs HODL
                </h3>
                <span className="text-2xl">{fomoMeter.emoji}</span>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>🧊 HODL</span>
                  {fomoMeter.label && <span className="font-bold text-gray-700">{fomoMeter.label}</span>}
                  <span>FOMO 🔥</span>
                </div>
                <div className="h-4 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full relative">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-gray-800 shadow-lg transition-all"
                    style={{ left: `calc(${fomoMeter.percentage}% - 12px)` }}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-3 text-center italic">"{fomoMeter.description}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-3xl shadow-2xl overflow-hidden">
        <div className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-x-auto">
          <nav className="flex px-4 py-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative py-3 px-4 font-bold text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'text-violet-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 bg-gradient-to-br from-white to-gray-50">
          {/* Performance Tab */}
          {activeTab === 'performance' && (() => {
            const greenFlags = diagnostic.flags.filter(f => f.type === 'green');
            const redYellowFlags = diagnostic.flags.filter(f => f.type === 'red' || f.type === 'yellow');
            
            return (
              <div className="animate-fade-in space-y-6">
                {/* Avaliação de Risco */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚡</span> Avaliação de Risco
                  </h3>
                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-gray-700">
                      {score >= 85 
                        ? 'O portfólio está bem alinhado com seu perfil ' + (diagnostic.profile.riskTolerance === 'low' ? 'conservador' : diagnostic.profile.riskTolerance === 'medium' ? 'moderado' : 'arrojado') + '. A distribuição de ativos demonstra consciência dos riscos e objetivos estabelecidos.'
                        : score >= 70
                        ? 'O portfólio apresenta boa aderência ao seu perfil ' + (diagnostic.profile.riskTolerance === 'low' ? 'conservador' : diagnostic.profile.riskTolerance === 'medium' ? 'moderado' : 'arrojado') + '. Alguns ajustes podem melhorar o alinhamento com seus objetivos.'
                        : 'O portfólio apresenta desalinhamentos com seu perfil ' + (diagnostic.profile.riskTolerance === 'low' ? 'conservador' : diagnostic.profile.riskTolerance === 'medium' ? 'moderado' : 'arrojado') + '. Recomendamos revisar a alocação para melhor aderência aos seus objetivos.'}
                    </p>
                  </div>
                </div>

                {/* Pontos Fortes e Fracos */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pontos Fortes */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                      <span>💪</span> Pontos Fortes
                    </h3>
                    {greenFlags.length > 0 ? (
                      <ul className="space-y-3">
                        {greenFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{flag.message}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Nenhum ponto forte identificado ainda. Continue diversificando!</p>
                    )}
                  </div>

                  {/* Pontos Fracos */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                      <span>⚠️</span> Pontos Fracos
                    </h3>
                    {redYellowFlags.length > 0 ? (
                      <ul className="space-y-3">
                        {redYellowFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={flag.type === 'red' ? 'text-red-500 mt-1' : 'text-yellow-500 mt-1'}>
                              {flag.type === 'red' ? '✗' : '!'}
                            </span>
                            <span className="text-gray-700">{flag.message}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Nenhum ponto fraco identificado. Excelente trabalho!</p>
                    )}
                  </div>
                </div>

                {/* Backtest Chart */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📈</span> Performance Histórica
                  </h3>
                  {loadingPeriod ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Atualizando performance...</p>
                      </div>
                    </div>
                  ) : (
                    <BacktestChart 
                      backtest={currentDiagnostic.backtest} 
                      series={currentDiagnostic.backtestSeries} 
                      theme="light"
                      onPeriodChange={handlePeriodChange}
                      selectedPeriod={selectedPeriod}
                    />
                  )}
                </div>
              </div>
            );
          })()}

          {/* Allocation Tab */}
          {activeTab === 'allocation' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          )}

          {/* Spirit Animal (Perfil de Investidor) Tab */}
          {activeTab === 'spirit' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="text-8xl mb-4">{spiritAnimal.emoji}</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{spiritAnimal.name}</h3>
                <p className="text-xl text-violet-600 italic">"{spiritAnimal.description}"</p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">Todos os Animais</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SPIRIT_ANIMALS.map((animal) => (
                    <div 
                      key={animal.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        animal.id === spiritAnimal.id
                          ? 'bg-violet-100 border-violet-400'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-4xl mb-2">{animal.emoji}</div>
                      <div className="font-semibold text-gray-900">{animal.name}</div>
                      <div className="text-gray-500 text-xs mt-1">{animal.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🏆 Suas Conquistas</h3>
                <p className="text-gray-500">
                  {unlockedBadges.length} de {badges.length} conquistas desbloqueadas
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
                        : 'bg-gray-100 border-gray-200 opacity-50 grayscale'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{badge.emoji}</div>
                      <div>
                        <div className="font-bold text-gray-900">{badge.name}</div>
                        <div className="text-gray-500 text-sm">{badge.description}</div>
                      </div>
                    </div>
                    {badge.unlocked && (
                      <div className="mt-2 text-xs text-green-600 font-bold">✓ Desbloqueado!</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Machine Tab */}
          {activeTab === 'timemachine' && (() => {
            // Dados de preço histórico do BTC (aproximado em USD)
            const btcPrices = [
              { date: 'Jan 21', label: 'Pré-Bull Run', price: 29000, month: 0 },
              { date: 'Nov 21', label: 'ATH', price: 69000, month: 10 },
              { date: 'Nov 22', label: 'FTX', price: 16000, month: 22 },
              { date: 'Jan 23', label: 'Bear', price: 17000, month: 24 },
              { date: 'Abr 24', label: 'Halving', price: 64000, month: 39 },
              { date: 'Jan 26', label: 'Hoje', price: 95000, month: 60 },
            ];
            
            const chartHeight = 350;
            const chartWidth = 700;
            const padding = { top: 50, right: 60, bottom: 80, left: 70 };
            const innerWidth = chartWidth - padding.left - padding.right;
            const innerHeight = chartHeight - padding.top - padding.bottom;
            
            // Escalas
            const maxPrice = Math.max(...btcPrices.map(p => p.price));
            const maxChange = Math.max(...timeMachineResults.map(r => Math.abs(r.portfolioChange)), 100);
            const barWidth = innerWidth / (timeMachineResults.length + 1) * 0.6;
            
            const xScale = (idx: number) => padding.left + ((idx + 0.5) / timeMachineResults.length) * innerWidth;
            const yScalePrice = (price: number) => padding.top + innerHeight - (price / maxPrice) * innerHeight;
            const yScaleBar = (value: number) => {
              const baseY = padding.top + innerHeight;
              const height = (Math.abs(value) / maxChange) * (innerHeight * 0.6);
              return value >= 0 ? baseY - height : baseY;
            };
            const barHeight = (value: number) => (Math.abs(value) / maxChange) * (innerHeight * 0.6);
            
            // Linha do BTC
            const btcLinePath = btcPrices
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (p.month / 60) * innerWidth} ${yScalePrice(p.price)}`)
              .join(' ');

            return (
              <div className="animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">⏰ Time Machine</h3>
                  <p className="text-gray-500">Valorização do seu portfólio em momentos históricos do Bitcoin</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-200 overflow-x-auto">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[600px]">
                    <defs>
                      <linearGradient id="barGradientPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                      <linearGradient id="barGradientNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="btcGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f7931a" />
                        <stop offset="100%" stopColor="#ffb347" />
                      </linearGradient>
                    </defs>
                    
                    {/* Eixo Y esquerdo - Valorização % */}
                    <text x={padding.left - 50} y={padding.top + innerHeight / 2} fill="#6b7280" fontSize="10" textAnchor="middle" transform={`rotate(-90, ${padding.left - 50}, ${padding.top + innerHeight / 2})`}>
                      Valorização Portfólio (%)
                    </text>
                    
                    {/* Eixo Y direito - Preço BTC */}
                    <text x={chartWidth - padding.right + 45} y={padding.top + innerHeight / 2} fill="#f7931a" fontSize="10" textAnchor="middle" transform={`rotate(90, ${chartWidth - padding.right + 45}, ${padding.top + innerHeight / 2})`}>
                      Preço BTC (USD)
                    </text>
                    
                    {/* Grid horizontal */}
                    {[0, 25, 50, 75, 100].map(pct => (
                      <line
                        key={pct}
                        x1={padding.left}
                        y1={padding.top + innerHeight - (pct / 100) * innerHeight}
                        x2={chartWidth - padding.right}
                        y2={padding.top + innerHeight - (pct / 100) * innerHeight}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                    ))}
                    
                    {/* Linha base (0%) */}
                    <line
                      x1={padding.left}
                      y1={padding.top + innerHeight}
                      x2={chartWidth - padding.right}
                      y2={padding.top + innerHeight}
                      stroke="#9ca3af"
                      strokeWidth="2"
                    />

                    {/* Barras de valorização do portfólio */}
                    {timeMachineResults.map((result, i) => (
                      <g key={i}>
                        <rect
                          x={xScale(i) - barWidth / 2}
                          y={result.portfolioChange >= 0 ? yScaleBar(result.portfolioChange) : padding.top + innerHeight}
                          width={barWidth}
                          height={barHeight(result.portfolioChange)}
                          fill={result.portfolioChange >= 0 ? 'url(#barGradientPos)' : 'url(#barGradientNeg)'}
                          rx="4"
                        />
                        {/* Valor na barra */}
                        <text
                          x={xScale(i)}
                          y={result.portfolioChange >= 0 ? yScaleBar(result.portfolioChange) - 8 : padding.top + innerHeight + barHeight(result.portfolioChange) + 16}
                          fill={result.portfolioChange >= 0 ? '#16a34a' : '#dc2626'}
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {result.wouldBe}
                        </text>
                        {/* Emoji do cenário */}
                        <text
                          x={xScale(i)}
                          y={chartHeight - 45}
                          fontSize="20"
                          textAnchor="middle"
                        >
                          {result.scenario.emoji}
                        </text>
                        {/* Label */}
                        <text
                          x={xScale(i)}
                          y={chartHeight - 25}
                          fill="#374151"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {result.scenario.date.split(' ')[0]}
                        </text>
                        <text
                          x={xScale(i)}
                          y={chartHeight - 12}
                          fill="#6b7280"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          {result.scenario.label}
                        </text>
                      </g>
                    ))}

                    {/* Linha do preço do BTC */}
                    <path
                      d={btcLinePath}
                      fill="none"
                      stroke="url(#btcGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Pontos do BTC */}
                    {btcPrices.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={padding.left + (p.month / 60) * innerWidth}
                          cy={yScalePrice(p.price)}
                          r="5"
                          fill="#f7931a"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={padding.left + (p.month / 60) * innerWidth}
                          y={yScalePrice(p.price) - 10}
                          fill="#f7931a"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ${(p.price / 1000).toFixed(0)}k
                        </text>
                      </g>
                    ))}
                    
                    {/* Legenda */}
                    <g transform={`translate(${padding.left + 10}, ${padding.top - 30})`}>
                      <rect x="0" y="0" width="12" height="12" fill="url(#barGradientPos)" rx="2" />
                      <text x="18" y="10" fill="#374151" fontSize="10">Seu Portfólio</text>
                      <circle cx="100" cy="6" r="5" fill="#f7931a" />
                      <text x="110" y="10" fill="#f7931a" fontSize="10">Preço BTC</text>
                    </g>
                  </svg>
                </div>

                {/* Insight */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="text-sm text-gray-700">
                      <strong>Insight:</strong> O melhor momento para ter investido teria sido durante o 
                      <span className="text-green-600 font-bold"> Fundo do Bear (Jan 2023)</span> ou na 
                      <span className="text-green-600 font-bold"> Pré-Bull Run (Jan 2021)</span>. 
                      Comprar no <span className="text-red-600 font-bold">ATH (Nov 2021)</span> resultaria em perda até hoje.
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Celebrity Tab */}
          {activeTab === 'celebrity' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">👥 Seu Portfólio Parece Com...</h3>
              </div>

              <div className="max-w-md mx-auto">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-violet-100 border-4 border-violet-300 overflow-hidden shadow-lg">
                    <img 
                      src={celebrityMatch.image} 
                      alt={celebrityMatch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{celebrityMatch.name}</div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-4">
                    <span className="text-violet-700 font-bold">{celebrityMatch.match}%</span>
                    <span className="text-gray-600 text-sm">de similaridade</span>
                  </div>
                  <p className="text-gray-600 mb-4">{celebrityMatch.description}</p>
                  <div className="bg-white rounded-xl p-4 border border-violet-200">
                    <div className="text-gray-500 text-sm mb-1">Estilo de portfólio:</div>
                    <div className="text-gray-900 font-medium">{celebrityMatch.portfolio}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="animate-fade-in space-y-6">
              <FlagsList flags={diagnostic.flags} />
              <DisclaimerCTA />
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <CTAs />
    </div>
  );
}
