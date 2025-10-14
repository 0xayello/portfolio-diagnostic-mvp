import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { PortfolioAllocation, InvestorProfile, PortfolioDiagnostic, AutocompleteOption } from '../types/portfolio';
import PortfolioForm from '../components/PortfolioForm';
import ProfileQuiz from '../components/ProfileQuiz';
import DiagnosticResults from '../components/DiagnosticResults';

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

      <main className="min-h-screen bg-gradient-to-br from-bomdigma-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Diagnóstico de Portfólio Cripto 💼 — Powered by Bom Digma
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Analise sua carteira de criptomoedas e receba insights personalizados sobre risco, 
              diversificação e oportunidades de rebalanceamento.
            </p>
            <div className="mt-4" />
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'portfolio' ? 'bg-bomdigma-600 text-white' : 
                ['quiz', 'results'].includes(currentStep) ? 'bg-green-500 text-white' : 
                'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${
                ['quiz', 'results'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'quiz' ? 'bg-bomdigma-600 text-white' : 
                currentStep === 'results' ? 'bg-green-500 text-white' : 
                'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${
                currentStep === 'results' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'results' ? 'bg-bomdigma-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
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
        </div>
      </main>
    </>
  );
}
