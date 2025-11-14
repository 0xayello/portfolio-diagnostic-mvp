import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BacktestResult, BacktestPoint } from '../types/portfolio';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BacktestChartProps {
  backtest: BacktestResult[];
  series?: BacktestPoint[];
  theme?: 'light' | 'dark';
  compact?: boolean;
  onPeriodChange?: (days: number) => void;
}

export default function BacktestChart({ backtest, series, theme = 'light', compact = false, onPeriodChange }: BacktestChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(180); // Default: 6 meses

  const periods = [
    { label: '1 mês', days: 30 },
    { label: '3 meses', days: 90 },
    { label: '6 meses', days: 180 },
    { label: '12 meses', days: 365 },
  ];

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
    if (onPeriodChange) {
      onPeriodChange(days);
    }
  };

  if (!backtest || backtest.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Dados de Backtest Indisponíveis
        </h3>
        <p className="text-gray-500">
          Não foi possível calcular o histórico de performance da carteira.
        </p>
      </div>
    );
  }

  // Cores representativas de cada token (cores oficiais das marcas)
  const tokenColors: { [key: string]: { border: string; bg: string } } = {
    // Majors
    BTC: { border: '#f7931a', bg: 'rgba(247, 147, 26, 0.08)' }, // Laranja Bitcoin
    ETH: { border: '#627eea', bg: 'rgba(98, 126, 234, 0.08)' }, // Azul Ethereum
    SOL: { border: '#9945ff', bg: 'rgba(153, 69, 255, 0.08)' }, // Roxo Solana
    BNB: { border: '#f3ba2f', bg: 'rgba(243, 186, 47, 0.08)' }, // Amarelo Binance
    XRP: { border: '#23292f', bg: 'rgba(35, 41, 47, 0.08)' }, // Preto Ripple
    ADA: { border: '#0033ad', bg: 'rgba(0, 51, 173, 0.08)' }, // Azul escuro Cardano
    
    // Stablecoins
    USDC: { border: '#2775ca', bg: 'rgba(39, 117, 202, 0.08)' }, // Azul USDC
    USDT: { border: '#26a17b', bg: 'rgba(38, 161, 123, 0.08)' }, // Verde Tether
    DAI: { border: '#f5ac37', bg: 'rgba(245, 172, 55, 0.08)' }, // Amarelo DAI
    BUSD: { border: '#f0b90b', bg: 'rgba(240, 185, 11, 0.08)' }, // Amarelo BUSD
    USDD: { border: '#0a1f3d', bg: 'rgba(10, 31, 61, 0.08)' }, // Azul escuro
    TUSD: { border: '#002868', bg: 'rgba(0, 40, 104, 0.08)' }, // Azul TrueUSD
    FDUSD: { border: '#00d4aa', bg: 'rgba(0, 212, 170, 0.08)' }, // Verde água
    
    // Memecoins
    DOGE: { border: '#c2a633', bg: 'rgba(194, 166, 51, 0.08)' }, // Dourado Dogecoin
    SHIB: { border: '#ffa409', bg: 'rgba(255, 164, 9, 0.08)' }, // Laranja Shiba
    PEPE: { border: '#3b8428', bg: 'rgba(59, 132, 40, 0.08)' }, // Verde Pepe
    FLOKI: { border: '#ff4d00', bg: 'rgba(255, 77, 0, 0.08)' }, // Laranja Floki
    BONK: { border: '#ff6b35', bg: 'rgba(255, 107, 53, 0.08)' }, // Laranja BONK
    WIF: { border: '#ffb3ba', bg: 'rgba(255, 179, 186, 0.08)' }, // Rosa WIF
    BOME: { border: '#8b4513', bg: 'rgba(139, 69, 19, 0.08)' }, // Marrom
    
    // Layer 1s
    AVAX: { border: '#e84142', bg: 'rgba(232, 65, 66, 0.08)' }, // Vermelho Avalanche
    DOT: { border: '#e6007a', bg: 'rgba(230, 0, 122, 0.08)' }, // Rosa Polkadot
    MATIC: { border: '#8247e5', bg: 'rgba(130, 71, 229, 0.08)' }, // Roxo Polygon
    ATOM: { border: '#2e3148', bg: 'rgba(46, 49, 72, 0.08)' }, // Cinza escuro Cosmos
    TIA: { border: '#7b2bf9', bg: 'rgba(123, 43, 249, 0.08)' }, // Roxo Celestia
    SEI: { border: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' }, // Vermelho Sei
    SUI: { border: '#4da2ff', bg: 'rgba(77, 162, 255, 0.08)' }, // Azul Sui
    APT: { border: '#00d4aa', bg: 'rgba(0, 212, 170, 0.08)' }, // Verde água Aptos
    INJ: { border: '#00f2fe', bg: 'rgba(0, 242, 254, 0.08)' }, // Ciano Injective
    NEAR: { border: '#000000', bg: 'rgba(0, 0, 0, 0.08)' }, // Preto NEAR
    FTM: { border: '#1969ff', bg: 'rgba(25, 105, 255, 0.08)' }, // Azul Fantom
    ALGO: { border: '#000000', bg: 'rgba(0, 0, 0, 0.08)' }, // Preto Algorand
    
    // Layer 2s
    ARB: { border: '#28a0f0', bg: 'rgba(40, 160, 240, 0.08)' }, // Azul Arbitrum
    OP: { border: '#ff0420', bg: 'rgba(255, 4, 32, 0.08)' }, // Vermelho Optimism
    MNT: { border: '#000000', bg: 'rgba(0, 0, 0, 0.08)' }, // Preto Mantle
    STRK: { border: '#ec796b', bg: 'rgba(236, 121, 107, 0.08)' }, // Coral Starknet
    IMX: { border: '#0bb2f5', bg: 'rgba(11, 178, 245, 0.08)' }, // Azul claro IMX
    METIS: { border: '#00dacc', bg: 'rgba(0, 218, 204, 0.08)' }, // Ciano Metis
    
    // DeFi
    UNI: { border: '#ff007a', bg: 'rgba(255, 0, 122, 0.08)' }, // Rosa Uniswap
    AAVE: { border: '#b6509e', bg: 'rgba(182, 80, 158, 0.08)' }, // Roxo AAVE
    LDO: { border: '#00a3ff', bg: 'rgba(0, 163, 255, 0.08)' }, // Azul Lido
    CRV: { border: '#ff0000', bg: 'rgba(255, 0, 0, 0.08)' }, // Vermelho Curve
    MKR: { border: '#1aab9b', bg: 'rgba(26, 171, 155, 0.08)' }, // Verde Maker
    COMP: { border: '#00d395', bg: 'rgba(0, 211, 149, 0.08)' }, // Verde Compound
    SNX: { border: '#00d1ff', bg: 'rgba(0, 209, 255, 0.08)' }, // Ciano Synthetix
    PENDLE: { border: '#16c784', bg: 'rgba(22, 199, 132, 0.08)' }, // Verde Pendle
    JTO: { border: '#9945ff', bg: 'rgba(153, 69, 255, 0.08)' }, // Roxo Jito
    ONDO: { border: '#1e3a8a', bg: 'rgba(30, 58, 138, 0.08)' }, // Azul escuro Ondo
    JUP: { border: '#c7f284', bg: 'rgba(199, 242, 132, 0.08)' }, // Verde claro Jupiter
    RUNE: { border: '#00ccff', bg: 'rgba(0, 204, 255, 0.08)' }, // Ciano Thor
    GMX: { border: '#5294ff', bg: 'rgba(82, 148, 255, 0.08)' }, // Azul GMX
    DYDX: { border: '#6966ff', bg: 'rgba(105, 102, 255, 0.08)' }, // Roxo dYdX
    
    // Oracles
    LINK: { border: '#2a5ada', bg: 'rgba(42, 90, 218, 0.08)' }, // Azul Chainlink
    PYTH: { border: '#7141f1', bg: 'rgba(113, 65, 241, 0.08)' }, // Roxo Pyth
    GRT: { border: '#6f4cff', bg: 'rgba(111, 76, 255, 0.08)' }, // Roxo The Graph
    BAND: { border: '#516aff', bg: 'rgba(81, 106, 255, 0.08)' }, // Azul Band
    
    // AI & Compute
    WLD: { border: '#000000', bg: 'rgba(0, 0, 0, 0.08)' }, // Preto Worldcoin
    FET: { border: '#0048ff', bg: 'rgba(0, 72, 255, 0.08)' }, // Azul Fetch.ai
    AGIX: { border: '#5e2aff', bg: 'rgba(94, 42, 255, 0.08)' }, // Roxo SingularityNET
    RNDR: { border: '#ff6b00', bg: 'rgba(255, 107, 0, 0.08)' }, // Laranja Render
    OCEAN: { border: '#141414', bg: 'rgba(20, 20, 20, 0.08)' }, // Preto Ocean
    ARKM: { border: '#000000', bg: 'rgba(0, 0, 0, 0.08)' }, // Preto Arkham
    
    // Storage
    FIL: { border: '#0090ff', bg: 'rgba(0, 144, 255, 0.08)' }, // Azul Filecoin
    AR: { border: '#222326', bg: 'rgba(34, 35, 38, 0.08)' }, // Cinza escuro Arweave
    
    // Gaming & NFT
    BLUR: { border: '#ff8700', bg: 'rgba(255, 135, 0, 0.08)' }, // Laranja Blur
    GALA: { border: '#000000', bg: 'rgba(0, 0, 0, 0.08)' }, // Preto Gala
    SAND: { border: '#00adef', bg: 'rgba(0, 173, 239, 0.08)' }, // Azul Sandbox
    MANA: { border: '#ff2d55', bg: 'rgba(255, 45, 85, 0.08)' }, // Rosa Decentraland
    AXS: { border: '#0055d5', bg: 'rgba(0, 85, 213, 0.08)' }, // Azul Axie
    
    // Liquid Staking
    RPL: { border: '#e57a3f', bg: 'rgba(229, 122, 63, 0.08)' }, // Laranja Rocket Pool
    ETHFI: { border: '#704af5', bg: 'rgba(112, 74, 245, 0.08)' }, // Roxo EtherFi
    
    // Exchanges
    HYPE: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' }, // Verde Hyperliquid
    
    // Others
    STX: { border: '#5546ff', bg: 'rgba(85, 70, 255, 0.08)' }, // Roxo Stacks
    ROSE: { border: '#0500fb', bg: 'rgba(5, 0, 251, 0.08)' }, // Azul Oasis
    
    DEFAULT: { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' }, // Índigo padrão
  };

  const getTokenColor = (token: string) => {
    return tokenColors[token.toUpperCase()] || tokenColors.DEFAULT;
  };

  const chartData = series && series.length > 0
    ? {
        // usamos as datas originais como labels e formatamos no eixo (ticks.callback)
        labels: series.map(p => p.date),
        datasets: [
          // BTC sempre como benchmark (linha laranja)
          {
            label: 'Bitcoin (Benchmark)',
            data: series.map(p => p.btc),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 3,
            fill: false,
            tension: 0.25,
            pointRadius: 0,
            borderDash: [5, 5], // linha tracejada para destacar como benchmark
          },
          // Adicionar uma linha para cada token individual
          ...(series[0]?.tokens
            ? Object.keys(series[0].tokens)
                .filter(token => token !== 'BTC') // BTC já está como benchmark
                .map((token, idx) => {
                  const color = getTokenColor(token);
                  return {
                    label: token,
                    data: series.map(p => p.tokens?.[token] ?? 0),
                    borderColor: color.border,
                    backgroundColor: color.bg,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.25,
                    pointRadius: 0,
                  };
                })
            : []),
        ],
      }
    : {
        labels: backtest.map(result => result.period.toUpperCase()),
        datasets: [
          {
            label: 'Bitcoin (Benchmark)',
            data: backtest.map(result => result.benchmarkReturns?.btc ?? 0),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            borderDash: [5, 5],
          },
          ...Object.keys(backtest[0]?.tokenReturns || {}).map((token, idx) => {
            const color = getTokenColor(token);
            return {
              label: token,
              data: backtest.map(result => result.tokenReturns[token]),
              borderColor: color.border,
              backgroundColor: color.bg,
              borderWidth: 2,
              fill: false,
              tension: 0.4,
            };
          }),
        ],
      };

  const monthPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#E5E7EB' : '#111827',
        },
      },
      title: {
        display: true,
        text: 'Performance Histórica da Carteira',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: theme === 'dark' ? '#F9FAFB' : '#111827',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (items: any[]) => {
            if (!items || !items.length || !series) return '';
            const di = items[0].dataIndex;
            const d = new Date(series[di].date);
            const monthPtShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = monthPtShort[d.getMonth()];
            const yy = String(d.getFullYear()).slice(-2);
            return `${dd} ${mm} ${yy}`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Retorno (%)',
          color: theme === 'dark' ? '#D1D5DB' : '#374151',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        },
        grid: { color: theme === 'dark' ? 'rgba(75,85,99,0.4)' : undefined },
      },
      x: {
        display: true,
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          callback: (val: any, index: number) => {
            if (!series || !series.length) return '';
            const step = Math.max(1, Math.floor(series.length / 6)); // ~6 rótulos visíveis
            if (index % step !== 0) return '';
            const d = new Date(series[index].date);
            return `${monthPt[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
          },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: { color: theme === 'dark' ? 'rgba(75,85,99,0.2)' : undefined },
      },
    },
  };

  // Calcular estatísticas
  const totalReturn = backtest.reduce((sum, result) => sum + result.portfolioReturn, 0);
  const avgReturn = backtest.length > 0 ? totalReturn / backtest.length : 0;
  const bestPeriod = backtest.reduce((best, current) => 
    current.portfolioReturn > best.portfolioReturn ? current : best
  );
  const worstPeriod = backtest.reduce((worst, current) => 
    current.portfolioReturn < worst.portfolioReturn ? current : worst
  );

  return (
    <div className="space-y-6">
      {/* Period Selection Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        {periods.map((period) => (
          <button
            key={period.days}
            onClick={() => handlePeriodChange(period.days)}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
              ${selectedPeriod === period.days
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-violet-400 hover:text-violet-600 hover:shadow-md'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className={theme === 'dark' ? 'bg-gray-900 p-6 rounded-lg border border-gray-800' : 'bg-gray-50 p-6 rounded-lg'}>
        <div className={compact ? 'relative h-72' : 'relative h-96'}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Performance by Token - full width below chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Performance por Ativo
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carteira
                </th>
                {Object.keys(backtest[0]?.tokenReturns || {})
                  .filter(token => token !== 'USDC' && token !== 'USDT')
                  .map(token => (
                    <th key={token} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {token}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backtest.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.period}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    result.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.portfolioReturn.toFixed(2)}%
                  </td>
                  {Object.entries(result.tokenReturns)
                    .filter(([token]) => token !== 'USDC' && token !== 'USDT')
                    .map(([token, returnValue]) => (
                      <td key={token} className={`px-6 py-4 whitespace-nowrap text-sm ${
                        returnValue >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {returnValue.toFixed(2)}%
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aviso removido conforme solicitação */}
    </div>
  );
}
