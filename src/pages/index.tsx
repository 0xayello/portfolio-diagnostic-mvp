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

      <div className="min-h-screen bg-paradigma-dark">
        {/* Header Bar */}
        <header className="bg-paradigma-orange py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm">
              <span>💎</span>
              <span>Quer uma análise personalizada? Entre para o Paradigma PRO e tenha acesso 24/7 aos nossos analistas.</span>
            </div>
            <a 
              href="https://paradigma.education/pro/?coupon=PORTFOLIO" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-paradigma-orange px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              🎁 Cupom PORTFOLIO: 6%&nbsp;OFF
            </a>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-paradigma-navy/80 backdrop-blur-sm border-b border-white/10 py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={handleBackToPortfolio} className="flex items-center gap-2 cursor-pointer">
              <img 
                src="https://media.licdn.com/dms/image/v2/D4D0BAQETEPky0ZRPdg/company-logo_200_200/B4DZZnzRitGgAM-/0/1745498217461/paradigma_research_logo?e=2147483647&v=beta&t=r_o4vq9caKxdnm0WzPrnm5R_uTa1A81nzX6DINDn-Rk"
                alt="Paradigma"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-white font-bold text-lg">Paradigma</span>
            </button>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-3">
              {[
                { num: 1, label: 'Portfólio', step: 'portfolio' as const },
                { num: 2, label: 'Perfil', step: 'quiz' as const },
                { num: 3, label: 'Diagnóstico', step: 'results' as const }
              ].map((item, idx) => {
                const isCompleted = 
                  (item.step === 'portfolio' && (currentStep === 'quiz' || currentStep === 'results')) ||
                  (item.step === 'quiz' && currentStep === 'results');
                const isActive = currentStep === item.step;
                
                return (
                  <React.Fragment key={item.num}>
                    <div className="flex items-center gap-2">
                      <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                        ${isCompleted ? 'text-paradigma-mint' : isActive ? 'text-white' : 'text-gray-400'}
                      `}>
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-paradigma-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-paradigma-mint text-paradigma-dark' : 'bg-gray-600 text-gray-400'}`}>
                            {item.num}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </div>
                    </div>
                    {idx < 2 && (
                      <div className="text-gray-600">—</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">

          {/* Content */}
          <div className="animate-fade-in">
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
        </main>
      </div>
    </>
  );
}
