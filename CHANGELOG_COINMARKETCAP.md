# 🔄 Changelog: Integração CoinMarketCap API

**Data**: 29 de Outubro de 2025
**Versão**: 1.1.0

## 📋 Resumo das Mudanças

Integração completa da API do CoinMarketCap para busca de unlocks de tokens, com sistema de fallback redundante e documentação completa.

## ✅ O Que Foi Feito

### 1. 🔧 Correções no `CoinMarketCapService`

**Arquivo**: `src/services/coinmarketcap.ts`

#### Mudanças:
- ✅ **Nova interface interna** para `UnlockEvent` (não conflita mais com tipos globais)
- ✅ **Método `getUpcomingUnlocks()`** adicionado (formato compatível com o sistema)
- ✅ **Graceful degradation**: Não falha se API key não estiver configurada
- ✅ **Melhor tratamento de erros**: Logs mais informativos
- ✅ **Filtro por janela de tempo**: Retorna apenas unlocks dentro do período especificado

#### Código Antes:
```typescript
async getTokenUnlocks(symbol: string): Promise<UnlockEvent[]> {
  this.ensureApiKey(); // ❌ Lança erro se não tiver API key
  // ...
}
```

#### Código Depois:
```typescript
async getUpcomingUnlocks(symbols: string[], daysWindow: number = 180): Promise<Array<{
  token: string;
  unlockDate: string;
  percentage: number;
  amount: number;
}>> {
  // ✅ Retorna array vazio se não tiver API key (não falha)
  // ✅ Filtra por janela de tempo
  // ✅ Formato compatível com o sistema
}
```

---

### 2. 🔗 Integração no `DiagnosticService`

**Arquivo**: `src/services/diagnostic.ts`

#### Mudanças:
- ✅ **CoinMarketCapService importado e instanciado**
- ✅ **Busca paralela de 3 fontes**: UnlocksApp, DeFiLlama, CoinMarketCap
- ✅ **Promise.allSettled**: Não falha se uma fonte der erro
- ✅ **Deduplicação inteligente**: Remove eventos duplicados
- ✅ **Logs de debug**: Mostra quantos eventos vieram de cada fonte

#### Código:
```typescript
// Buscar de múltiplas fontes em paralelo
const [fromUnlocks, fromLlama, fromCMC] = await Promise.allSettled([
  this.unlocksAppService.getUpcomingUnlocks(unique, 180),
  this.defiLlamaService.getUpcomingUnlocks(unique, 180),
  this.coinMarketCapService.getUpcomingUnlocks(unique, 180), // ✅ NOVO
]);

// Log de debug
console.log('Unlock data sources:', {
  unlocksApp: fromUnlocks.status === 'fulfilled' ? fromUnlocks.value.length : 'failed',
  defiLlama: fromLlama.status === 'fulfilled' ? fromLlama.value.length : 'failed',
  coinMarketCap: fromCMC.status === 'fulfilled' ? fromCMC.value.length : 'failed',
});
```

---

### 3. 📚 Documentação Atualizada

#### `env.example`
- ✅ Comentários mais claros sobre cada API
- ✅ Indica que CoinMarketCap é **OPCIONAL**
- ✅ Aviso sobre disponibilidade do endpoint de unlocks
- ✅ Opção de endpoint customizado

#### `README.md`
- ✅ Seção de APIs atualizada com funções claras
- ✅ Instruções passo a passo melhoradas
- ✅ Badges indicando APIs obrigatórias vs. opcionais
- ✅ Link para guia completo de configuração
- ✅ Seção de testes de API

---

### 4. 📖 Novo Guia Completo

**Arquivo**: `docs/COINMARKETCAP_SETUP.md`

Um guia completo de 200+ linhas com:
- ✅ Visão geral e benefícios
- ✅ Passo a passo de configuração
- ✅ Comparação de planos (Basic, Hobbyist, Startup)
- ✅ Troubleshooting detalhado
- ✅ Testes manuais com curl
- ✅ Alternativas gratuitas
- ✅ Checklist de configuração

---

### 5. 🧪 Script de Teste

**Arquivo**: `scripts/test-coinmarketcap.ts`

Script completo para validar a API:
- ✅ Testa múltiplos tokens (TIA, ARB, OP, APT, SUI, DYDX)
- ✅ Mede tempo de resposta
- ✅ Agrupa resultados por token
- ✅ Mensagens de erro amigáveis
- ✅ Sugere soluções para problemas comuns

**Uso**:
```bash
npx ts-node scripts/test-coinmarketcap.ts
```

---

## 🎯 Arquitetura do Sistema de Unlocks

### Antes (2 fontes)
```
┌─────────────┐
│ Diagnostic  │
└──────┬──────┘
       │
       ├─────► UnlocksApp (primário)
       │
       └─────► DeFiLlama (fallback)
```

### Agora (3 fontes - redundância tripla!)
```
┌─────────────┐
│ Diagnostic  │
└──────┬──────┘
       │
       ├─────► UnlocksApp (gratuito, boa cobertura)
       │
       ├─────► DeFiLlama (gratuito, vesting)
       │
       └─────► CoinMarketCap (oficial, confiável) ✨ NOVO
```

**Benefícios**:
- ✅ Mais confiabilidade
- ✅ Dados oficiais do CMC quando disponíveis
- ✅ Sistema funciona mesmo se CMC falhar
- ✅ Busca paralela (mais rápido!)

---

## 📊 Status das APIs

| API | Função | Requerida? | Gratuita? |
|-----|--------|-----------|-----------|
| **CoinGecko** | Preços, market cap, histórico | ✅ SIM | ✅ Sim (Demo) |
| **UnlocksApp** | Unlocks primário | ❌ Não | ✅ Sim |
| **DeFiLlama** | Unlocks fallback | ❌ Não | ✅ Sim |
| **CoinMarketCap** | Unlocks oficial | ❌ Não | ⚠️ Parcial* |

\* O endpoint de unlocks pode não estar disponível no plano Basic (gratuito)

---

## 🔍 O Que Testar

### 1. Sem API Key do CoinMarketCap
```bash
# Sistema deve funcionar normalmente
npm run dev
# ✅ Usa UnlocksApp + DeFiLlama
```

### 2. Com API Key do CoinMarketCap
```bash
# Adicione ao .env.local:
COINMARKETCAP_API_KEY=sua_chave_aqui

# Teste
npx ts-node scripts/test-coinmarketcap.ts

# Inicie o app
npm run dev
# ✅ Usa 3 fontes em paralelo
```

### 3. Verificar Logs
Abra o console do navegador ou terminal e procure por:
```
Unlock data sources: {
  unlocksApp: 5,
  defiLlama: 3,
  coinMarketCap: 8  // ✅ Se aparecer número, está funcionando!
}
```

---

## ⚠️ Limitações Conhecidas

1. **Endpoint de Unlocks**
   - Pode não estar disponível no plano Basic (gratuito)
   - Se não funcionar, o sistema usa as outras 2 fontes
   - Considere upgrade para Hobbyist ($29/mês) se precisar

2. **Rate Limits**
   - Basic: 10.000 calls/mês (~333/dia)
   - Sistema faz cache automático para evitar exceder

3. **Formato de Dados**
   - Cada API retorna formato diferente
   - Sistema normaliza tudo automaticamente

---

## 🚀 Próximos Passos

### Opcional mas Recomendado:
1. ✅ Obter API key do CoinMarketCap (gratuita)
2. ✅ Executar script de teste
3. ✅ Monitorar logs em desenvolvimento
4. ✅ Implementar cache Redis em produção

### Para Produção:
1. ✅ Cache de 1h para resultados de unlocks
2. ✅ Monitoramento de rate limits
3. ✅ Alertas se APIs falharem
4. ✅ Analytics de quais fontes são mais usadas

---

## 📝 Checklist de Verificação

- [x] CoinMarketCapService corrigido
- [x] Interface UnlockEvent compatível
- [x] Integração no DiagnosticService
- [x] Busca paralela com Promise.allSettled
- [x] Deduplicação de eventos
- [x] Logs de debug
- [x] Documentação atualizada (README)
- [x] Documentação completa (guia CMC)
- [x] env.example atualizado
- [x] Script de teste criado
- [x] Graceful degradation (funciona sem API key)
- [x] Tratamento de erros robusto

---

## 🎉 Resultado Final

**A API do CoinMarketCap está agora:**
- ✅ Totalmente integrada
- ✅ Opcional (não quebra se não configurada)
- ✅ Bem documentada
- ✅ Testável
- ✅ Com fallback robusto
- ✅ Em paralelo com outras fontes

**O sistema agora tem:**
- 🔥 **Redundância tripla** para unlocks
- 🔥 **Busca paralela** (mais rápido)
- 🔥 **Dados oficiais** do CoinMarketCap
- 🔥 **Funciona sem configuração** (usa fontes gratuitas)

---

**Desenvolvido com ❤️ pela equipe Bom Digma**

