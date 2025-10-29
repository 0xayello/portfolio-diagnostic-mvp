import { Horizon, Objective, Risk, Subscores } from './types';
import { MessageThresholds as T } from './config';

export function horizonMsgs(h: Horizon, sub: number): string[] {
  const m: string[] = [];
  if (h === 'short') {
    if (sub >= T.high) m.push('Sua estratégia de curto prazo está coerente: carteira mais leve em BTC/ETH/SOL favorece flexibilidade.');
    else if (sub >= T.medium) m.push('Coerência razoável no curto prazo. Pequenos ajustes na exposição a BTC/ETH/SOL podem elevar o alinhamento.');
    else m.push('Desalinhamento no curto prazo: alta exposição a ativos de ciclo longo pode limitar saídas rápidas.');
  }
  if (h === 'mid') {
    if (sub >= T.high) m.push('Bom equilíbrio para horizonte médio: exposição intermediária a BTC/ETH/SOL.');
    else if (sub >= T.medium) m.push('Quase lá para o horizonte médio — ajuste a proporção de BTC/ETH/SOL para ~40–60%.');
    else m.push('Para horizonte médio, sua exposição a BTC/ETH/SOL está fora do ideal.');
  }
  if (h === 'long') {
    if (sub >= T.high) m.push('Excelente coerência de longo prazo: forte presença de BTC/ETH/SOL para acumulação.');
    else if (sub >= T.medium) m.push('Boa base para longo prazo. Aumentar BTC/ETH/SOL pode fortalecer o núcleo defensivo.');
    else m.push('Para longo prazo, sua baixa exposição a BTC/ETH/SOL reduz robustez estrutural.');
  }
  return m;
}

export function riskMsgs(r: Risk, sub: number): string[] {
  const m: string[] = [];
  if (r === 'conservative') {
    if (sub >= T.high) m.push('Perfil conservador bem refletido: BTC e stablecoins sustentam estabilidade.');
    else if (sub >= T.medium) m.push('Coerência razoável com perfil conservador; pequenos ajustes em BTC/stables podem ajudar.');
    else m.push('Carteira agressiva para um perfil conservador. Reduza risco para alinhar à sua tolerância.');
  }
  if (r === 'moderate') {
    if (sub >= T.high) m.push('Perfil moderado bem equilibrado entre proteção e crescimento.');
    else if (sub >= T.medium) m.push('Quase no ponto para perfil moderado; ajuste leve de proteção x risco.');
    else m.push('Incoerência para perfil moderado: muito defensivo ou muito agressivo.');
  }
  if (r === 'aggressive') {
    if (sub >= T.high) m.push('Perfil arrojado coerente: exposição a crescimento e volatilidade controlada.');
    else if (sub >= T.medium) m.push('Tese arrojada quase alinhada; reduza defensivos ou aumente risco consciente.');
    else m.push('Incoerência: perfil arrojado com carteira excessivamente defensiva.');
  }
  return m;
}

export function diversificationMsgs(r: Risk, sub: number): string[] {
  const m: string[] = [];
  if (r === 'conservative') {
    if (sub >= T.high) m.push('Boa concentração para perfil conservador: núcleo forte em BTC/ETH/SOL/stables.');
    else if (sub >= T.medium) m.push('Concentração adequada, mas evite dispersão desnecessária.');
    else m.push('Risco de dispersão incompatível com perfil conservador.');
  }
  if (r === 'moderate') {
    if (sub >= T.high) m.push('Diversificação bem calibrada: 5–10 ativos equilibrados.');
    else if (sub >= T.medium) m.push('Diversificação perto do ideal; ajuste nº de ativos e setores.');
    else m.push('Diversificação desalinhada para perfil moderado (poucos ou ativos demais).');
  }
  if (r === 'aggressive') {
    if (sub >= T.high) m.push('Excelente diversificação para perfil arrojado: exposição ampla a múltiplos setores.');
    else if (sub >= T.medium) m.push('Boa base arrojada; ampliar setores/ativos pode elevar retorno potencial.');
    else m.push('Concentração excessiva para perfil arrojado, reduzindo assimetria de upside.');
  }
  return m;
}

export function objectiveMsgs(o: Objective, sub: number): string[] {
  const m: string[] = [];
  if (o === 'preserve') {
    if (sub >= T.high) m.push('Alinhado ao objetivo de preservação: peso majoritário em BTC/ETH/SOL/stables.');
    else if (sub >= T.medium) m.push('Boa base de preservação; reduzir high risk pode melhorar.');
    else m.push('Exposição excessiva a ativos especulativos para quem busca preservar capital.');
  }
  if (o === 'income') {
    if (sub >= T.high) m.push('Aderência à renda passiva: stake/yield em tokens líquidos e confiáveis.');
    else if (sub >= T.medium) m.push('Renda passiva quase ideal; aumente participação em ativos com staking sólido.');
    else m.push('Potencial de renda passiva limitado por baixo uso de staking ou risco excessivo.');
  }
  if (o === 'multiply') {
    if (sub >= T.high) m.push('Coerente com multiplicação de capital: exposição relevante a small caps/narrativas novas.');
    else if (sub >= T.medium) m.push('Quase lá para multiplicar capital; aumente parcela de high risk conscientemente.');
    else m.push('Carteira defensiva para meta de multiplicação — pouco risco reduz upside.');
  }
  return m;
}

// Combinações multi-fator (exemplos)
export function comboMsgs(h: Horizon, r: Risk, o: Objective, subs: Subscores): string[] {
  const msgs: string[] = [];

  if (h === 'short' && r === 'conservative' && subs.diversification >= T.medium) {
    msgs.push('Estratégia prudente e consistente para horizontes curtos: liquidez e proteção bem priorizadas.');
  }
  if (h === 'long' && r === 'aggressive' && subs.diversification >= T.high) {
    msgs.push('Visão de ciclo completo: diversificação ampla e foco em crescimento de longo prazo.');
  }
  if (h === 'mid' && r === 'moderate' && o === 'income' && subs.objective >= T.medium) {
    msgs.push('Equilíbrio saudável: renda passiva sem abrir mão de segurança.');
  }
  if (h === 'short' && o === 'multiply' && subs.objective < T.medium) {
    msgs.push('Atenção: objetivo agressivo em horizonte curto aumenta chance de perdas por volatilidade.');
  }

  return msgs;
}


