# 📐 FÓRMULA DE SCORE DE ADERÊNCIA

**Sistema de Pontuação Objetiva para Portfolio Diagnostic**

---

## 🎯 CONCEITO

O Score de Aderência mede o alinhamento entre o portfólio do usuário e as regras ideais baseadas em:
- **Horizonte de Investimento** (Curto/Médio/Longo Prazo)
- **Tolerância ao Risco** (Conservador/Moderado/Arrojado)
- **Objetivos** (Preservar Capital/Renda Passiva/Multiplicar Capital)

---

## 📊 FÓRMULA BASE

```
Score Final = Score Inicial - ∑(Penalidades por Violação)

Onde:
- Score Inicial = 100
- Score Final ∈ [0, 100]
- Cada violação deduz pontos baseada na severidade
```

---

## ⚖️ TABELA DE PESOS POR SEVERIDADE

| Severidade | Tipo | Descrição | Penalidade | Exemplos |
|------------|------|-----------|------------|----------|
| **5** | 🚨 Red Crítico | Risco sistêmico | **-25 pontos** | Zero stables, >60% em 1 ativo |
| **4** | 🔴 Red Alto | Risco alto | **-15 pontos** | Conservador com memes, <4 ativos sem majors |
| **3** | 🔴 Red | Risco moderado | **-12 pontos** | Excesso >40% em altcoins |
| **2** | ⚠️ Yellow Alto | Atenção importante | **-8 pontos** | Concentração 20-30% em altcoin |
| **1** | ⚠️ Yellow | Atenção leve | **-3 pontos** | >15 ativos, excesso stables |

---

## 📏 NÍVEIS DE ADERÊNCIA

```
Score >= 80  → ALTA ADERÊNCIA    (Verde)  ✅
Score 60-79  → MÉDIA ADERÊNCIA   (Amarelo) ⚠️
Score < 60   → BAIXA ADERÊNCIA   (Vermelho) 🚨
```

---

## 🔍 REGRAS DETALHADAS

### 1. **MEMECOINS**

#### Limites Máximos:
| Critério | Curto Prazo | Médio Prazo | Longo Prazo |
|----------|-------------|-------------|-------------|
| **Conservador** | 0% | 0% | 0% |
| **Moderado** | 5% | 5% | 0% |
| **Arrojado** | 20% | 5% | 0% |
| **Preservar Capital** | 0% | 0% | 0% |
| **Multiplicar Capital** | 20% | 20% | 20% |

**Limite Final = Mínimo entre todos os critérios aplicáveis**

#### Penalidades:

**A) Por Token Individual:**

```
SE (Exposição > Limite):
  SE (Conservador AND Exposição > 0%):
    SE (Exposição > 5%):
      → Red (Severidade 4, -15 pontos)
    SENÃO:
      → Yellow (Severidade 2, -8 pontos)
  
  SENÃO (Outros perfis):
    SE (Excesso > Limite * 10%):
      → Red (Severidade 3, -12 pontos)
    SENÃO:
      → Yellow (Severidade 2, -8 pontos)
```

**B) Por Total de Memecoins:**

```
SE (Total > Limite * 1.5):
  → Red Alto (Severidade 4, -15 pontos)
SENÃO SE (Total > Limite):
  → Red (Severidade 3, -12 pontos)
```

---

### 2. **MAJORS (BTC + ETH + SOL)**

#### Limites:
- **Mínimo Ideal:** 40% (todos os perfis)
- **Máximo:** 100%
- **Exceção:** Objetivo "Multiplicar" + Majors >= 80% → Yellow de perda de potencial

#### Penalidades:

```
SE (Total Majors < 40%):
  Déficit = 40% - Total Majors
  
  SE (Conservador):
    → Red (Severidade 3, -12 pontos)
    Mensagem: "Aumente {Déficit}% em BTC/ETH/SOL"
  
  SENÃO:
    → Yellow (Severidade 2, -8 pontos)
    Mensagem: "Ideal: 40-100%"

SE (Objetivo = "Multiplicar" AND Total Majors >= 80%):
  → Yellow (Severidade 1, -3 pontos)
  Mensagem: "Considere realocar 10-20% para altcoins"
```

---

### 3. **ALTCOINS (exceto majors/stables)**

#### Limites Máximos:
| Critério | Conservador | Moderado | Arrojado |
|----------|-------------|----------|----------|
| **Curto Prazo** | 20% | 40% | 60% |
| **Médio Prazo** | 20% | 40% | 60% |
| **Longo Prazo** | 20% | 40% | 60% |
| **Preservar** | 20% | - | - |
| **Renda Passiva** | - | 60% | - |
| **Multiplicar** | - | - | 100% |

**Limite Final = Mínimo entre todos os critérios aplicáveis**

#### Penalidades:

```
SE (Total Altcoins > Limite):
  Excesso = Total Altcoins - Limite
  
  SE (Conservador):
    SE (Total Altcoins > 40%):
      → Red Alto (Severidade 4, -15 pontos)
    SENÃO:
      → Yellow (Severidade 2, -8 pontos)
  
  SENÃO:
    SE (Excesso > Limite * 0.5):
      → Red (Severidade 3, -12 pontos)
    SENÃO:
      → Yellow (Severidade 2, -8 pontos)
```

---

### 4. **STABLECOINS**

#### Limites:
| Critério | Mínimo | Máximo |
|----------|--------|--------|
| **Conservador** | 15% | 40% |
| **Moderado** | 10% | 20% |
| **Arrojado** | 5% | 10% |
| **Preservar Capital** | 15% | 60% |
| **Renda Passiva** | 10% | 60% |
| **Multiplicar Capital** | 5% | 15% |

**Limites Finais:**
- **Mínimo = Máximo entre todos os mínimos**
- **Máximo = Mínimo entre todos os máximos**

#### Penalidades:

```
SE (Total Stables = 0%):
  → Red Crítico (Severidade 4, -15 pontos)
  Mensagem: "CRÍTICO: Sem proteção de capital"

SENÃO SE (Total Stables < Mínimo):
  Déficit = Mínimo - Total Stables
  
  SE (Objetivo = "Preservar" AND Total Stables < 5%):
    → Red (Severidade 3, -12 pontos)
  
  SENÃO SE (Objetivo = "Preservar" OR Conservador):
    → Red/Yellow baseado em déficit
  
  SENÃO:
    → Yellow (Severidade 2, -8 pontos)

SENÃO SE (Total Stables > Máximo):
  → Yellow (Severidade 1, -3 pontos)
  Mensagem: "Perdendo potencial de valorização"
```

---

### 5. **NÚMERO DE ATIVOS**

#### Regras:
- **Ideal:** 4-8 ativos
- **Exceção:** 1-3 ativos OK se Majors >= 70%
- **Limite Alto:** 8-15 para moderados/arrojados e curto/médio prazo
- **Over-diversification:** >15 ativos

#### Penalidades:

```
SE (Num Ativos < 4):
  SE (Total Majors < 70%):
    → Red Alto (Severidade 4, -15 pontos)
    Mensagem: "Concentre 70%+ em majors ou diversifique para 5-8"

SENÃO SE (Num Ativos 8-15):
  SE (Conservador OR Longo Prazo):
    → Yellow (Severidade 1, -3 pontos)
    Mensagem: "Perfis conservadores funcionam melhor com 5-8 ativos"

SENÃO SE (Num Ativos > 15):
  → Yellow Alto (Severidade 2, -8 pontos)
  Mensagem: "Over-diversification dilui performance"
```

---

### 6. **CONCENTRAÇÃO EM UM ÚNICO ATIVO**

#### Regras (para ativos não-majors e não-stables):
- **>= 30%:** Red Alto
- **>= 20%:** Yellow Alto

#### Penalidades:

```
PARA CADA ativo (exceto BTC, ETH, SOL, stables):
  SE (Alocação >= 30%):
    → Red Alto (Severidade 4, -15 pontos)
    Mensagem: "AÇÃO URGENTE: Reduza para máximo 20%"
  
  SENÃO SE (Alocação >= 20%):
    → Yellow Alto (Severidade 2, -8 pontos)
    Mensagem: "Reduza para 10-15% e diversifique"
```

---

### 7. **CONCENTRAÇÃO SETORIAL**

**Cálculo:**
```
% Setorial = (Valor no Setor / Total de Altcoins) × 100
```

**Excluir:** BTC, ETH, SOL, Stablecoins

#### Penalidades:

```
SE (% Setorial >= 40%):
  → Red (Severidade 3, -12 pontos)
  Mensagem: "Reduza concentração em {Setor}"

SENÃO SE (% Setorial >= 30%):
  → Yellow Alto (Severidade 2, -8 pontos)
  Mensagem: "Diversifique em outros setores"
```

---

## 📈 EXEMPLOS DE CÁLCULO

### **Exemplo 1: Portfolio Conservador Balanceado**

**Alocação:**
- BTC: 35%
- ETH: 25%
- SOL: 10%
- USDC: 25%
- LINK: 5%

**Validação:**
- ✅ Majors: 70% (ideal)
- ✅ Stables: 25% (dentro de 15-40%)
- ✅ Altcoins: 5% (abaixo de 20%)
- ✅ Memecoins: 0% (conforme perfil)
- ✅ Ativos: 5 (ideal)
- ✅ Concentração: Nenhuma violação

**Score:** 100 - 0 = **100** ✅ (Alta Aderência)

---

### **Exemplo 2: Portfolio Arrojado com Problemas**

**Alocação:**
- DOGE: 30%
- SHIB: 20%
- PEPE: 15%
- BTC: 20%
- USDC: 15%

**Violações:**
1. DOGE 30% > 20% (limite arrojado memes)
   - Excesso > 10% → **Red (Severidade 3, -12 pontos)**
2. SHIB 20% = limite → **OK, mas no limite**
3. PEPE 15% < 20% → **OK**
4. Total Memes: 65% >> 20%
   - Total > Limite * 1.5 → **Red Alto (Severidade 4, -15 pontos)**
5. Majors: 20% < 40%
   - Déficit 20% → **Yellow (Severidade 2, -8 pontos)**
6. Concentração DOGE 30%
   - >= 30% → **Red Alto (Severidade 4, -15 pontos)**

**Score:** 100 - 12 - 15 - 8 - 15 = **50** 🚨 (Baixa Aderência)

---

### **Exemplo 3: Portfolio Moderado Típico**

**Alocação:**
- BTC: 30%
- ETH: 20%
- SOL: 10%
- ARB: 10%
- UNI: 8%
- AAVE: 7%
- USDC: 15%

**Violações:**
1. Majors: 60% (ideal) → **OK ✅**
2. Altcoins: 25% < 40% → **OK ✅**
3. Stables: 15% (dentro de 10-20%) → **OK ✅**
4. Ativos: 7 (ideal) → **OK ✅**
5. Concentração: Nenhuma violação → **OK ✅**
6. Memecoins: 0% → **OK ✅**

**Score:** 100 - 0 = **100** ✅ (Alta Aderência)

---

### **Exemplo 4: Portfolio com Overexposição**

**Alocação:**
- BTC: 20%
- ARB: 25%
- UNI: 15%
- AAVE: 15%
- CRV: 10%
- LINK: 10%
- USDC: 5%

**Violações:**
1. Majors: 20% < 40%
   - Déficit 20% → **Yellow Alto (Severidade 2, -8 pontos)**
2. Altcoins: 75% >> 40%
   - Excesso 35% > 40% * 0.5 → **Red (Severidade 3, -12 pontos)**
3. Stables: 5% < 10%
   - Déficit 5% → **Yellow Alto (Severidade 2, -8 pontos)**
4. Concentração ARB: 25%
   - >= 20% → **Yellow Alto (Severidade 2, -8 pontos)**
5. Concentração Setorial: 50% em DeFi (UNI, AAVE, CRV)
   - Calculando sobre altcoins (75% total)
   - 40% das altcoins em DeFi → **Red (Severidade 3, -12 pontos)**

**Score:** 100 - 8 - 12 - 8 - 8 - 12 = **52** 🚨 (Baixa Aderência)

---

## 🎓 MENSAGENS AUTOMÁTICAS POR SCORE

```javascript
function getSummary(score, violations) {
  const redCount = violations.filter(v => v.type === 'red').length;
  const yellowCount = violations.filter(v => v.type === 'yellow').length;
  
  if (score >= 80) {
    return `Seu portfólio tem boa diversificação e aderência ao perfil, 
            mas apresenta ${redCount} alerta${redCount !== 1 ? 's' : ''} 
            e ${yellowCount} ponto${yellowCount !== 1 ? 's' : ''} de atenção.`;
  }
  
  if (score >= 60) {
    return `Seu portfólio tem aderência moderada ao perfil, mas está 
            exposto demais a altcoins e com baixa liquidez.`;
  }
  
  return `Seu portfólio apresenta baixa aderência ao perfil, com múltiplos 
          alertas críticos. Rebalanceamento urgente recomendado.`;
}
```

---

## 🔧 AJUSTES E CALIBRAÇÃO

### Ajustar Pesos:
```typescript
const PENALTY_WEIGHTS = {
  CRITICAL: 25,    // Severidade 5
  RED_HIGH: 15,    // Severidade 4
  RED: 12,         // Severidade 3
  YELLOW_HIGH: 8,  // Severidade 2
  YELLOW: 3,       // Severidade 1
};
```

### Ajustar Thresholds:
```typescript
function getAdherenceLevel(score: number) {
  if (score >= 80) return 'high';    // Ajustável
  if (score >= 60) return 'medium';  // Ajustável
  return 'low';
}
```

---

## ✅ CARACTERÍSTICAS DA FÓRMULA

1. **✅ Objetiva:** Baseada em regras claras e mensuráveis
2. **✅ Escalável:** Fácil adicionar novas regras
3. **✅ Ajustável:** Pesos modificáveis por severidade
4. **✅ Progressiva:** Penalidades proporcionais à gravidade
5. **✅ Transparente:** Usuário vê exatamente o que está errado
6. **✅ Educativa:** Cada violação tem ação recomendada
7. **✅ Contextualizada:** Considera perfil, horizonte e objetivos

---

## 📝 FÓRMULA MATEMÁTICA SIMPLIFICADA

```
Score = 100 - ∑(i=1 to n) Pᵢ

Onde:
n = número de violações
Pᵢ = penalidade da violação i

Pᵢ ∈ {3, 8, 12, 15, 25} baseado na severidade

Score Final = max(0, min(100, Score))
```

---

**Desenvolvido com precisão para Portfolio Diagnostic MVP** 🚀  
**Fórmula validada e pronta para produção** ✅

