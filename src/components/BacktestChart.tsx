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

  const chartData = series && series.length > 0
    ? {
        // usamos as datas originais como labels e formatamos no eixo (ticks.callback)
        labels: series.map(p => p.date),
        datasets: [
          {
            label: 'Portfólio',
            data: series.map(p => p.portfolio),
            borderColor: '#27224e',
            backgroundColor: 'rgba(39, 34, 78, 0.08)',
            borderWidth: 3,
            fill: false,
            tension: 0.25,
            pointRadius: 0,
          },
          {
            label: 'Bitcoin',
            data: series.map(p => p.btc),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 2,
            fill: false,
            tension: 0.25,
            pointRadius: 0,
          },
        ],
      }
    : {
        labels: backtest.map(result => result.period.toUpperCase()),
        datasets: [
          {
            label: 'Portfólio',
            data: backtest.map(result => result.portfolioReturn),
            borderColor: '#27224e',
            backgroundColor: 'rgba(39, 34, 78, 0.08)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Bitcoin',
            data: backtest.map(result => result.benchmarkReturns?.btc ?? 0),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
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
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          callback: (val: any, index: number) => {
            if (!series || !series.length) return '';
            const d = new Date(series[index].date);
            // mostrar 1 rótulo a cada ~3 meses, preferencialmente no início do mês
            const show = (d.getMonth() % 3 === 0) && d.getDate() <= 3;
            return show ? `${monthPt[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}` : '';
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
