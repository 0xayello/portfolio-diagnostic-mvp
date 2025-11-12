import React from 'react';

export default function DisclaimerCTA() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm">
      <div className="space-y-4">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 text-sm text-gray-700">
          <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            <span className="font-semibold text-gray-900">Importante:</span> Este diagnóstico é uma análise automatizada e não substitui uma consultoria personalizada por um profissional do mercado. Os resultados são indicativos e não devem ser considerados como recomendações definitivas de investimento.
          </p>
        </div>

        {/* Divisor */}
        <div className="border-t border-purple-200"></div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm">
            <div className="font-semibold text-purple-900 mb-1">💎 Quer uma análise personalizada?</div>
            <div className="text-gray-700">
              Entre para o <span className="font-bold text-purple-700">Paradigma PRO</span> e tenha acesso 24/7 aos nossos analistas.
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-purple-600 font-medium">
              🎁 Cupom <span className="font-bold">PORTFOLIO</span>: 6% OFF
            </div>
            <a
              href="https://paradigma.education/pro/?coupon=PORTFOLIO" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <span>Conheça o Paradigma PRO</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          </div>
        </div>
      </div>
    </div>
  );
}

