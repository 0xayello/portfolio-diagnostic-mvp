/**
 * MENSAGENS DO DIAGNÓSTICO
 * 
 * Arquivo centralizado com todas as mensagens exibidas ao usuário.
 * Facilita manutenção, internacionalização e consistência.
 */

export const DIAGNOSTIC_MESSAGES = {
  // ============================================================================
  // BITCOIN (BTC) - Categoria especial
  // ============================================================================
  
  btc_concentrated: {
    conservative_long: {
      title: '💎 Portfólio Focado em Bitcoin',
      message: (percentage: number) => `${percentage.toFixed(1)}% em BTC`,
      actionable: () => 
        `Bitcoin é o ativo mais estabelecido em cripto. Para seu perfil conservador de longo prazo, alta concentração em BTC é aceitável, mas considere manter 5-10% em stablecoins (USDC/USDT) para emergências.`
    },
    conservative_medium: {
      title: '💎 Alta Concentração em Bitcoin',
      message: (percentage: number) => `${percentage.toFixed(1)}% em BTC`,
      actionable: () =>
        `Para médio prazo, considere manter 10-15% em stablecoins para aproveitar oportunidades e gerenciar volatilidade.`
    },
    moderate_aggressive: {
      title: '💎 Portfólio Concentrado em Bitcoin',
      message: (percentage: number) => `${percentage.toFixed(1)}% em BTC`,
      actionable: (profile: string) =>
        `Para seu perfil ${profile}, considere diversificar para capturar outras oportunidades sem abandonar uma alocação majoritária em BTC.`
    }
  },

  // ============================================================================
  // STABLECOINS
  // ============================================================================
  
  stablecoins: {
    insufficient: {
      high_btc: {
        title: '💵 Major Stablecoins Insuficientes',
        message: (current: number, min: number, max: number) =>
          `${current.toFixed(1)}% (recomendado: ${min}-${max}%)`,
        actionable: () =>
          `Sua alocação em BTC é excelente. Considere manter stablecoins apenas para liquidez de emergências e oportunidades.`
      },
      conservative: {
        title: '🚨 Zero Major Stablecoins: Carteira sem proteção de capital',
        actionable: (min: number, max: number) =>
          `CRÍTICO para perfil conservador: Aloque ${min}-${max}% em major stablecoins para gerenciar volatilidade e ter liquidez.`
      },
      normal: {
        title: '💵 Major Stablecoins Insuficientes',
        message: (current: number, min: number, max: number) =>
          `${current.toFixed(1)}% (recomendado: ${min}-${max}%)`,
        actionable: (profile: string, min: number) =>
          `Perfil ${profile} necessita colchão de segurança. Aumente stables para ${min}% vendendo posições de maior risco.`
      }
    },
    ideal: {
      title: '✅ Alocação Ideal de Major Stablecoins',
      message: (percentage: number) => `${percentage.toFixed(1)}%`,
      actionable: (percentage: number, min: number, max: number, profile: string) =>
        `Sua alocação em major stablecoins (${percentage.toFixed(1)}%) está dentro da faixa recomendada de ${min}-${max}% para perfil ${profile}. Isso garante boa gestão de risco e liquidez.`
    }
  },

  // ============================================================================
  // MAJORS (ETH/SOL)
  // ============================================================================
  
  majors: {
    distribution_btc_low: {
      title: '⚠️ Distribuição de Majors',
      message: (btc: number, ethSol: number) =>
        `BTC (${btc.toFixed(1)}%) vs ETH/SOL (${ethSol.toFixed(1)}%)`,
      actionable: () =>
        `Para perfil conservador e longo prazo, BTC deve ter peso maior (≥60% dos majors). Considere aumentar exposição em BTC.`
    },
    ideal: {
      title: '✅ Exposição Sólida em Majors',
      message: (percentage: number) => `${percentage.toFixed(0)}%`,
      actionable: (percentage: number) =>
        `Excelente alocação de ${percentage.toFixed(0)}% em BTC/ETH/SOL. Essa base sólida garante liquidez, menor volatilidade e correlação com o mercado cripto geral.`
    }
  },

  // ============================================================================
  // CONCENTRAÇÃO
  // ============================================================================
  
  concentration: {
    individual: {
      title: '🚨 Portfólio Extremamente Concentrado',
      message: (token: string, percentage: number) =>
        `${token} representa ${percentage.toFixed(1)}%`,
      actionable: (token: string, isMajor: boolean) =>
        `RISCO SISTÊMICO: Distribua imediatamente para múltiplos ativos. ${isMajor ? 'Mesmo em majors (ETH/SOL), mantenha no máximo 40%.' : 'Para altcoins, máximo recomendado é 15%.'}` 
    },
    ecosystem: {
      title: '🔗 Alta Correlação por Ecossistema',
      message: (percentage: number, ecosystem: string) =>
        `${percentage.toFixed(1)}% no ecossistema ${ecosystem}`,
      actionable: (percentage: number, ecosystem: string, mainAsset: string) =>
        `RISCO DE CORRELAÇÃO: Você tem ${percentage.toFixed(1)}% em ativos do ecossistema ${ecosystem}. Se ${mainAsset} cair, todo seu portfólio cai junto. Diversifique em outros ecossistemas e setores descorrelacionados.`
    },
    strategic_majors: {
      title: '✅ Concentração Estratégica em Majors',
      message: (numAssets: number) => `${numAssets} ${numAssets === 1 ? 'ativo' : 'ativos'}`,
      actionable: (percentage: number, description: string) =>
        `Excelente! ${percentage.toFixed(0)}% em ${description} é uma estratégia sólida de baixo risco e boa liquidez. Abordagem "keep it simple" comprovada.`
    }
  },

  // ============================================================================
  // RENDA PASSIVA
  // ============================================================================
  
  passive_income: {
    insufficient_yield: {
      title: '💰 Renda Passiva: Baixa Exposição em Ativos Geradores de Yield',
      message: (percentage: number) => `Apenas ${percentage.toFixed(1)}% em ativos geradores de yield`,
      actionable: (total: number, stakeable: number, stables: number) =>
        `Seu objetivo é renda passiva, mas apenas ${total.toFixed(1)}% está em ativos com potencial de yield (${stakeable.toFixed(1)}% em ativos com mecanismos de yield + ${stables.toFixed(1)}% em major stablecoins). Se renda passiva for prioridade, aumente gradualmente a parcela em ativos com potencial de yield e mantenha stablecoins dentro da faixa recomendada para o seu perfil, respeitando seu apetite a risco.`
    },
    excellent_yield: {
      title: '✅ Estratégia de Renda Passiva Bem Estruturada',
      message: (percentage: number) => `${percentage.toFixed(1)}% em ativos geradores de yield`,
      actionable: (stakeable: number, stables: number) =>
        `Excelente! ${stakeable.toFixed(1)}% em ativos com potencial de yield + ${stables.toFixed(1)}% em major stablecoins está bem alinhado com seu objetivo de renda passiva. Só garanta que a estratégia usada para yield esteja coerente com seu perfil (custódia, riscos de protocolo e liquidez).`
    },
    btc_not_yielding: {
      title: '💡 Bitcoin não Gera Yield para Renda Passiva',
      message: (btcPercentage: number) => `${btcPercentage.toFixed(1)}% em BTC`,
      actionable: (btcPercentage: number) =>
        `Você tem ${btcPercentage.toFixed(1)}% em BTC. Importante: BTC não gera yield nativo; quando há “yield em BTC”, normalmente envolve estruturas adicionais e, portanto, risco extra (custódia e/ou risco de protocolo). Se renda passiva for prioridade, complemente sua carteira com uma parcela maior de major stablecoins dentro da faixa do seu perfil e/ou aumente a parcela em ativos com potencial de yield — sempre equilibrando retorno esperado e risco.`
    }
  },

  // ============================================================================
  // MEMECOINS
  // ============================================================================
  
  memecoins: {
    exposure: {
      title: '🎲 Exposição em Memecoins',
      message: (percentage: number, list: string) =>
        `${Math.round(percentage)}%${list ? ` - ${list}` : ''}`,
      actionable: (percentage: number, maxAllowed: number, profile: string, redistribution: string) => {
        const profileLimits: {[key: string]: string} = {
          low: '0%',
          medium: '5%',
          high: '15%'
        };
        const limit = profileLimits[profile] || '5%';
        const excess = percentage - maxAllowed;
        return `Memecoins são extremamente voláteis e especulativos. Recomendado máximo ${limit} em perfil ${profile === 'high' ? 'arrojado' : profile === 'medium' ? 'moderado' : 'conservador'}. Você está ${excess.toFixed(0)}% acima do recomendado. Distribua para ${redistribution} e mantenha no máximo ${limit} em Memecoins.`;
      }
    }
  },

  // ============================================================================
  // DIVERSIFICAÇÃO
  // ============================================================================
  
  diversification: {
    ideal_assets: {
      title: '✅ Diversificação Ideal',
      message: (numAssets: number) => `${numAssets} ativos`,
      actionable: (numAssets: number) =>
        `Você tem ${numAssets} ativos, o que está na faixa ideal (4-8). Isso oferece boa diversificação sem diluir demais o potencial de retorno.`
    }
  }
} as const;

/**
 * Helper para formatar mensagens com valores dinâmicos
 */
export function formatMessage(template: string, values: {[key: string]: any}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

