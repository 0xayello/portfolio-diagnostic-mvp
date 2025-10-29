# 🧪 Teste da API CoinMarketCap com Token Meteora (MET)

## 📋 Informações do Token

**Nome**: Meteora  
**Símbolo**: MET  
**Rede**: Solana  
**Website**: https://meteora.ag/  
**CMC Page**: https://coinmarketcap.com/currencies/meteora/

---

## 🔧 Como Executar o Teste

```bash
# 1. Certifique-se de ter a API key configurada
echo "COINMARKETCAP_API_KEY=sua_chave_aqui" >> .env.local

# 2. Instale ts-node se ainda não tiver
npm install -D ts-node

# 3. Execute o teste
npx ts-node scripts/test-meteora.ts
```

---

## 📊 Resultado Esperado do Teste

### ✅ Cenário 1: Unlocks Encontrados

```
🌟 Testando API do CoinMarketCap com token METEORA

============================================================

📋 Testando possíveis símbolos do Meteora:
   MET, METEORA, METORA

────────────────────────────────────────────────────────────
🔍 Testando símbolo: MET
────────────────────────────────────────────────────────────

✅ SUCESSO! Encontrado como "MET"

⏱️  Tempo de resposta: 1234ms
📦 Total de unlocks: 5

🔓 Próximos unlocks:

1. MET
   📅 Data: 2025-12-15
   💰 Quantidade: 5,000,000 tokens
   📊 Porcentagem do supply: 2.50%
   🚨 Severidade: YELLOW 🟡

2. MET
   📅 Data: 2026-01-15
   💰 Quantidade: 10,000,000 tokens
   📊 Porcentagem do supply: 5.00%
   🚨 Severidade: YELLOW 🟡

3. MET
   📅 Data: 2026-03-15
   💰 Quantidade: 25,000,000 tokens
   📊 Porcentagem do supply: 12.50%
   🚨 Severidade: RED 🔴

4. MET
   📅 Data: 2026-06-15
   💰 Quantidade: 15,000,000 tokens
   📊 Porcentagem do supply: 7.50%
   🚨 Severidade: YELLOW 🟡

5. MET
   📅 Data: 2026-09-15
   💰 Quantidade: 20,000,000 tokens
   📊 Porcentagem do supply: 10.00%
   🚨 Severidade: RED 🔴

📈 ANÁLISE:
   • Total a ser desbloqueado: 37.50% do supply
   • Média por evento: 7.50%
   • Maior unlock: 12.50% em 2026-03-15
   • Unlocks de alto risco (≥10%): 2
   • Unlocks de médio risco (<10%): 3

============================================================
```

### ⚠️ Cenário 2: Endpoint Não Disponível

```
🌟 Testando API do CoinMarketCap com token METEORA

============================================================

────────────────────────────────────────────────────────────
🔍 Testando símbolo: MET
────────────────────────────────────────────────────────────

⚠️  Nenhum unlock encontrado para "MET"
   (Pode não ter unlocks programados ou símbolo incorreto)

────────────────────────────────────────────────────────────
🔍 Testando símbolo: METEORA
────────────────────────────────────────────────────────────

⚠️  Nenhum unlock encontrado para "METEORA"
   (Pode não ter unlocks programados ou símbolo incorreto)

============================================================

💡 DICAS:
   • Se nenhum símbolo funcionou, o token pode não estar no CMC
   • Verifique o símbolo correto em: https://coinmarketcap.com/
   • O endpoint de unlocks pode não estar disponível no seu plano
   • Certifique-se de que COINMARKETCAP_API_KEY está configurada
```

### ❌ Cenário 3: API Key Não Configurada

```
🌟 Testando API do CoinMarketCap com token METEORA

============================================================

────────────────────────────────────────────────────────────
🔍 Testando símbolo: MET
────────────────────────────────────────────────────────────

⚠️  CoinMarketCap API key not configured, skipping unlock fetch
⚠️  Nenhum unlock encontrado para "MET"

============================================================

💡 DICAS:
   • Certifique-se de que COINMARKETCAP_API_KEY está configurada
```

---

## 🔍 O Que o Teste Verifica

### 1. **Conectividade com a API**
- ✅ API key válida
- ✅ Endpoint acessível
- ✅ Timeout adequado

### 2. **Busca do Token**
- ✅ Identifica o símbolo correto (MET, METEORA, etc.)
- ✅ Busca o ID interno do token no CMC
- ✅ Recupera dados de supply

### 3. **Dados de Unlocks**
- ✅ Data do unlock
- ✅ Quantidade de tokens
- ✅ Porcentagem do supply total
- ✅ Valor em USD (se disponível)

### 4. **Análise de Risco**
- ✅ Classifica severidade (RED ≥10%, YELLOW <10%)
- ✅ Calcula total a ser desbloqueado
- ✅ Identifica maior unlock
- ✅ Conta eventos de alto/médio risco

---

## 📊 Estrutura dos Dados Retornados

### Formato JSON
```json
[
  {
    "token": "MET",
    "unlockDate": "2025-12-15",
    "percentage": 2.5,
    "amount": 5000000
  },
  {
    "token": "MET",
    "unlockDate": "2026-03-15",
    "percentage": 12.5,
    "amount": 25000000
  }
]
```

### Formato no Sistema
```typescript
interface UnlockAlert {
  token: string;           // "MET"
  unlockDate: string;      // "2025-12-15"
  percentage: number;      // 2.5
  amount: number;          // 5000000
  type: 'token_unlock';    // Fixo
  severity: 'yellow' | 'red'; // Baseado em percentage
}
```

---

## 🔧 Debug e Troubleshooting

### Ver Logs Detalhados

O serviço CoinMarketCap já tem logs automáticos:

```typescript
// src/services/diagnostic.ts
console.log('🔍 Buscando unlocks no CoinMarketCap para:', unique);
console.log('✅ CoinMarketCap retornou:', unlockEvents.length, 'eventos');
```

### Testar Manualmente com cURL

```bash
# 1. Buscar ID do token
curl -H "X-CMC_PRO_API_KEY: SUA_CHAVE" \
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=MET"

# Resposta esperada:
# {
#   "data": [
#     {
#       "id": 12345,
#       "name": "Meteora",
#       "symbol": "MET",
#       "slug": "meteora"
#     }
#   ]
# }

# 2. Buscar unlocks (se endpoint disponível)
curl -H "X-CMC_PRO_API_KEY: SUA_CHAVE" \
  "https://pro-api.coinmarketcap.com/v1/content/token-unlocks?symbol=MET"
```

---

## 💡 Notas Importantes

### Sobre o Token Meteora

1. **Lançamento Recente**: Meteora foi lançado recentemente na Solana
2. **Tokenomics**: Pode ter schedule de vesting/unlocks programado
3. **Dados Limitados**: Informações podem estar incompletas no CMC

### Sobre o Endpoint de Unlocks

1. **Disponibilidade**: Pode não estar disponível no plano Basic
2. **Alternativas**: 
   - Plano Hobbyist ($29/mês) geralmente tem acesso
   - Plano Startup ($79/mês) tem acesso completo
3. **Fallback**: Se não funcionar, os dados ficam vazios (array vazio)

### Performance

- **Tempo médio**: 500-2000ms por símbolo
- **Rate limit**: 333 chamadas/dia (plano Basic)
- **Cache**: Recomendado implementar cache de 1h

---

## 🎯 Próximos Passos

### Se o Teste Passar ✅
1. Implementar no sistema de diagnóstico
2. Adicionar cache Redis
3. Monitorar rate limits
4. Configurar alertas

### Se o Teste Falhar ❌
1. Verificar API key
2. Confirmar símbolo do token
3. Verificar plano do CMC
4. Considerar upgrade se necessário
5. Verificar status da API: https://status.coinmarketcap.com/

---

## 📚 Recursos

- [CoinMarketCap API Docs](https://coinmarketcap.com/api/documentation/v1/)
- [Meteora CMC Page](https://coinmarketcap.com/currencies/meteora/)
- [Meteora Website](https://meteora.ag/)
- [Status da API CMC](https://status.coinmarketcap.com/)

---

**Para executar o teste real, use**:
```bash
npx ts-node scripts/test-meteora.ts
```


