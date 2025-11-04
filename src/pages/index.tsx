import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { PortfolioAllocation, InvestorProfile, PortfolioDiagnostic, AutocompleteOption } from '../types/portfolio';
import PortfolioForm from '../components/PortfolioForm';
import ProfileQuiz from '../components/ProfileQuiz';
import DiagnosticResults from '../components/DiagnosticResults';
import Footer from '../components/Footer';

const PREDEFINED_TOKENS = ['BTC', 'ETH', 'SOL', 'USDC'];

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'portfolio' | 'quiz' | 'results'>('portfolio');
  const [portfolioAllocation, setPortfolioAllocation] = useState<PortfolioAllocation[]>([]);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [diagnostic, setDiagnostic] = useState<PortfolioDiagnostic | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inicializar com 4 tokens pré-selecionados (25% cada)
    const base = 25;
    const initialAllocation = PREDEFINED_TOKENS.map(token => ({ token, percentage: base }));
    setPortfolioAllocation(initialAllocation);
  }, []);

  const handlePortfolioSubmit = (allocation: PortfolioAllocation[]) => {
    setPortfolioAllocation(allocation);
    setCurrentStep('quiz');
  };

  const handleQuizSubmit = async (profile: InvestorProfile) => {
    setInvestorProfile(profile);
    setLoading(true);
    
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allocation: portfolioAllocation,
          profile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagnostic');
      }

      const result = await response.json();
      setDiagnostic(result);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error generating diagnostic:', error);
      alert('Erro ao gerar diagnóstico. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPortfolio = () => {
    setCurrentStep('portfolio');
    setInvestorProfile(null);
    setDiagnostic(null);
  };

  const handleBackToQuiz = () => {
    setCurrentStep('quiz');
    setDiagnostic(null);
  };

  return (
    <>
      <Head>
        <title>Diagnóstico de Portfólio Cripto | Bom Digma</title>
        <meta name="description" content="Analise sua carteira de criptomoedas e receba insights personalizados sobre risco, diversificação e oportunidades de rebalanceamento." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse-slow">
                ✨ Análise Inteligente de Portfólio
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              Diagnóstico Cripto da{' '}
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Paradigma
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
              Receba um diagnóstico profissional e personalizado sobre sua carteira de investimentos em criptomoedas
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12 animate-slide-down">
            <div className="flex items-center space-x-4">
              {[
                { num: 1, label: 'Portfólio', active: currentStep === 'portfolio' },
                { num: 2, label: 'Perfil', active: currentStep === 'quiz' },
                { num: 3, label: 'Resultados', active: currentStep === 'results' }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-lg
                      transition-all duration-500 shadow-lg
                      ${step.active 
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white scale-110 shadow-glow' 
                        : 'bg-white/90 text-gray-600 backdrop-blur-sm'
                      }
                    `}>
                      {step.num}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${step.active ? 'text-white' : 'text-white/70'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
                      step.active ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-white/30'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-5xl mx-auto animate-scale-in">
            {currentStep === 'portfolio' && (
              <PortfolioForm 
                initialAllocation={portfolioAllocation}
                onSubmit={handlePortfolioSubmit}
              />
            )}

            {currentStep === 'quiz' && (
              <ProfileQuiz 
                onSubmit={handleQuizSubmit}
                onBack={handleBackToPortfolio}
                loading={loading}
              />
            )}

            {currentStep === 'results' && diagnostic && (
              <DiagnosticResults 
                diagnostic={diagnostic}
                onBackToQuiz={handleBackToQuiz}
                onBackToPortfolio={handleBackToPortfolio}
              />
            )}
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}
