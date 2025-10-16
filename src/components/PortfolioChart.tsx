import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  name: string;
  value: number;
}

interface PortfolioChartProps {
  title: string;
  data: ChartData[];
  theme?: 'light' | 'dark';
  hideLegend?: boolean;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export default function PortfolioChart({ title, data, theme = 'light', hideLegend = false }: PortfolioChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: hideLegend
        ? { display: false }
        : {
            display: true,
            position: 'right' as const,
            labels: { padding: 12, usePointStyle: true },
          },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 p-4 rounded-lg border border-gray-800' : 'bg-gray-50 p-4 rounded-lg'}>
      <h3 className={theme === 'dark' ? 'text-lg font-semibold text-gray-100 mb-4 text-center' : 'text-lg font-semibold text-gray-800 mb-4 text-center'}>
        {title}
      </h3>
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      {/* Sem resumo duplicado; legenda fica ao lado (position right) */}
    </div>
  );
}
