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
    cryptoPercentage: 0,
    objective: undefined,
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
    
    if (profile.cryptoPercentage === undefined || profile.cryptoPercentage <= 0) {
      newErrors.cryptoPercentage = 'Informe a porcentagem do patrimônio em cripto';
    }
    
    if (!profile.objective) {
      newErrors.objective = 'Selecione seu objetivo principal';
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
    <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Quiz de Perfil de Investidor
      </h2>
      
      <p className="text-gray-600 mb-8">
        Responda as perguntas abaixo para personalizar seu diagnóstico de portfólio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Horizonte de Investimento */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            1. Qual é seu horizonte de investimento?
          </label>
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
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  profile.horizon === option.value
                    ? 'border-bomdigma-500 bg-bomdigma-50 text-bomdigma-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </button>
            ))}
          </div>
          {errors.horizon && <p className="text-red-500 text-sm mt-2">{errors.horizon}</p>}
        </div>

        {/* Tolerância ao Risco */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            2. Qual é sua tolerância ao risco?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                value: 'low', 
                label: 'Conservador', 
                desc: 'Preservar capital com baixo risco', 
                icon: '🛡️',
                color: 'green'
              },
              { 
                value: 'medium', 
                label: 'Moderado', 
                desc: 'Equilíbrio entre risco e retorno', 
                icon: '⚖️',
                color: 'yellow'
              },
              { 
                value: 'high', 
                label: 'Arrojado', 
                desc: 'Aceita alto risco por maior retorno', 
                icon: '🚀',
                color: 'red'
              }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('riskTolerance', option.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  profile.riskTolerance === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-900`
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </button>
            ))}
          </div>
          {errors.riskTolerance && <p className="text-red-500 text-sm mt-2">{errors.riskTolerance}</p>}
        </div>

        {/* Porcentagem em Cripto */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            3. Que porcentagem do seu patrimônio total está em criptomoedas?
          </label>
          <div className="max-w-md">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={profile.cryptoPercentage || ''}
              onChange={(e) => handleChange('cryptoPercentage', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 15"
              className="form-input text-lg"
            />
            <div className="flex items-center mt-2">
              <span className="text-gray-500">%</span>
              <span className="ml-2 text-sm text-gray-600">
                do patrimônio total em cripto
              </span>
            </div>
          </div>
          {errors.cryptoPercentage && <p className="text-red-500 text-sm mt-2">{errors.cryptoPercentage}</p>}
        </div>

        {/* Objetivo Principal */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            4. Qual é seu objetivo principal com criptomoedas?
          </label>
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
                onClick={() => handleChange('objective', option.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  profile.objective === option.value
                    ? 'border-bomdigma-500 bg-bomdigma-50 text-bomdigma-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </button>
            ))}
          </div>
          {errors.objective && <p className="text-red-500 text-sm mt-2">{errors.objective}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            Voltar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Gerando Diagnóstico...' : 'Gerar Diagnóstico'}
          </button>
        </div>
      </form>
    </div>
  );
}
