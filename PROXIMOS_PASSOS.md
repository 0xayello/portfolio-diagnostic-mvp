# 🚀 Próximos Passos - Deploy Completo

## ✅ Status Atual

**2 Commits prontos localmente:**

```bash
3b9cfc0 security: Remove API keys expostas do vercel.json
23c674b feat: Integração exclusiva com CoinMarketCap API para unlocks
```

**Arquivos modificados**: 15 arquivos (2898 inserções, 42 deleções)

---

## 🎯 O Que Você Precisa Fazer AGORA

### 1️⃣ URGENTE: Resolver Segurança das API Keys ⚠️

As suas API keys estavam **expostas** no `vercel.json` e foram commitadas anteriormente!

```bash
⚠️  CoinGecko: CG-WfDyPhLk9fNigX2kdLZ3fzC1
⚠️  CoinMarketCap: 14db9c0b-8f13-4200-aab1-9336d4802e72
```

**Ação imediata**:

```bash
# 1. Revogar as keys antigas
# CoinGecko: https://www.coingecko.com/en/developers/dashboard
# CoinMarketCap: https://pro.coinmarketcap.com/account

# 2. Criar novas API keys
# (nos mesmos dashboards)
```

📖 **Ver detalhes em**: `SECURITY_WARNING.md`

---

### 2️⃣ Push para GitHub 📤

```bash
# No terminal:
cd /Users/henrique.ayello/portfolio-diagnostic-mvp/portfolio-diagnostic-mvp
git push origin main
```

**Se pedir autenticação**, escolha uma opção:

#### Opção A: GitHub CLI (Mais fácil)
```bash
gh auth login
git push origin main
```

#### Opção B: Token de Acesso
```bash
# 1. Criar token: https://github.com/settings/tokens
# 2. Ao fazer push, use token como senha
git push origin main
# Username: 0xayello
# Password: [seu_token]
```

📖 **Ver detalhes em**: `DEPLOY_INSTRUCTIONS.md`

---

### 3️⃣ Configurar Variáveis no Vercel 🔐

**IMPORTANTE**: Configure as **NOVAS** API keys (não as antigas!)

1. **Acesse**:
   ```
   https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables
   ```

2. **Adicione** (com as novas keys):

   | Nome | Valor | Environments |
   |------|-------|--------------|
   | `COINGECKO_API_KEY` | `[nova_key_coingecko]` | Production, Preview, Development |
   | `COINMARKETCAP_API_KEY` | `[nova_key_coinmarketcap]` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |
   | `NEXT_PUBLIC_APP_URL` | `https://portfolio-diagnostic-mvp.vercel.app` | Production, Preview |

3. **Salve** cada uma

---

### 4️⃣ Deploy Automático 🌐

Após o push, o Vercel fará deploy **automaticamente**!

**Acompanhe em**:
```
https://vercel.com/0xayello/portfolio-diagnostic-mvp
```

**Aguarde**: 2-5 minutos para build completar

---

### 5️⃣ Verificar Deploy ✅

**URL de Produção**:
```
https://portfolio-diagnostic-mvp.vercel.app
```

**Checklist**:
- [ ] Página carrega
- [ ] Formulário funciona
- [ ] Quiz funciona
- [ ] Diagnóstico é gerado
- [ ] Console não mostra erros de API

---

## 📋 Resumo Executivo

### O Que Foi Feito

1. ✅ **Integração CoinMarketCap**
   - Removido UnlocksApp e DeFiLlama
   - Foco exclusivo em dados oficiais
   - Logs detalhados para debug

2. ✅ **Validação Meteora**
   - Scripts de teste criados
   - Valores esperados documentados
   - Análise de risco automática

3. ✅ **Segurança**
   - API keys removidas do código
   - Aviso de segurança criado
   - Instruções de correção

4. ✅ **Documentação**
   - 8 novos documentos
   - Guias de setup e troubleshooting
   - Scripts de teste

### Commits Realizados

```
Commit 1: 23c674b
- Integração CoinMarketCap
- Scripts de teste
- Documentação completa

Commit 2: 3b9cfc0
- Correção de segurança
- Remove API keys do código
- Guias de deploy
```

---

## 🔧 Comandos Rápidos

### Push
```bash
cd /Users/henrique.ayello/portfolio-diagnostic-mvp/portfolio-diagnostic-mvp
git push origin main
```

### Ver Status do Deploy
```bash
# Via CLI
vercel ls

# Via browser
open https://vercel.com/0xayello/portfolio-diagnostic-mvp
```

### Logs em Tempo Real
```bash
vercel logs --follow
```

### Forçar Redeploy
```bash
vercel --prod --force
```

---

## ⚠️ Troubleshooting

### Push dá erro de autenticação
```bash
# Solução 1: GitHub CLI
gh auth login

# Solução 2: SSH
git remote set-url origin git@github.com:0xayello/portfolio-diagnostic-mvp.git
```

### Build falha no Vercel
```bash
# Verificar variáveis de ambiente
# Devem estar configuradas no dashboard!
https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables
```

### API não funciona em produção
```bash
# 1. Verificar se as NOVAS keys foram configuradas
# 2. Ver logs no console do navegador
# 3. Verificar plano do CoinMarketCap (endpoint de unlocks)
```

---

## 📞 Precisa de Ajuda?

### Documentação Criada

1. **`SECURITY_WARNING.md`** - ⚠️ Ações urgentes de segurança
2. **`DEPLOY_INSTRUCTIONS.md`** - 📤 Guia completo de deploy
3. **`AJUSTES_METEORA.md`** - 🔍 Ajustes para Meteora
4. **`docs/DIVERGENCIAS_API.md`** - 🔧 Debug de APIs
5. **`docs/COINMARKETCAP_SETUP.md`** - 🛠️ Setup CMC

### Links Úteis

- **GitHub Repo**: https://github.com/0xayello/portfolio-diagnostic-mvp
- **Vercel Dashboard**: https://vercel.com/0xayello/portfolio-diagnostic-mvp
- **Vercel Logs**: https://vercel.com/0xayello/portfolio-diagnostic-mvp/logs
- **CoinGecko**: https://www.coingecko.com/en/developers/dashboard
- **CoinMarketCap**: https://pro.coinmarketcap.com/account

---

## 🎯 Ordem de Execução

Execute **NESTA ORDEM**:

```bash
# 1. URGENTE: Revogar keys antigas
# → CoinGecko Dashboard
# → CoinMarketCap Dashboard

# 2. Criar novas API keys
# → Anotar as novas keys

# 3. Push para GitHub
git push origin main

# 4. Configurar novas keys no Vercel
# → Vercel Dashboard > Environment Variables

# 5. Aguardar deploy automático
# → Vercel Dashboard > Deployments

# 6. Testar em produção
# → https://portfolio-diagnostic-mvp.vercel.app

# 7. Verificar logs
# → Console do navegador
# → Buscar por: 🔍 Buscando unlocks...
```

---

## ✅ Checklist Final

Marque conforme completar:

### Segurança
- [ ] Keys antigas revogadas (CoinGecko)
- [ ] Keys antigas revogadas (CoinMarketCap)
- [ ] Novas keys criadas
- [ ] Novas keys anotadas em local seguro

### GitHub
- [ ] Push realizado (`git push origin main`)
- [ ] 2 commits aparecem no GitHub
- [ ] Arquivos atualizados visíveis

### Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] NOVAS keys (não as antigas!)
- [ ] Deploy iniciou automaticamente
- [ ] Build completou (verde ✅)

### Testes
- [ ] Site abre em produção
- [ ] Formulário funciona
- [ ] Quiz funciona
- [ ] Diagnóstico gera
- [ ] Logs corretos no console
- [ ] Sem erros de API

---

## 🎉 Após Completar

Você terá:
- ✅ Código no GitHub (atualizado)
- ✅ Deploy no Vercel (automático)
- ✅ API keys seguras (não expostas)
- ✅ Sistema funcionando com CoinMarketCap
- ✅ Documentação completa

**Pronto para produção!** 🚀

---

## 💡 Dica Final

Se tiver qualquer problema:
1. Consulte os documentos criados
2. Veja os logs do Vercel
3. Verifique variáveis de ambiente
4. Teste localmente primeiro (`npm run dev`)

**Boa sorte com o deploy!** 🎊

