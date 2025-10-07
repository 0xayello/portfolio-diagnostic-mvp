import React from 'react';

export default function CTAs() {
  return (
    <div className="bg-gradient-to-r from-bomdigma-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Continue Acompanhando o Mercado Cripto
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Receba análises exclusivas, insights de portfólio e oportunidades de investimento 
          direto na sua caixa de entrada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Newsletter CTA */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-3">
              Bom Digma Newsletter
            </h3>
            <p className="text-blue-100 mb-4">
              Assine gratuitamente e receba o <strong>Relatório Mensal de Portfólio</strong> 
              com análises detalhadas do mercado.
            </p>
            <a
              href="https://bomdigma.com/newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-3 px-6 bg-white text-bomdigma-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Assinar Gratuitamente
            </a>
          </div>
        </div>

        {/* Community CTA */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">
              Call da Comunidade
            </h3>
            <p className="text-blue-100 mb-4">
              <strong>Semana especial</strong> para quem usou nossa ferramenta. 
              Discussões sobre estratégias de portfólio e oportunidades do mercado.
            </p>
            <a
              href="https://bomdigma.com/community"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-3 px-6 bg-white text-bomdigma-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Participar da Call
            </a>
          </div>
        </div>

        {/* Tools CTA */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">
              Planilha de Ferramentas
            </h3>
            <p className="text-blue-100 mb-4">
              Baixe a <strong>planilha com as ferramentas favoritas da Paradigma</strong> 
              para análise técnica e fundamental.
            </p>
            <a
              href="https://bomdigma.com/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-3 px-6 bg-white text-bomdigma-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Baixar Planilha
            </a>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-300">10K+</div>
            <div className="text-blue-100">Investidores Ativos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-300">95%</div>
            <div className="text-blue-100">Satisfação dos Usuários</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-300">24/7</div>
            <div className="text-blue-100">Suporte da Comunidade</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white border-opacity-20 text-center">
        <p className="text-blue-100 text-sm">
          © 2024 Bom Digma. Todos os direitos reservados. | 
          <a href="https://bomdigma.com/privacy" className="underline hover:text-white ml-1">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
