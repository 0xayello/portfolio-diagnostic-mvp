# 🚀 Diagnóstico de Portfólio Cripto - MVP

## 📋 Visão Geral

MVP de diagnóstico de portfólio cripto que analisa a alocação do usuário, gera insights sobre risco e diversificação, e fornece sugestões de rebalanceamento baseadas no perfil de investidor.

## ✨ Funcionalidades

### ✅ Implementadas
- ✅ Formulário de alocação com autocomplete de tokens
- ✅ Quiz de perfil de investidor (4 perguntas)
- ✅ Engine de diagnóstico com todas as regras especificadas
- ✅ Gráficos de pizza (por ativo e setor)
- ✅ Sistema de flags (Red/Yellow/Green)
- ✅ Backtest simplificado (30/90/180 dias)
- ✅ Alertas de unlocks (mock)
- ✅ Sugestões de rebalanceamento
- ✅ CTAs da newsletter Bom Digma
- ✅ Design responsivo e moderno

### 🔧 APIs Integradas
- ✅ CoinGecko API (principal)
- ✅ CoinMarketCap API (fallback)
- ✅ DeFiLlama (preparado para unlocks)

## 🛠️ Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# CoinGecko API Configuration
COINGECKO_API_KEY=your_coingecko_api_key_here

# CoinMarketCap API Configuration (fallback)
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Obter Chaves de API

#### CoinGecko (Recomendado)
1. Acesse: https://www.coingecko.com/en/api
2. Registre-se e obtenha uma chave Demo (gratuita)
3. Limite: ~30 requisições/minuto

#### CoinMarketCap (Fallback)
1. Acesse: https://coinmarketcap.com/api/
2. Registre-se no plano Basic (gratuito)
3. Limite: 10.000 requisições/mês

### 4. Executar o Projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📊 Regras de Diagnóstico

### Flags por Ativo
- **≥20%** em ativo que não seja BTC/ETH/SOL/USDC/USDT → **Yellow**
- **≥40%** em ativo que não seja BTC/ETH/SOL → **Red**
- **>60%** em qualquer único ativo → **Red**

### Flags por Setor
- **>50%** em um único setor:
  - Conservador: **Red**
  - Moderado/Arrojado: **Yellow**

### Stablecoins (por perfil)
- **Conservador:** 20–30%
- **Moderado:** 15–20%
- **Arrojado:** 0–15%

### FDV/Mcap
- **FDV / Mcap > 3** → **Yellow** (Red se alocação alta)

### Liquidez
- Volume 24h / market cap **< 1%** → **Yellow/Red**

### Unlocks
- **≥5%** do supply total nos próximos **60 dias** → **Yellow/Red**

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes React
│   ├── PortfolioForm.tsx
│   ├── ProfileQuiz.tsx
│   ├── DiagnosticResults.tsx
│   ├── PortfolioChart.tsx
│   ├── FlagsList.tsx
│   ├── BacktestChart.tsx
│   ├── UnlockAlerts.tsx
│   ├── RebalanceSuggestions.tsx
│   └── CTAs.tsx
├── pages/
│   ├── api/            # APIs do Next.js
│   │   ├── diagnostic.ts
│   │   └── search-coins.ts
│   ├── index.tsx       # Página principal
│   └── _app.tsx
├── services/           # Serviços de API
│   ├── coingecko.ts
│   └── diagnostic.ts
├── types/              # Tipos TypeScript
│   └── portfolio.ts
├── data/               # Dados estáticos
│   └── sectors.json
└── styles/
    └── globals.css
```

## 🔄 Fluxo da Aplicação

1. **PortfolioForm**: Usuário configura alocação (100%)
2. **ProfileQuiz**: Usuário responde 4 perguntas sobre perfil
3. **DiagnosticResults**: Sistema gera análise completa
4. **CTAs**: Promoção da newsletter Bom Digma

## 🚀 Deploy

### Vercel (Recomendado)
1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Import Project** → Conecte o repositório
4. **Configure as variáveis de ambiente**
5. **Deploy** → A aplicação ficará disponível

### Outras Plataformas
- **Netlify**: Conecte com GitHub e configure build
- **Railway**: Deploy direto do repositório
- **AWS Amplify**: Conecte repositório e configure

## 📈 Melhorias Futuras

### Fase 2
- [ ] Integração real com DeFiLlama Unlocks
- [ ] Cache Redis para performance
- [ ] Sistema de usuários/login
- [ ] Histórico de diagnósticos

### Fase 3
- [ ] Conectar carteiras reais (DeBank/Zapper)
- [ ] Score de liquidez mais robusto
- [ ] Classificador automático de setores
- [ ] Estratégias de renda passiva

## 🐛 Troubleshooting

### Erro de API
- Verifique se as chaves de API estão configuradas
- CoinGecko tem limite de 30 req/min (Demo) - aguarde se exceder

### Erro de Build
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas

### Performance
- Use cache Redis em produção
- Considere CDN para assets estáticos

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação das APIs:
  - [CoinGecko API](https://docs.coingecko.com/)
  - [CoinMarketCap API](https://coinmarketcap.com/api/documentation/)
  - [DeFiLlama API](https://api-docs.defillama.com/)

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ pela equipe Bom Digma**
# Test deployment
