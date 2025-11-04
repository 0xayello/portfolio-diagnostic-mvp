# 🎯 Ajustes nas Regras do Portfolio Manager

## 📋 Mudanças Implementadas (Novembro 2025)

Baseado em feedback real de uso, as seguintes regras foram ajustadas para refletir melhor a gestão profissional de portfólio cripto.

---

## ✅ 1. MEMECOINS - Limites Aumentados

### **Antes:**
- Arrojado: máx 5%
- Moderado: máx 2%
- Conservador: 0%

### **Agora:**
- **Arrojado: máx 20%**
- **Moderado: máx 5%**
- **Conservador: 0%**

### Lógica:
```typescript
// Alertas contextualizados por perfil
if (meme > maxByProfile) {
  yellow/red + "Recomendado máximo 20% em perfil arrojado, 
  5% em moderado, 0% em conservador."
}
```

---

## ✅ 2. BTC + ETH + SOL (Majors) Juntos

### **Nova Regra:**
**Ideal: 40-100% somados**

### Alertas:
- **< 40%** em perfil não-arrojado: Yellow/Red
- Mensagem: "BTC+ETH+SOL = X%. Ideal: 40-100%"

### Exceção:
Perfil arrojado + curto prazo pode ter menos (mas precisa liquidez)

---

## ✅ 3. ALTCOINS (excluindo majors e stables)

### **Nova Regra:**
- **Máximo 40%** do portfólio total
- **Até 60%** se arrojado + curto prazo

### Lógica:
```typescript
altcoinsTotal = portfolio - (BTC+ETH+SOL) - stablecoins

if (altcoinsTotal > 40%) {
  yellow: "Alta exposição em altcoins"
}

if (altcoinsTotal > 60%) {
  red: "Risco excessivo em altcoins"
}
```

---

## ✅ 4. STABLECOINS - Faixas Contextualizadas

### **Nova Regra: 10-50%** (dependendo de prazo + risco)

| Perfil | Curto Prazo | Médio Prazo | Longo Prazo |
|--------|-------------|-------------|-------------|
| **Conservador** | 30-50% | 20-40% | 20-40% |
| **Moderado** | 20-35% | 10-25% | 10-25% |
| **Arrojado** | 10-20% | 10-20% | 5-15% |

### Lógica:
- Curto prazo precisa mais liquidez
- Conservador sempre precisa colchão maior
- Arrojado pode ser mais agressivo em longo prazo

---

## ✅ 5. QUANTIDADE IDEAL DE ATIVOS

### **Nova Regra:**

#### **1-3 ativos:**
✅ OK se **BTC+ETH+SOL** representam 70%+  
❌ Red se concentrado em altcoins

#### **Até 8 ativos:**
✅ **Ideal para portfólio padrão**

#### **Até 15 ativos:**
✅ OK se **arrojado + curto prazo**  
⚠️ Yellow se perfil moderado/conservador

#### **> 15 ativos:**
⚠️ Yellow: "Over-diversification"

### Lógica:
```typescript
if (numAssets <= 3) {
  if (majors < 70%) {
    red: "Com poucos ativos, concentre em majors"
  }
}

if (numAssets > 15) {
  yellow: "Muitos ativos diluem performance"
}

if (numAssets > 8 && perfil != arrojado) {
  yellow: "Perfis conservadores funcionam melhor com 5-8"
}
```

---

## ✅ 6. CONCENTRAÇÃO SETORIAL EM ALTCOINS

### **Nova Regra:**
**> 40% das altcoins em mesmo setor/chain = Yellow Flag**

### Como Funciona:
1. Calcula % **dentro das altcoins**, não do portfólio total
2. Agrupa por **setor** (DeFi, L1, L2, Gaming, etc)
3. Agrupa por **chain** (Ethereum, Solana, etc)

### Exemplo:
```
Portfólio:
- BTC: 30%
- ETH: 20%
- USDC: 10%
- UNI: 15%  (Ethereum DEX)
- AAVE: 15% (Ethereum Lending)
- LINK: 10% (Ethereum Oracle)

Altcoins = 40% do total
Dentro das altcoins:
- Ethereum: 100% ⚠️ Yellow
- DeFi: 75% ⚠️ Yellow
```

### Alertas:
```
⚠️ "60% das suas altcoins estão em DeFi Ethereum. 
Diversifique em outros setores/chains."
```

---

## ✅ 7. ANÁLISES CONTEXTUALIZADAS

### **Horizonte Temporal:**

#### Curto Prazo (até 1 ano):
- Mínimo **60% em ativos líquidos** (majors + stables)
- Facilita saídas rápidas
- Menos volatilidade

#### Médio Prazo (1-3 anos):
- Balanço entre liquidez e crescimento
- Pode ter 30-40% em altcoins

#### Longo Prazo (3+ anos):
- Pode ser mais agressivo
- Até 40-60% em altcoins se arrojado
- Menos necessidade de stables

### **Objetivo + Alocação:**

#### Preservar Capital:
- 50-70% majors
- 20-30% stables
- Máx 20% altcoins

#### Multiplicar Capital:
- 40-50% majors
- 30-40% altcoins qualidade
- 10-20% stables
- ⚠️ Alerta se muito conservador

#### Renda Passiva:
- Foco em staking líquido e lending
- Protocolos seguros
- Balanço yield vs segurança

---

## 📊 EXEMPLOS PRÁTICOS

### **Exemplo 1: Carteira "Problema"**
```
DOGE: 45%
SHIB: 30%
BTC: 20%
PEPE: 5%
```

**Alertas Gerados:**
1. 🚨 Red: DOGE 45% - Concentração excessiva
2. 🚨 Red: SHIB 30% - Risco crítico
3. 🎰 Red: 80% em memecoins (máx 20% arrojado)
4. ⚠️ Yellow: Apenas 20% em majors (ideal 40-100%)
5. 💵 Red: Zero stablecoins
6. 📉 Red: 4 ativos, mas 80% em memes

**Sugestão:**
- Reduza memes para máx 20%
- Aumente BTC+ETH+SOL para 50-60%
- Adicione 15-20% stablecoins
- Adicione 20-30% altcoins de qualidade

---

### **Exemplo 2: Carteira "Conservadora Ideal"**
```
BTC: 35%
ETH: 25%
SOL: 10%
USDC: 25%
LINK: 5%
```

**Score: 90+/100** ✅

- ✅ Majors = 70% (ideal)
- ✅ Stables = 25% (perfeito para conservador)
- ✅ Altcoin = 5% (controlado)
- ✅ Diversificação adequada
- ✅ Liquidez suficiente

---

### **Exemplo 3: Carteira "Arrojada Balanceada"**
```
BTC: 25%
ETH: 20%
ARB: 10%
UNI: 10%
PENDLE: 10%
LDO: 10%
USDC: 10%
ONDO: 5%
```

**Score: 85+/100** ✅

- ✅ Majors = 45% (ok para arrojado)
- ✅ Altcoins = 45% (dentro do limite)
- ✅ Stables = 10% (mínimo ok)
- ✅ 8 ativos (ideal)
- ✅ Setores diversificados (L2, DeFi, RWA, Staking)

---

## 🎓 FILOSOFIA DAS REGRAS

### Princípios Fundamentais:

1. **BTC+ETH+SOL são âncora** (40-100%)
2. **Altcoins têm potencial, mas limitado** (máx 40%)
3. **Stablecoins são essenciais** (10-50% contextual)
4. **Memecoins são apostas** (0-20% no máximo)
5. **Diversificação é fundamental** (5-8 ativos padrão)
6. **Concentração setorial é risco** (altcoins diversificadas)
7. **Horizonte temporal importa** (curto = liquidez)
8. **Perfil deve alinhar com holdings** (conservador ≠ memes)

---

## 🔄 MUDANÇAS vs VERSÃO ANTERIOR

| Regra | Antes | Agora |
|-------|-------|-------|
| **Memes Arrojado** | 5% | 20% |
| **Memes Moderado** | 2% | 5% |
| **Stables Arrojado** | 0-15% | 5-20% (contextual) |
| **Stables Conservador** | 20-30% | 20-50% (contextual) |
| **Num Ativos** | Min 5-8 | 1-3 OK se majors, até 15 |
| **Altcoins Max** | Implícito | **Explícito 40%** |
| **Majors Min** | Implícito | **Explícito 40%** |
| **Concentração Setorial** | Genérica | **Específica para altcoins** |

---

## 🚀 IMPACTO

### Mais Flexível:
- Permite estratégias mais agressivas (20% memes)
- Aceita 1-3 ativos se bem escolhidos
- Contextualiza por prazo + risco

### Mais Rigoroso:
- Exige 40% mínimo em majors
- Limita altcoins a 40%
- Analisa concentração setorial em altcoins

### Mais Inteligente:
- Stables contextualizados por prazo
- Memes por perfil de risco
- Análise de chain + setor em altcoins

---

**Implementado com expertise de Portfolio Manager** 🎯  
*Regras baseadas em gestão profissional de risco cripto*

