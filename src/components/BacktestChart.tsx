import React from 'react';
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
}

export default function BacktestChart({ backtest, series, theme = 'light', compact = false }: BacktestChartProps) {
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

  // Cores vibrantes para cada token
  const tokenColors: { [key: string]: { border: string; bg: string } } = {
    BTC: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
    ETH: { border: '#627eea', bg: 'rgba(98, 126, 234, 0.08)' },
    SOL: { border: '#9945ff', bg: 'rgba(153, 69, 255, 0.08)' },
    USDC: { border: '#2775ca', bg: 'rgba(39, 117, 202, 0.08)' },
    USDT: { border: '#26a17b', bg: 'rgba(38, 161, 123, 0.08)' },
    DOGE: { border: '#c2a633', bg: 'rgba(194, 166, 51, 0.08)' },
    SHIB: { border: '#ffa409', bg: 'rgba(255, 164, 9, 0.08)' },
    ARB: { border: '#28a0f0', bg: 'rgba(40, 160, 240, 0.08)' },
    OP: { border: '#ff0420', bg: 'rgba(255, 4, 32, 0.08)' },
    MATIC: { border: '#8247e5', bg: 'rgba(130, 71, 229, 0.08)' },
    AVAX: { border: '#e84142', bg: 'rgba(232, 65, 66, 0.08)' },
    DOT: { border: '#e6007a', bg: 'rgba(230, 0, 122, 0.08)' },
    LINK: { border: '#2a5ada', bg: 'rgba(42, 90, 218, 0.08)' },
    UNI: { border: '#ff007a', bg: 'rgba(255, 0, 122, 0.08)' },
    AAVE: { border: '#b6509e', bg: 'rgba(182, 80, 158, 0.08)' },
    DEFAULT: { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
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
