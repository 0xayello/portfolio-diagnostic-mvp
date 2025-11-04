import React from 'react';
import { UnlockAlert } from '../types/portfolio';
import TokenLink from './TokenLink';

interface UnlockAlertsProps {
  alerts: UnlockAlert[];
}

export default function UnlockAlerts({ alerts }: UnlockAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          Nenhum Unlock nos próximos 180 dias
        </h3>
        <p className="text-gray-600">
          Não identificamos eventos de liberação de tokens no período solicitado.
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'border-red-200 bg-red-50';
      case 'yellow': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'red': return '🚨';
      case 'yellow': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const getDaysUntilUnlock = (dateString: string) => {
    const unlockDate = new Date(dateString);
    const today = new Date();
    const diffTime = unlockDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Alertas de Token Unlocks
        </h3>
        <p className="text-gray-600">
          Identificamos {alerts.length} evento{alerts.length !== 1 ? 's' : ''} de unlock nos próximos 180 dias.
        </p>
      </div>

      {/* Tabela simples: Ticker | % Supply | Data */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% do Supply</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Liberação</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em (dias)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alerts.map((alert, idx) => {
              const daysUntil = getDaysUntilUnlock(alert.unlockDate);
              return (
                <tr key={idx}>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    <TokenLink symbol={alert.token} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{alert.percentage.toFixed(2)}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{formatDate(alert.unlockDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{daysUntil > 0 ? daysUntil : 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <span className="text-gray-600 text-xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Fonte dos Dados</h4>
            <p className="text-sm text-gray-600">
              Dados coletados via API pública da DeFiLlama. Podem existir divergências para tokens menos acompanhados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
