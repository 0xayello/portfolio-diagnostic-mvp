# 🚀 Instruções de Deploy - GitHub + Vercel

## ✅ Status Atual

**Commit realizado com sucesso!**
```
✅ Commit ID: 23c674b
✅ Branch: main
✅ Arquivos: 12 modificados (2332 adições, 38 deleções)
```

---

## 📤 Passo 1: Push para GitHub

O commit está pronto localmente. Agora você precisa fazer push:

```bash
cd /Users/henrique.ayello/portfolio-diagnostic-mvp/portfolio-diagnostic-mvp
git push origin main
```

### Se der erro de autenticação:

#### Opção A: Usar GitHub CLI (Recomendado)
```bash
# Se não tiver instalado
brew install gh

# Fazer login
gh auth login

# Fazer push
git push origin main
```

#### Opção B: Usar Token de Acesso Pessoal
```bash
# 1. Criar token em: https://github.com/settings/tokens
#    - Scope necessário: repo (full control)
#
# 2. Usar o token como senha quando solicitar:
git push origin main
# Username: 0xayello
# Password: [seu_token_aqui]
```

#### Opção C: Configurar SSH (Melhor a longo prazo)
```bash
# 1. Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# 2. Adicionar chave ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copiar chave pública
cat ~/.ssh/id_ed25519.pub
# Cole em: https://github.com/settings/keys

# 4. Mudar remote para SSH
git remote set-url origin git@github.com:0xayello/portfolio-diagnostic-mvp.git

# 5. Fazer push
git push origin main
```

---

## 🌐 Passo 2: Deploy no Vercel

### Opção A: Deploy Automático ⚡ (Recomendado)

Se você já tem o projeto conectado ao Vercel, o deploy será **automático** após o push!

**Verificar**:
1. Acesse: https://vercel.com/0xayello/portfolio-diagnostic-mvp
2. O deploy deve iniciar automaticamente após o push
3. Aguarde ~2-5 minutos

### Opção B: Deploy Manual via Vercel CLI

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
cd /Users/henrique.ayello/portfolio-diagnostic-mvp/portfolio-diagnostic-mvp
vercel --prod
```

### Opção C: Deploy via Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `portfolio-diagnostic-mvp`
3. Vá em "Deployments"
4. Clique em "Redeploy" na última deployment
5. Ou espere o webhook do GitHub disparar automaticamente

---

## 🔑 Configurar Variáveis de Ambiente no Vercel

**IMPORTANTE**: Antes do deploy funcionar, configure as variáveis:

### Via Dashboard:
1. Acesse: https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables
2. Adicione:

```
COINGECKO_API_KEY = sua_chave_coingecko
COINMARKETCAP_API_KEY = sua_chave_coinmarketcap
NEXT_PUBLIC_APP_URL = https://seu-dominio.vercel.app
NODE_ENV = production
```

### Via CLI:
```bash
vercel env add COINGECKO_API_KEY
vercel env add COINMARKETCAP_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NODE_ENV

# Depois, redeploy
vercel --prod
```

---

## 📊 O Que Foi Deployado

### Mudanças Principais:
- ✅ API de unlocks usando **exclusivamente CoinMarketCap**
- ✅ Logs detalhados para debug
- ✅ Validação automática dos dados do Meteora
- ✅ Suporte a múltiplos formatos de resposta
- ✅ Análise de risco automática
- ✅ 4 documentos novos de referência
- ✅ 2 scripts de teste

### Arquivos Novos (8):
```
AJUSTES_METEORA.md
CHANGELOG_COINMARKETCAP.md
RESUMO_MUDANCAS.md
TESTE_METEORA_RESULTADO.md
docs/COINMARKETCAP_SETUP.md
docs/DIVERGENCIAS_API.md
scripts/test-coinmarketcap.ts
scripts/test-meteora.ts
```

### Arquivos Modificados (4):
```
src/services/diagnostic.ts
src/services/coinmarketcap.ts
README.md
env.example
```

---

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

### 1. Build Status
```bash
# No terminal local
git push origin main

# Ou via dashboard
# https://vercel.com/0xayello/portfolio-diagnostic-mvp
```

### 2. Testes de API
```bash
# Teste local
npm run dev

# No console do navegador, verifique:
# 🔍 Buscando unlocks no CoinMarketCap para: [...]
```

### 3. URL de Produção
```
https://portfolio-diagnostic-mvp.vercel.app
ou
https://seu-dominio-custom.com
```

### 4. Verificar Funcionalidades
- [ ] Página inicial carrega
- [ ] Formulário de portfólio funciona
- [ ] Quiz de perfil funciona
- [ ] Diagnóstico é gerado
- [ ] Unlocks do Meteora aparecem (se tiver no portfólio)
- [ ] Logs no console mostram dados corretos

---

## 🐛 Troubleshooting

### Build falhou
```bash
# Verificar logs no Vercel
https://vercel.com/0xayello/portfolio-diagnostic-mvp/deployments

# Comum:
- Variáveis de ambiente faltando
- Erro de sintaxe (mas fizemos lint ✅)
- Dependências faltando (mas package.json está ok ✅)
```

### API não funciona em produção
```bash
# Verificar variáveis de ambiente
https://vercel.com/0xayello/portfolio-diagnostic-mvp/settings/environment-variables

# Devem estar presentes:
✅ COINGECKO_API_KEY
✅ COINMARKETCAP_API_KEY
✅ NEXT_PUBLIC_APP_URL
✅ NODE_ENV
```

### Unlocks não aparecem
```bash
# Possíveis causas:
1. COINMARKETCAP_API_KEY não configurada
2. Endpoint não disponível no plano (403)
3. Token não tem unlocks programados
4. Ver logs no console do navegador
```

---

## 📝 Checklist de Deploy

- [ ] **Push para GitHub**
  ```bash
  git push origin main
  ```

- [ ] **Verificar build no Vercel**
  - Acesse dashboard
  - Aguarde build completar

- [ ] **Configurar variáveis de ambiente**
  - COINGECKO_API_KEY
  - COINMARKETCAP_API_KEY
  - NEXT_PUBLIC_APP_URL

- [ ] **Testar em produção**
  - Abrir URL
  - Testar formulário
  - Verificar unlocks

- [ ] **Verificar logs**
  - Console do navegador
  - Logs do Vercel

---

## 🎉 Próximos Passos

Após deploy bem-sucedido:

1. **Testar Meteora**
   - Adicione MET ao portfólio
   - Veja se os unlocks aparecem
   - Valide: 7.32M MET, 0.73%

2. **Monitorar Uso da API**
   - CoinMarketCap: 333 calls/dia (Basic)
   - CoinGecko: 30 calls/min (Demo)

3. **Considerar Upgrade**
   - Se unlocks não funcionarem
   - Plano Hobbyist CMC: $29/mês

---

## 📞 Suporte

Se algo der errado:

1. **Ver logs do Vercel**: https://vercel.com/0xayello/portfolio-diagnostic-mvp
2. **Ver logs do GitHub Actions**: https://github.com/0xayello/portfolio-diagnostic-mvp/actions
3. **Verificar status**: https://status.vercel.com/

---

## 🚀 Comandos Rápidos

```bash
# Push
git push origin main

# Deploy manual
vercel --prod

# Ver logs
vercel logs

# Ver domínio
vercel domains

# Redeploy
vercel --prod --force
```

---

**✅ Commit feito com sucesso!**  
**⏳ Aguardando push para GitHub...**  
**🚀 Deploy automático no Vercel após push!**


