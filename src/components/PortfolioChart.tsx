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
      legend: {
        display: !hideLegend,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
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
      
      {/* Summary */}
      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>{item.name}</span>
            </div>
            <span className={theme === 'dark' ? 'font-medium text-gray-100' : 'font-medium text-gray-900'}>
              {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
        {data.length > 5 && (
          <div className={theme === 'dark' ? 'text-xs text-gray-400 text-center' : 'text-xs text-gray-500 text-center'}>
            +{data.length - 5} outros
          </div>
        )}
      </div>
    </div>
  );
}
