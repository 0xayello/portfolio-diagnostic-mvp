import React, { useState } from 'react';
import { InvestorProfile } from '../types/portfolio';

interface ProfileQuizProps {
  onSubmit: (profile: InvestorProfile) => void;
  onBack: () => void;
  loading: boolean;
}

export default function ProfileQuiz({ onSubmit, onBack, loading }: ProfileQuizProps) {
  const [profile, setProfile] = useState<Partial<InvestorProfile>>({
    horizon: undefined,
    riskTolerance: undefined,
    cryptoPercentage: 50,
    objective: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!profile.horizon) {
      newErrors.horizon = 'Selecione seu horizonte de investimento';
    }
    
    if (!profile.riskTolerance) {
      newErrors.riskTolerance = 'Selecione sua tolerância ao risco';
    }
    
    if (!profile.objective || (Array.isArray(profile.objective) && profile.objective.length === 0)) {
      newErrors.objective = 'Selecione pelo menos um objetivo';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(profile as InvestorProfile);
    }
  };

  const handleChange = (field: keyof InvestorProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="glass-card-solid rounded-3xl p-8 border border-paradigma-navy/50">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-2 bg-paradigma-mint/20 text-paradigma-mint rounded-full text-sm font-semibold mb-4">
          Passo 2 de 3
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          Perfil de <span className="text-paradigma-mint">Investidor</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Responda as perguntas para personalizar sua análise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Horizonte de Investimento */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-paradigma-mint text-paradigma-dark font-bold text-sm">
              1
            </div>
            <label className="text-xl font-bold text-white">
              Qual é seu horizonte de investimento?
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'short', label: 'Curto Prazo', desc: 'Até 1 ano', icon: '⚡' },
              { value: 'medium', label: 'Médio Prazo', desc: '1 a 3 anos', icon: '📈' },
              { value: 'long', label: 'Longo Prazo', desc: 'Mais de 3 anos', icon: '🎯' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('horizon', option.value)}
                className={`group p-6 border-2 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  profile.horizon === option.value
                    ? 'border-paradigma-mint bg-paradigma-mint/20 shadow-lg scale-105'
                    : 'border-paradigma-navy/50 hover:border-paradigma-mint/50 bg-paradigma-navy/40'
                }`}
              >
                <div className="text-4xl mb-3">{option.icon}</div>
                <div className={`font-bold text-lg mb-1 ${profile.horizon === option.value ? 'text-white' : 'text-gray-300'}`}>
                  {option.label}
                </div>
                <div className={`text-sm ${profile.horizon === option.value ? 'text-gray-300' : 'text-gray-400'}`}>{option.desc}</div>
                {profile.horizon === option.value && (
                  <div className="mt-3 flex items-center justify-center gap-1 text-violet-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Selecionado</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {errors.horizon && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/20 p-3 rounded-xl border border-red-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{errors.horizon}</p>
            </div>
          )}
        </div>

        {/* Tolerância ao Risco */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-paradigma-mint text-paradigma-dark font-bold text-sm">
              2
            </div>
            <label className="text-xl font-bold text-white">
              Qual é sua tolerância ao risco?
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                value: 'high', 
                label: 'Arrojado', 
                desc: 'Aceita alto risco por maior retorno', 
                icon: '🚀'
              },
              { 
                value: 'medium', 
                label: 'Moderado', 
                desc: 'Equilíbrio entre risco e retorno', 
                icon: '⚖️'
              },
              { 
                value: 'low', 
                label: 'Conservador', 
                desc: 'Preservar capital com baixo risco', 
                icon: '🛡️'
              }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('riskTolerance', option.value)}
                className={`group p-6 border-2 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  profile.riskTolerance === option.value
                    ? 'border-paradigma-mint bg-paradigma-mint/20 shadow-lg scale-105'
                    : 'border-paradigma-navy/50 hover:border-paradigma-mint/50 bg-paradigma-navy/40'
                }`}
              >
                <div className="text-4xl mb-3">{option.icon}</div>
                <div className={`font-bold text-lg mb-1 ${profile.riskTolerance === option.value ? 'text-white' : 'text-gray-300'}`}>
                  {option.label}
                </div>
                <div className={`text-sm ${profile.riskTolerance === option.value ? 'text-gray-300' : 'text-gray-400'}`}>{option.desc}</div>
                {profile.riskTolerance === option.value && (
                  <div className="mt-3 flex items-center justify-center gap-1 text-paradigma-mint">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Selecionado</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {errors.riskTolerance && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/20 p-3 rounded-xl border border-red-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{errors.riskTolerance}</p>
            </div>
          )}
        </div>

        {/* Objetivo Principal */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-paradigma-mint text-paradigma-dark font-bold text-sm">
              3
            </div>
            <label className="text-xl font-bold text-white">
              Quais são seus objetivos? <span className="text-sm font-normal text-gray-400">(múltipla escolha)</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                value: 'preserve', 
                label: 'Preservar Capital', 
                desc: 'Proteger contra inflação', 
                icon: '💰'
              },
              { 
                value: 'passive_income', 
                label: 'Renda Passiva', 
                desc: 'Staking e DeFi yield', 
                icon: '💎'
              },
              { 
                value: 'multiply', 
                label: 'Multiplicar Capital', 
                desc: 'Crescimento agressivo', 
                icon: '📊'
              }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const current = Array.isArray(profile.objective) ? profile.objective : [];
                  const exists = current.includes(option.value as any);
                  const next = exists
                    ? current.filter(v => v !== option.value)
                    : [...current, option.value as any];
                  handleChange('objective', next);
                }}
                className={`group p-6 border-2 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                  (Array.isArray(profile.objective) && profile.objective.includes(option.value as any))
                    ? 'border-paradigma-mint bg-paradigma-mint/20 shadow-lg scale-105'
                    : 'border-paradigma-navy/50 hover:border-paradigma-mint/50 bg-paradigma-navy/40'
                }`}
              >
                <div className="text-4xl mb-3">{option.icon}</div>
                <div className={`font-bold text-lg mb-1 ${
                  (Array.isArray(profile.objective) && profile.objective.includes(option.value as any)) 
                    ? 'text-white' 
                    : 'text-gray-300'
                }`}>
                  {option.label}
                </div>
                <div className={`text-sm ${(Array.isArray(profile.objective) && profile.objective.includes(option.value as any)) ? 'text-gray-300' : 'text-gray-400'}`}>{option.desc}</div>
                {(Array.isArray(profile.objective) && profile.objective.includes(option.value as any)) && (
                  <div className="mt-3 flex items-center justify-center gap-1 text-paradigma-mint">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Selecionado</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {errors.objective && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/20 p-3 rounded-xl border border-red-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{errors.objective}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-paradigma-navy/60 hover:bg-paradigma-navy/80 text-white rounded-xl transition-all duration-300 border border-paradigma-mint/20"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-paradigma-mint hover:bg-paradigma-mint/90 text-paradigma-dark font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                🔍 Analisando...
              </>
            ) : (
              <>
                Gerar Diagnóstico
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
