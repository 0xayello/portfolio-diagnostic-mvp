# ⚠️ AVISO DE SEGURANÇA - API KEYS EXPOSTAS

## 🚨 Problema Identificado

As API keys estavam **expostas** no arquivo `vercel.json`:

```json
{
  "env": {
    "COINGECKO_API_KEY": "CG-WfDyPhLk9fNigX2kdLZ3fzC1",
    "COINMARKETCAP_API_KEY": "14db9c0b-8f13-4200-aab1-9336d4802e72"
  }
}
```

## ✅ Correção Aplicada

1. **Removido as keys do `vercel.json`** ✅
2. **Mantido apenas configurações do projeto** ✅

## 🔐 Ações Necessárias

### URGENTE: Revogar e Recriar API Keys

#### 1. CoinGecko
```
⚠️  Key exposta: CG-WfDyPhLk9fNigX2kdLZ3fzC1

📋 Passos:
1. Acesse: https://www.coingecko.com/en/developers/dashboard
2. Revogue a key antiga
3. Crie uma nova API key
4. Configure no Vercel (ver abaixo)
```

#### 2. CoinMarketCap
```
⚠️  Key exposta: 14db9c0b-8f13-4200-aab1-9336d4802e72

📋 Passos:
1. Acesse: https://pro.coinmarketcap.com/account
2. Revogue a key antiga
3. Crie uma nova API key
4. Configure no Vercel (ver abaixo)
```

---

## 🌐 Configurar Keys no Vercel (Jeito Correto)

### Via Dashboard (Recomendado)

1. **Acesse**:
   ```
   https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables
   ```

2. **Adicione as variáveis** (uma por uma):

   **Nome**: `COINGECKO_API_KEY`  
   **Valor**: `[sua_nova_chave_coingecko]`  
   **Environments**: ✅ Production, ✅ Preview, ✅ Development

   **Nome**: `COINMARKETCAP_API_KEY`  
   **Valor**: `[sua_nova_chave_coinmarketcap]`  
   **Environments**: ✅ Production, ✅ Preview, ✅ Development

   **Nome**: `NODE_ENV`  
   **Valor**: `production`  
   **Environments**: ✅ Production

   **Nome**: `NEXT_PUBLIC_APP_URL`  
   **Valor**: `https://portfolio-diagnostic-mvp.vercel.app`  
   **Environments**: ✅ Production, ✅ Preview

3. **Salve** cada variável

4. **Redeploy** o projeto:
   ```bash
   # Opção 1: Via dashboard
   # Clique em "Redeploy" na última deployment
   
   # Opção 2: Via CLI
   vercel --prod --force
   ```

---

### Via CLI (Alternativa)

```bash
# 1. Fazer login
vercel login

# 2. Linkar projeto (se necessário)
vercel link

# 3. Adicionar variáveis
vercel env add COINGECKO_API_KEY production
# Cole a nova key quando solicitado

vercel env add COINMARKETCAP_API_KEY production
# Cole a nova key quando solicitado

vercel env add NODE_ENV production
# Digite: production

vercel env add NEXT_PUBLIC_APP_URL production
# Digite: https://portfolio-diagnostic-mvp.vercel.app

# 4. Redeploy
vercel --prod
```

---

## 📝 Checklist de Segurança

- [ ] **Revogar keys antigas**
  - [ ] CoinGecko: `CG-WfDyPhLk9fNigX2kdLZ3fzC1`
  - [ ] CoinMarketCap: `14db9c0b-8f13-4200-aab1-9336d4802e72`

- [ ] **Criar novas keys**
  - [ ] Nova key CoinGecko
  - [ ] Nova key CoinMarketCap

- [ ] **Configurar no Vercel**
  - [ ] Variáveis adicionadas via dashboard
  - [ ] Environments corretos selecionados

- [ ] **Redeploy**
  - [ ] Build completou com sucesso
  - [ ] APIs funcionando em produção

- [ ] **Testar**
  - [ ] Busca de tokens funciona
  - [ ] Diagnóstico é gerado
  - [ ] Unlocks aparecem

---

## 🛡️ Boas Práticas de Segurança

### ❌ NUNCA faça isso:
```json
// ❌ NÃO colocar keys no código
{
  "env": {
    "API_KEY": "minha-key-secreta"
  }
}
```

```javascript
// ❌ NÃO colocar keys em arquivos JS/TS
const API_KEY = "minha-key-secreta";
```

### ✅ SEMPRE faça isso:
```javascript
// ✅ Usar variáveis de ambiente
const API_KEY = process.env.API_KEY;
```

```bash
# ✅ Configurar no .env.local (não commitado)
API_KEY=minha-key-secreta
```

```bash
# ✅ Configurar no Vercel Dashboard
# Settings > Environment Variables
```

---

## 🔍 Como Verificar se Está Seguro

### 1. Verificar Git History
```bash
# Ver se keys foram commitadas
git log --all --full-history --source -- vercel.json

# Ver conteúdo em commits anteriores
git show <commit-hash>:vercel.json
```

### 2. Verificar GitHub
```
https://github.com/0xayello/portfolio-diagnostic-mvp/blob/main/vercel.json
```

Se as keys aparecerem: **keys comprometidas** ⚠️

### 3. Verificar Vercel
```
https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables
```

Keys devem estar **apenas aqui**, não no código! ✅

---

## 📚 Recursos

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Secrets Security](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [CoinGecko API Security](https://www.coingecko.com/en/api/documentation)
- [CoinMarketCap API Keys](https://coinmarketcap.com/api/documentation/v1/#section/Authentication)

---

## 🚀 Após Corrigir

1. ✅ Keys antigas revogadas
2. ✅ Novas keys criadas
3. ✅ Configuradas no Vercel
4. ✅ `vercel.json` limpo (sem keys)
5. ✅ Redeploy realizado
6. ✅ Testes realizados

**Seu projeto estará seguro!** 🔐

---

## ⚡ TL;DR

```bash
# 1. Revogar keys antigas nos dashboards
# 2. Criar novas keys
# 3. Configurar no Vercel:
https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables

# 4. Redeploy
vercel --prod

# 5. Testar
https://portfolio-diagnostic-mvp.vercel.app
```

**NUNCA mais coloque API keys no código!** 🔒

