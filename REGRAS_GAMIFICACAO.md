# Regras de Gamificação - Portfolio Diagnostic

Este documento descreve todas as regras e critérios utilizados nos recursos de gamificação da ferramenta.

---

## 🐾 Perfil de Investidor (Spirit Animal)

Cada usuário recebe um "animal" que representa seu estilo de investimento, baseado na composição do portfólio.

| Animal | Emoji | Descrição | Critério |
|--------|-------|-----------|----------|
| **Polvo** | 🐙 | Tentáculos em todo lugar. Diversificação é seu lema. | Mais de 8 ativos diferentes |
| **Shiba** | 🐕 | Você gosta de viver perigosamente! Degen assumido. | Possui memecoins e >20% em altcoins |
| **Tartaruga** | 🐢 | Devagar e sempre. Você prioriza segurança acima de tudo. | Mais de 30% em stablecoins |
| **Leão** | 🦁 | O rei da selva crypto. Você aposta no líder do mercado. | Mais de 50% em BTC |
| **Raposa** | 🦊 | Esperto e versátil. Você acredita na inovação do Ethereum. | Mais de 40% em ETH |
| **Fênix** | 🔥 | Renasce das cinzas. Heavy em SOL e projetos de recuperação. | Mais de 30% em SOL |
| **Águia** | 🦅 | Visão aguçada para oportunidades. Caçador de altcoins. | Mais de 40% em altcoins (exceto BTC/ETH) |
| **Lobo** | 🐺 | Estrategista nato. Equilíbrio perfeito entre risco e segurança. | Score ≥85 com 4+ ativos (padrão) |

**Prioridade de seleção:** Polvo → Shiba → Tartaruga → Leão → Raposa → Fênix → Águia → Lobo (padrão)

---

## 🏆 Conquistas (Badges)

Badges são desbloqueadas baseadas em características específicas do portfólio.

| Badge | Emoji | Nome | Critério de Desbloqueio |
|-------|-------|------|------------------------|
| Hodler de Ferro | 🏅 | Hodler de Ferro | 50%+ do portfólio em Bitcoin |
| Diversificador | 🎯 | Diversificador Master | Exposição a 5+ setores diferentes |
| Diamond Hands | 💎 | Diamond Hands | 80%+ do portfólio em Bitcoin |
| To the Moon | 🌙 | To the Moon | 30%+ em altcoins de alto potencial |
| Escudo de Aço | 🛡️ | Escudo de Aço | 20%+ em stablecoins |
| Degen | 🎰 | Degen Assumido | Possui pelo menos uma memecoin |
| Equilibrista | ⚖️ | Equilibrista | Score de aderência 90+ |
| Visionário | 🔮 | Visionário | 6+ ativos no portfólio |
| Minimalista | 🎍 | Minimalista | 3 ou menos ativos |

---

## 🌡️ Termômetro FOMO vs HODL

Mede o quão "racional" ou "emotivo" é o portfólio do usuário.

### Fórmula de Cálculo

```
HODL Score = (BTC% × 0.8) + (ETH% × 0.6) + (Stablecoins% × 1.0)
FOMO Score = (Altcoins% × 0.7) + (Memecoins% × 1.5)

FOMO Percentage = (FOMO Score / (HODL Score + FOMO Score)) × 100
```

### Níveis

| Faixa | Label | Emoji | Descrição |
|-------|-------|-------|-----------|
| 0-20% | - | 🧊 | Você é frio como gelo. Paciência é sua maior virtude. |
| 21-40% | HODL Moderado | ❄️ | Racional e calculista. Você não se deixa levar pela emoção. |
| 41-60% | Equilibrado | ⚖️ | Você tem um pé na racionalidade, mas não resiste a uma oportunidade. |
| 61-80% | FOMO Moderado | 🌡️ | O mercado te empolga! Você gosta de surfar as tendências. |
| 81-100% | FOMO Total | 🔥 | Degen mode ativado! Você vive no limite. |

---

## ⏰ Time Machine

Simula a valorização do portfólio se o usuário tivesse investido em datas históricas específicas.

### Cenários Disponíveis

| Data | Label | Emoji | Descrição |
|------|-------|-------|-----------|
| Janeiro 2021 | Pré-Bull Run | 🚀 | Antes da grande alta de 2021 |
| Novembro 2021 | ATH (Topo Histórico) | 📉 | No topo do mercado - pior momento para comprar |
| Novembro 2022 | Quebra da FTX | 💥 | O colapso que abalou o mercado crypto |
| Janeiro 2023 | Fundo do Bear | 🐻 | No fundo do bear market - melhor momento |
| Abril 2024 | Halving do Bitcoin | ⛏️ | No momento do 4º halving |

### Multiplicadores por Cenário

Os multiplicadores representam quantas vezes o ativo valorizou desde aquela data até janeiro de 2026.

**Janeiro 2021 (Pré-Bull Run):**
- BTC: 2.1x, ETH: 3.5x, SOL: 25x, BNB: 4x, ADA: 8x
- DOGE: 50x, SHIB: 500x, AVAX: 15x, MATIC: 20x

**Novembro 2021 (ATH):**
- BTC: 0.6x, ETH: 0.5x, SOL: 0.35x, BNB: 0.7x, ADA: 0.25x
- DOGE: 0.35x, SHIB: 0.15x (perdas significativas)

**Novembro 2022 (FTX):**
- BTC: 2.8x, ETH: 3.2x, SOL: 12x, BNB: 2x
- FTT: 0.02x (praticamente perdeu tudo)

**Janeiro 2023 (Fundo Bear):**
- BTC: 2.5x, ETH: 2.8x, SOL: 8x
- Melhores ganhos possíveis

**Abril 2024 (Halving):**
- BTC: 1.4x, ETH: 1.3x, SOL: 1.5x
- Ganhos moderados

---

## 👥 Seu Portfólio Parece Com... (Celebrity Match)

Compara o estilo de portfólio do usuário com personalidades conhecidas do mundo crypto.

### Celebridades Disponíveis

| Nome | Descrição | Critério Principal |
|------|-----------|-------------------|
| **Michael Saylor** | CEO da MicroStrategy. Bitcoin maximalist declarado. | 80%+ BTC = 95% match |
| **Vitalik Buterin** | Criador do Ethereum. Visionário e inovador. | 50%+ ETH = 90% match |
| **CZ (Changpeng Zhao)** | Fundador da Binance. Diversificação estratégica. | 20%+ BNB ou 5+ ativos = 80% match |
| **Arthur Hayes** | Ex-CEO da BitMEX. Trader agressivo e ousado. | 50%+ altcoins + 4+ ativos = 90% match |
| **Balaji Srinivasan** | Ex-CTO da Coinbase. Visão macro e tech-heavy. | 30%+ BTC + 20%+ ETH + 10%+ SOL = 90% match |
| **Andre Cronje** | Criador do Yearn Finance. DeFi degen original. | 30%+ tokens DeFi = 95% match |
| **Fernando Ulrich** | Economista e bitcoiner brasileiro. | 70%+ BTC = 90% match |
| **Guiriba** | Trader brasileiro lendário. | 30%+ BTC + 20%+ SOL = 90% match |
| **Chico** | Influencer crypto brasileiro. Diversificado. | 5+ ativos + 20%+ BTC/ETH/alts = 90% match |

---

## 💬 Frases Motivacionais / Roasts

Frases exibidas junto com o score final, categorizadas por performance.

### Score Alto (80+)
- "Warren Buffett estaria orgulhoso... se ele investisse em crypto." 🎩
- "Seu portfólio está mais sólido que a convicção de um maximalista." 💪
- "Você investe melhor que 90% dos influencers de crypto." 📊

### Score Médio (60-79)
- "Não está ruim, mas também não está no caminho da Lambo." 🚗
- "Seu portfólio tem potencial, só precisa de uns ajustes." 🔧
- "Bom começo! Agora é hora de refinar a estratégia." 🎯

### Score Baixo (<60)
- "Seu portfólio precisa de terapia. Nós podemos ajudar." 🛋️
- "Já considerou pedir conselhos para alguém que não seja do Twitter?" 🤔
- "Você está a uma rugpull de virar meme você mesmo." 💀
- "Pelo menos você está aqui buscando ajuda. Isso já é alguma coisa!" 🆘
- "Seu portfólio parece que foi montado jogando dardos." 🎯

### Memecoins (30%+ em memes)
- "Você realmente gosta de viver perigosamente, né?" 🎰
- "Pelo menos você vai ter histórias incríveis para contar." 📖
- "Degen mode: ATIVADO. Boa sorte, guerreiro." ⚔️

---

## 📊 Tokens Considerados

### Stablecoins
USDT, USDC, DAI, BUSD, TUSD, USDP, FRAX, LUSD

### Memecoins
DOGE, SHIB, PEPE, FLOKI, BONK, WIF, MEME, WOJAK, BRETT, POPCAT

### Tokens DeFi
UNI, AAVE, CRV, YFI, COMP, MKR, SNX, SUSHI, LDO, GMX

---

*Última atualização: Janeiro 2026*
