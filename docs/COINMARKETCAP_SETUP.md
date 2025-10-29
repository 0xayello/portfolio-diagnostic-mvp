# 🔧 Guia de Configuração: CoinMarketCap API

## 📋 Visão Geral

A API do CoinMarketCap é usada para obter dados **oficiais e confiáveis** sobre unlocks de tokens. Esta API é **OPCIONAL** - o sistema funciona normalmente sem ela, usando UnlocksApp e DeFiLlama como fontes alternativas.

## ✨ Benefícios de Usar o CoinMarketCap

- ✅ Dados oficiais e verificados
- ✅ Cobertura ampla de tokens
- ✅ Informações detalhadas sobre unlocks
- ✅ Redundância e confiabilidade

## 🚀 Configuração Passo a Passo

### 1. Obter Chave de API

1. Acesse: https://coinmarketcap.com/api/
2. Clique em **"Get Your Free API Key Now"**
3. Crie uma conta (é gratuito)
4. Confirme seu email
5. Acesse o dashboard e copie sua API key

### 2. Planos Disponíveis

#### Plano Basic (Gratuito) ✅
- **Custo**: US$ 0/mês
- **Limite**: 10.000 calls/mês (~333/dia)
- **Endpoints**: Maioria dos endpoints básicos
- ⚠️ **Limitação**: Endpoint de unlocks pode não estar disponível

#### Plano Hobbyist (US$ 29/mês)
- **Limite**: 50.000 calls/mês
- **Endpoints**: Mais endpoints disponíveis

#### Plano Startup (US$ 79/mês)
- **Limite**: 200.000 calls/mês
- **Endpoints**: Acesso completo incluindo unlocks

### 3. Configurar no Projeto

Adicione sua chave no arquivo `.env.local`:

```env
# CoinMarketCap API
COINMARKETCAP_API_KEY=sua_chave_aqui
```

### 4. Testar Configuração

Execute o script de teste:

```bash
npx ts-node scripts/test-coinmarketcap.ts
```

## ⚠️ Problemas Comuns

### 1. Endpoint de Unlocks Não Disponível

**Sintoma**: Testes retornam array vazio ou erro 403

**Causa**: O endpoint `/v1/content/token-unlocks` pode não estar disponível no seu plano

**Solução**:
- O sistema **continuará funcionando** usando UnlocksApp e DeFiLlama
- Considere upgrade se precisar de dados oficiais do CMC
- Alternativa: Use apenas as fontes gratuitas (já funcionam bem!)

### 2. Rate Limit Excedido

**Sintoma**: Erro 429 ou "rate limit exceeded"

**Causa**: Muitas requisições em pouco tempo

**Solução**:
- Plano Basic: Max 333 chamadas/dia
- Aguarde algumas horas antes de testar novamente
- O sistema tem retry automático e fallback

### 3. API Key Inválida

**Sintoma**: Erro 401 ou "Invalid API Key"

**Causa**: Chave incorreta ou não configurada

**Solução**:
```bash
# Verifique se a chave está no .env.local
cat .env.local | grep COINMARKETCAP

# Se não estiver, adicione:
echo "COINMARKETCAP_API_KEY=sua_chave_aqui" >> .env.local

# Reinicie o servidor
npm run dev
```

## 🔍 Endpoint Customizado

Se você tem acesso a um endpoint diferente de unlocks, configure:

```env
# Custom endpoint (opcional)
CMC_UNLOCKS_ENDPOINT=/v2/cryptocurrency/token-unlocks
```

## 📊 Monitoramento de Uso

Monitore seu uso em: https://pro.coinmarketcap.com/account

## 🎯 Recomendações

### Para Uso Pessoal/Teste
- ✅ Use o plano **Basic (gratuito)**
- ✅ Se unlocks não funcionarem, use UnlocksApp + DeFiLlama
- ✅ 10.000 calls/mês é suficiente para testes

### Para Produção
- ✅ Considere **Hobbyist ou superior** se precisar de unlocks oficiais
- ✅ Implemente cache (Redis) para reduzir chamadas
- ✅ Configure alertas de rate limit

## 🆘 Troubleshooting Avançado

### Debug de Requisições

Habilite logs detalhados no console:

```typescript
// src/services/coinmarketcap.ts já tem logs automáticos
// Verifique o console durante os testes
```

### Testar Endpoint Manualmente

```bash
# Substitua YOUR_API_KEY pela sua chave
curl -H "X-CMC_PRO_API_KEY: YOUR_API_KEY" \
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=BTC"

# Se retornar dados, sua API key está funcionando!
```

### Verificar Disponibilidade do Endpoint

```bash
# Testar endpoint de unlocks
curl -H "X-CMC_PRO_API_KEY: YOUR_API_KEY" \
  "https://pro-api.coinmarketcap.com/v1/content/token-unlocks?symbol=TIA"

# Se retornar 404 ou 403: endpoint não disponível no seu plano
# Se retornar 200: endpoint disponível!
```

## 📚 Recursos

- [Documentação Oficial](https://coinmarketcap.com/api/documentation/v1/)
- [Dashboard de API](https://pro.coinmarketcap.com/account)
- [Status da API](https://status.coinmarketcap.com/)
- [Suporte](https://support.coinmarketcap.com/)

## 🔄 Fontes Alternativas

Se CoinMarketCap não funcionar, o sistema usa:

1. **UnlocksApp** (primário)
   - API pública
   - Boa cobertura de tokens
   - Dados de vesting

2. **DeFiLlama** (fallback)
   - API gratuita
   - Dados de vesting e unlocks
   - Muito confiável

Ambos funcionam sem API key! 🎉

## ✅ Checklist de Configuração

- [ ] Conta criada no CoinMarketCap
- [ ] API key copiada
- [ ] Chave adicionada ao `.env.local`
- [ ] Script de teste executado
- [ ] Servidor reiniciado
- [ ] Logs verificados

## 💡 Dicas Finais

1. **CoinMarketCap é opcional**: Não se preocupe se não funcionar
2. **UnlocksApp + DeFiLlama** são excelentes alternativas gratuitas
3. **Cache é seu amigo**: Implemente cache em produção
4. **Monitore seu uso**: Evite exceder o rate limit
5. **Fallback automático**: Sistema usa 3 fontes em paralelo

---

**Desenvolvido com ❤️ pela equipe Bom Digma**

