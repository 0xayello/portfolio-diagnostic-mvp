# 🔍 Entendendo Divergências entre API e Site do CoinMarketCap

## 📊 Contexto: Meteora (MET)

Ao verificar os dados de unlock do Meteora no site do CoinMarketCap, vemos:

### Dados no Site (coinmarketcap.com)
- **Total de eventos**: 71 unlocks
- **Quantidade por evento**: 7.32M MET (~$3.35M)
- **Porcentagem**: 0.73% do max supply
- **Max supply**: 1B MET (1,000,000,000)
- **Frequência**: Mensal, dia 22 de cada mês
- **Período**: Nov 2025 até 2031+

### Exemplo de Eventos
```
Nov 22, 2025: 7.32M MET (0.73%)
Dec 22, 2025: 7.32M MET (0.73%)
Jan 22, 2026: 7.32M MET (0.73%)
...
(71 eventos no total)
```

---

## ⚠️ Possíveis Divergências

### 1. **Endpoint Não Disponível no Plano Gratuito**

**Problema**: O endpoint `/v1/content/token-unlocks` pode não estar disponível.

**Status HTTP esperados**:
- `403 Forbidden` - Endpoint requer plano pago
- `404 Not Found` - Endpoint não existe
- `401 Unauthorized` - API key inválida

**Solução**:
```bash
# Verificar disponibilidade
curl -H "X-CMC_PRO_API_KEY: SUA_CHAVE" \
  "https://pro-api.coinmarketcap.com/v1/content/token-unlocks?symbol=MET"

# Se retornar 403 ou 404
# Considere upgrade para plano Hobbyist ($29/mês) ou superior
```

---

### 2. **Formato de Resposta Diferente**

**Problema**: A API pode retornar os dados em formato diferente do esperado.

**Formatos possíveis**:

#### Formato 1: Array direto
```json
[
  {
    "date": "2025-11-22",
    "amount": 7320000,
    "percentage_of_max_supply": 0.73,
    "usd_value": 3350000
  }
]
```

#### Formato 2: Objeto com data
```json
{
  "data": [
    {
      "date": "2025-11-22",
      "amount": 7320000,
      "percentage_of_max_supply": 0.73
    }
  ]
}
```

#### Formato 3: Objeto aninhado
```json
{
  "data": {
    "events": [
      {
        "date": "2025-11-22",
        "amount": 7320000
      }
    ]
  }
}
```

**Nossa solução**: O código agora tenta todos os formatos automaticamente.

---

### 3. **Dados de Max Supply Incorretos**

**Problema**: Se o max supply não for retornado corretamente, a porcentagem será calculada errada.

**Verificação**:
```typescript
// Meteora deve ter:
maxSupply: 1000000000 (1B MET)

// Se o cálculo retornar valores diferentes de 0.73%:
// amount / maxSupply * 100
// 7320000 / 1000000000 * 100 = 0.73% ✅
```

**Solução no código**:
```typescript
// Linha 161-163 em coinmarketcap.ts
const percentageOfMaxSupply = e.percentage_of_max_supply ?? (
  maxSupply && amount ? (amount / maxSupply) * 100 : 0
);
```

Se `percentage_of_max_supply` não vier na resposta, calculamos manualmente.

---

### 4. **Apenas Eventos Futuros**

**Problema**: A API pode retornar apenas unlocks futuros, não históricos.

**Exemplo**:
- Site mostra: 71 eventos (desde Nov 2025 até 2031+)
- API retorna: 50 eventos (apenas a partir de hoje)

**Filtro no código**:
```typescript
// Linha 172 em coinmarketcap.ts
.filter(e => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0))
```

Isso é **esperado e correto** - só queremos unlocks futuros para alertas!

---

### 5. **Diferentes Janelas de Tempo**

**Problema**: Limitamos a busca para 180 dias, mas o site mostra todos.

**Código atual**:
```typescript
await service.getUpcomingUnlocks(['MET'], 180); // Apenas próximos 180 dias
```

**Para ver todos os eventos**:
```typescript
await service.getUpcomingUnlocks(['MET'], 3650); // 10 anos
```

---

## 🔧 Como Debugar Divergências

### Passo 1: Verificar Logs Detalhados

O código agora tem logs extensivos:

```typescript
🔍 Buscando ID do token MET...
✅ Token encontrado! ID: 12345
💰 Preço: $0.4580 | Max Supply: 1,000,000,000
📡 Consultando endpoint: /v1/content/token-unlocks
📦 Resposta recebida: { ... }
📊 Eventos encontrados: 71
✅ Eventos processados: 50 (após filtros)
📅 Próximo unlock: 2025-11-22 - 7,320,000 tokens (0.73%)
```

### Passo 2: Inspecionar Resposta da API

Adicionamos log da resposta completa:

```typescript
console.log(`📦 Resposta recebida:`, JSON.stringify(payload, null, 2));
```

Isso mostra **exatamente** o que a API retornou.

### Passo 3: Comparar com Dados Esperados

O script de teste agora valida automaticamente:

```typescript
✅ Total de eventos: 50 (esperado: 71)
ℹ️  Pode estar mostrando apenas eventos futuros

✅ Quantidade por unlock: 7,320,000 (esperado: 7,320,000)
✅ Porcentagem: 0.73% (esperado: 0.73%)
```

---

## 📝 Checklist de Verificação

Quando testar com Meteora, verifique:

- [ ] **API key configurada**
  ```bash
  cat .env.local | grep COINMARKETCAP_API_KEY
  ```

- [ ] **Token encontrado**
  ```
  ✅ Token encontrado! ID: xxxxx
  ```

- [ ] **Max supply correto**
  ```
  Max Supply: 1,000,000,000
  ```

- [ ] **Endpoint disponível**
  ```
  Status: 200 (não 403 ou 404)
  ```

- [ ] **Eventos retornados**
  ```
  📊 Eventos encontrados: XX
  ```

- [ ] **Porcentagem correta**
  ```
  Porcentagem: 0.73% ✅
  ```

---

## 🎯 Valores Corretos do Meteora

Use estes valores como referência:

| Campo | Valor Esperado |
|-------|----------------|
| **Símbolo** | MET |
| **Max Supply** | 1,000,000,000 (1B) |
| **Unlock Amount** | 7,320,000 (7.32M) |
| **Unlock %** | 0.73% |
| **Frequência** | Mensal (dia 22) |
| **Total de Eventos** | 71 |
| **Primeiro Unlock** | Nov 22, 2025 |
| **Último Unlock** | ~2031 |

---

## 🔍 Testes Manuais

### Teste 1: Buscar ID do Token
```bash
curl -H "X-CMC_PRO_API_KEY: SUA_CHAVE" \
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=MET"

# Deve retornar algo como:
# {
#   "data": [{
#     "id": 12345,
#     "name": "Meteora",
#     "symbol": "MET"
#   }]
# }
```

### Teste 2: Buscar Dados do Token
```bash
curl -H "X-CMC_PRO_API_KEY: SUA_CHAVE" \
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=12345"

# Verificar:
# - max_supply: deve ser 1000000000
# - price: deve estar presente
```

### Teste 3: Buscar Unlocks
```bash
curl -H "X-CMC_PRO_API_KEY: SUA_CHAVE" \
  "https://pro-api.coinmarketcap.com/v1/content/token-unlocks?symbol=MET"

# Se retornar 200: Endpoint disponível! ✅
# Se retornar 403: Requer plano pago ⚠️
# Se retornar 404: Endpoint não existe ❌
```

---

## 🚨 Problemas Comuns

### ❌ "Nenhum unlock encontrado"

**Possíveis causas**:
1. Endpoint não disponível no seu plano → Upgrade necessário
2. Símbolo incorreto → Tente 'MET', 'METEORA'
3. Token não tem unlocks → Improvável, vimos 71 no site
4. Resposta em formato não esperado → Verifique logs

**Solução**: Execute com logs detalhados e verifique a resposta da API.

---

### ❌ "Porcentagem diferente de 0.73%"

**Possíveis causas**:
1. Max supply incorreto
2. Amount incorreto
3. API retornando dados diferentes do site

**Solução**:
```typescript
// Verificar no log:
💰 Preço: $X.XX | Max Supply: ???

// Deve ser:
Max Supply: 1,000,000,000

// Cálculo:
7,320,000 / 1,000,000,000 * 100 = 0.73%
```

---

### ❌ "Total de eventos diferente de 71"

**Possíveis causas**:
1. Filtro de datas futuras (ESPERADO) ✅
2. Janela de tempo limitada (180 dias)
3. API retorna apenas próximos unlocks

**Solução**: Isso é normal! Filtramos apenas eventos futuros dentro da janela.

---

## 📚 Recursos

- [CoinMarketCap API Docs](https://coinmarketcap.com/api/documentation/v1/)
- [Meteora CMC Page](https://coinmarketcap.com/currencies/meteora/)
- [Script de teste](../scripts/test-meteora.ts)
- [Status da API](https://status.coinmarketcap.com/)

---

## ✅ Resumo

**Divergências são normais** porque:
1. API pode ter endpoint restrito por plano
2. Filtramos apenas eventos futuros (correto!)
3. Limitamos janela de tempo (180 dias padrão)
4. Diferentes formatos de resposta

**O código está preparado** para:
- ✅ Lidar com múltiplos formatos
- ✅ Calcular porcentagens corretamente
- ✅ Filtrar eventos futuros
- ✅ Logar tudo para debug
- ✅ Validar dados automaticamente

**Execute o teste**:
```bash
npx ts-node scripts/test-meteora.ts
```

E compartilhe os logs para identificar o problema específico! 🚀

