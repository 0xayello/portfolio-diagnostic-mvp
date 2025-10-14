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
        labels: series.map(p => new Date(p.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })),
        datasets: [
          {
            label: 'Portfólio',
            data: series.map(p => p.portfolio),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: 'Bitcoin',
            data: series.map(p => p.btc),
            borderColor: '#9CA3AF',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
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
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Bitcoin',
            data: backtest.map(result => result.benchmarkReturns?.btc ?? 0),
            borderColor: '#9CA3AF',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        ticks: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' },
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
        <div className={compact ? 'relative h-56' : 'relative h-80'}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Retorno Total</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {avgReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Retorno Médio</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {bestPeriod.portfolioReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Melhor Período ({bestPeriod.period})</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {worstPeriod.portfolioReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Pior Período ({worstPeriod.period})</div>
        </div>
      </div>

      {/* Performance by Token */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
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
                {Object.keys(backtest[0]?.tokenReturns || {}).map(token => (
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
                  {Object.entries(result.tokenReturns).map(([token, returnValue]) => (
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

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">
              Aviso Importante
            </h4>
            <p className="text-sm text-yellow-700">
              Este backtest é ilustrativo e assume que a carteira foi mantida estática durante todo o período. 
              Não considera taxas de transação, slippage, rebalanceamentos ou outros custos operacionais. 
              Performance passada não garante resultados futuros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
