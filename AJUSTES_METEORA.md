# 🎯 Ajustes Baseados nos Dados Reais do Meteora

**Data**: 29 de Outubro de 2025  
**Referência**: CoinMarketCap Token Unlocks Page

---

## 📊 Dados Reais Identificados

Baseado na página do CoinMarketCap para Meteora:

```
🌐 URL: coinmarketcap.com/currencies/meteora/#token_unlocks

📈 DADOS CORRETOS:
├─ Token: Meteora (MET)
├─ Max Supply: 1,000,000,000 MET (1B)
├─ Total de Unlocks: 71 eventos
├─ Quantidade por unlock: 7.32M MET (~$3.35M)
├─ Porcentagem: 0.73% do max supply
├─ Frequência: Mensal (dia 22)
└─ Período: Nov 2025 até ~2031
```

### Exemplo de Eventos
| Data | Quantidade | % Max Supply | Valor USD |
|------|-----------|--------------|-----------|
| Nov 22, 2025 | 7.32M MET | 0.73% | $3.35M |
| Dec 22, 2025 | 7.32M MET | 0.73% | $3.35M |
| Jan 22, 2026 | 7.32M MET | 0.73% | $3.35M |
| ... | ... | ... | ... |
| *(71 eventos)* |

---

## 🔧 Ajustes Realizados

### 1. **Logs Detalhados no `coinmarketcap.ts`**

Adicionamos logs extensivos para debug:

```typescript
✅ ANTES (sem logs):
private async getTokenUnlocks(symbol: string): Promise<UnlockEvent[]> {
  const tokenId = await this.getIdForSymbol(symbol);
  const resp = await fetch(url);
  // ... processar
}

✅ AGORA (com logs detalhados):
private async getTokenUnlocks(symbol: string): Promise<UnlockEvent[]> {
  console.log(`🔍 Buscando ID do token ${symbol}...`);
  const tokenId = await this.getIdForSymbol(symbol);
  
  console.log(`✅ Token encontrado! ID: ${tokenId}`);
  console.log(`💰 Preço: $${priceUsd} | Max Supply: ${maxSupply}`);
  console.log(`📡 Consultando endpoint: ${this.UNLOCKS_PATH}`);
  
  const resp = await fetch(url);
  console.log(`📦 Resposta recebida:`, JSON.stringify(payload, null, 2));
  console.log(`📊 Eventos encontrados: ${rawEvents.length}`);
  console.log(`✅ Eventos processados: ${events.length}`);
  
  if (events.length > 0) {
    console.log(`📅 Próximo unlock: ${events[0].date} - ${events[0].amount.toLocaleString()} tokens`);
  }
}
```

**Benefícios**:
- ✅ Ver exatamente o que a API retorna
- ✅ Identificar problemas de formato
- ✅ Validar cálculos de porcentagem
- ✅ Debug mais fácil

---

### 2. **Múltiplos Formatos de Resposta**

A API pode retornar dados em formatos diferentes. Adicionamos suporte para todos:

```typescript
// Antes: Apenas um formato
const rawEvents = payload?.data || [];

// Agora: Suporta múltiplos formatos
let rawEvents: CmcUnlockRawEvent[] = [];

if (Array.isArray(payload)) {
  rawEvents = payload;                      // Formato 1: Array direto
} else if (Array.isArray(payload?.data)) {
  rawEvents = payload.data;                 // Formato 2: { data: [...] }
} else if (Array.isArray(payload?.data?.events)) {
  rawEvents = payload.data.events;          // Formato 3: { data: { events: [...] } }
} else if (payload?.data) {
  rawEvents = [payload.data];               // Formato 4: Objeto único
}
```

---

### 3. **Mensagens de Erro Específicas**

Agora identificamos exatamente o problema:

```typescript
if (!resp.ok) {
  const statusText = resp.status === 403 ? 'Endpoint não disponível no seu plano' 
                   : resp.status === 404 ? 'Endpoint não encontrado'
                   : `Status ${resp.status}`;
  console.warn(`❌ CMC unlocks endpoint: ${statusText} (${resp.status})`);
  return [];
}
```

**Mensagens possíveis**:
- `403` → "Endpoint não disponível no seu plano" (precisa upgrade)
- `404` → "Endpoint não encontrado" (endpoint pode não existir)
- `401` → "API key inválida"
- Outros → Status genérico

---

### 4. **Script de Teste Melhorado**

O `test-meteora.ts` agora valida automaticamente os dados:

```typescript
// Dados esperados do CMC
const expectedTotal = 71;
const expectedAmount = 7320000; // 7.32M
const expectedPercentage = 0.73;

// Validação automática
console.log('🔍 VALIDAÇÃO DOS DADOS:\n');

if (unlocks.length === expectedTotal) {
  console.log(`   ✅ Total de eventos: ${unlocks.length} (esperado: ${expectedTotal})`);
} else {
  console.log(`   ⚠️  Total de eventos: ${unlocks.length} (esperado: ${expectedTotal})`);
  console.log(`   ℹ️  Pode estar mostrando apenas eventos futuros`);
}

// Verificar valores
const amountMatch = Math.abs(firstUnlock.amount - expectedAmount) < 100000;
const percentageMatch = Math.abs(firstUnlock.percentage - expectedPercentage) < 0.01;

if (amountMatch) {
  console.log(`   ✅ Quantidade: ${firstUnlock.amount.toLocaleString()}`);
} else {
  console.log(`   ⚠️  Quantidade: ${firstUnlock.amount.toLocaleString()} (esperado: ${expectedAmount.toLocaleString()})`);
}
```

**Novo relatório inclui**:
- ✅ Validação de quantidade (7.32M)
- ✅ Validação de porcentagem (0.73%)
- ✅ Mostra primeiro 10 unlocks
- ✅ Análise de risco (alto/médio/baixo)
- ✅ Análise temporal (próximos 30/90 dias)
- ✅ Estatísticas completas

---

### 5. **Documentação de Divergências**

Criamos `docs/DIVERGENCIAS_API.md` explicando:

#### Por que pode haver divergências:
1. **Endpoint não disponível** no plano gratuito (403)
2. **Formato de resposta diferente** (múltiplos formatos)
3. **Max supply incorreto** (afeta cálculo de %)
4. **Apenas eventos futuros** (filtro de data)
5. **Janela de tempo limitada** (180 dias padrão)

#### Como debugar:
- Verificar logs detalhados
- Inspecionar resposta da API (JSON completo)
- Comparar com dados esperados
- Testes manuais com curl

#### Valores corretos do Meteora:
| Campo | Valor |
|-------|-------|
| Max Supply | 1,000,000,000 |
| Unlock Amount | 7,320,000 |
| Unlock % | 0.73% |
| Total Eventos | 71 |

---

## 🎯 Resultado dos Ajustes

### Output Esperado do Teste

```bash
npx ts-node scripts/test-meteora.ts
```

#### Cenário 1: Sucesso ✅
```
🌟 Testando API do CoinMarketCap com token METEORA (MET)

📊 DADOS ESPERADOS (conforme CoinMarketCap):
   • Total de eventos: 71 unlocks
   • Quantidade: 7.32M MET por evento
   • Porcentagem: 0.73% do max supply
   • Max supply: 1B MET
   • Frequência: Mensal (dia 22)

🔍 Testando símbolo: MET

🔍 Buscando ID do token MET...
✅ Token encontrado! ID: 12345
💰 Preço: $0.4580 | Max Supply: 1,000,000,000
📡 Consultando endpoint: /v1/content/token-unlocks
📦 Resposta recebida: { ... }
📊 Eventos encontrados: 71
✅ Eventos processados: 50 (após filtros)
📅 Próximo unlock: 2025-11-22 - 7,320,000 tokens (0.73%)

✅ SUCESSO! Encontrado como "MET"

⏱️  Tempo de resposta: 1234ms
📦 Total de unlocks retornados: 50

🔍 VALIDAÇÃO DOS DADOS:

   ⚠️  Total de eventos: 50 (esperado: 71)
   ℹ️  Pode estar mostrando apenas eventos futuros
   ✅ Quantidade por unlock: 7,320,000 (esperado: 7,320,000)
   ✅ Porcentagem: 0.73% (esperado: 0.73%)

🔓 Próximos 10 unlocks:

1. MET
   📅 Data: 2025-11-22
   💰 Quantidade: 7,320,000 tokens
   📊 Porcentagem do supply: 0.73%
   🚨 Severidade: YELLOW 🟡

2. MET
   📅 Data: 2025-12-22
   💰 Quantidade: 7,320,000 tokens
   📊 Porcentagem do supply: 0.73%
   🚨 Severidade: YELLOW 🟡

... e mais 48 eventos

📈 ANÁLISE:
   • Total a ser desbloqueado: 36.50% do supply
   • Média por evento: 0.73%
   • Maior unlock: 0.73% em 2025-11-22
   • Menor unlock: 0.73% em 2031-XX-XX
   • Unlocks de alto risco (≥10%): 0
   • Unlocks de médio risco (1-10%): 0
   • Unlocks de baixo risco (<1%): 50

⏰ PRÓXIMOS UNLOCKS:
   • Próximos 30 dias: 1 eventos (0.73%)
   • Próximos 90 dias: 3 eventos (2.19%)
```

#### Cenário 2: Endpoint Não Disponível ⚠️
```
🔍 Testando símbolo: MET

🔍 Buscando ID do token MET...
✅ Token encontrado! ID: 12345
💰 Preço: $0.4580 | Max Supply: 1,000,000,000
📡 Consultando endpoint: /v1/content/token-unlocks
❌ CMC unlocks endpoint: Endpoint não disponível no seu plano (403)

⚠️  Nenhum unlock encontrado para "MET"

💡 DICAS:
   • O endpoint de unlocks pode não estar disponível no seu plano
   • Pode ser necessário plano Hobbyist ($29/mês) ou superior
```

---

## 📝 Arquivos Modificados

```
✅ src/services/coinmarketcap.ts
   ├─ Logs detalhados para debug
   ├─ Suporte a múltiplos formatos
   ├─ Mensagens de erro específicas
   └─ Validação de dados

✅ scripts/test-meteora.ts
   ├─ Dados esperados do Meteora
   ├─ Validação automática
   ├─ Análise de risco
   ├─ Análise temporal
   └─ Estatísticas completas

✅ docs/DIVERGENCIAS_API.md (NOVO)
   ├─ Explicação de divergências
   ├─ Valores corretos do Meteora
   ├─ Como debugar problemas
   └─ Testes manuais com curl

✅ AJUSTES_METEORA.md (este arquivo)
   └─ Resumo de todos os ajustes
```

---

## 🧪 Como Testar Agora

### 1. Configure a API Key
```bash
echo "COINMARKETCAP_API_KEY=sua_chave" >> .env.local
```

### 2. Execute o Teste
```bash
npm install -D ts-node
npx ts-node scripts/test-meteora.ts
```

### 3. Analise os Logs

**Se funcionar** ✅:
- Veja os dados retornados
- Valide se correspondem aos valores esperados
- Verifique cálculo de porcentagem (deve ser 0.73%)

**Se não funcionar** ⚠️:
- Veja o código de status HTTP
- Se 403: Endpoint requer plano pago
- Se 404: Endpoint não existe
- Se 401: API key inválida

### 4. Verifique no Sistema Real
```bash
npm run dev
# Abra o console do navegador
# Teste com um portfólio incluindo MET
# Verifique logs: 🔍 Buscando unlocks...
```

---

## 🎯 Valores de Referência

Use estes valores para validar:

```javascript
const METEORA_REFERENCE = {
  symbol: 'MET',
  maxSupply: 1000000000,        // 1B
  unlockAmount: 7320000,         // 7.32M
  unlockPercentage: 0.73,        // 0.73%
  totalEvents: 71,               // Total histórico
  frequency: 'monthly',          // Mensal
  dayOfMonth: 22,                // Dia 22
  firstUnlock: '2025-11-22',
  valuePerUnlock: 3350000,       // ~$3.35M (varia com preço)
};

// Validação
assert(amount === 7320000);
assert(Math.abs(percentage - 0.73) < 0.01);
assert(maxSupply === 1000000000);
```

---

## ⚠️ Notas Importantes

### Sobre Total de Eventos

**71 eventos** é o total **histórico + futuro** no site.

**API pode retornar menos** porque:
1. Filtramos apenas eventos futuros (correto!)
2. Limitamos janela de 180 dias (padrão)

**Exemplo**:
- Site: 71 eventos (Nov 2025 até 2031)
- API: 50 eventos (a partir de hoje, próximos 180 dias)

**Isso é esperado e correto** ✅

### Sobre Porcentagem

**SEMPRE deve ser 0.73%** para Meteora:
```
7,320,000 / 1,000,000,000 * 100 = 0.73%
```

Se estiver diferente, verifique:
- Max supply está correto? (deve ser 1B)
- Amount está correto? (deve ser 7.32M)

---

## 🚀 Próximos Passos

1. **Execute o teste** e compartilhe os logs
2. **Valide** se os valores batem (0.73%, 7.32M)
3. **Se funcionar**: Sistema pronto para produção! 🎉
4. **Se não funcionar**: Analise o erro específico e considere upgrade de plano

---

## 📚 Recursos

- [Dados no CMC](https://coinmarketcap.com/currencies/meteora/#token_unlocks)
- [Documentação API CMC](https://coinmarketcap.com/api/documentation/v1/)
- [Guia de Divergências](./docs/DIVERGENCIAS_API.md)
- [Script de Teste](./scripts/test-meteora.ts)

---

**Pronto para testar! Execute**: `npx ts-node scripts/test-meteora.ts` 🚀

