import React from 'react';
import { UnlockAlert } from '../types/portfolio';

interface UnlockAlertsProps {
  alerts: UnlockAlert[];
}

export default function UnlockAlerts({ alerts }: UnlockAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          Nenhum Unlock Relevante
        </h3>
        <p className="text-gray-600">
          Não identificamos unlocks significativos (≥5% do supply) nos próximos 60 dias.
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
          Identificamos {alerts.length} unlock{alerts.length !== 1 ? 's' : ''} relevante{alerts.length !== 1 ? 's' : ''} 
          nos próximos 60 dias que podem impactar os preços.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {alerts.filter(alert => alert.severity === 'red').length}
          </div>
          <div className="text-sm text-red-700">Alertas Críticos</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {alerts.filter(alert => alert.severity === 'yellow').length}
          </div>
          <div className="text-sm text-yellow-700">Atenção</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {alerts.reduce((sum, alert) => sum + alert.percentage, 0).toFixed(1)}%
          </div>
          <div className="text-sm text-blue-700">% Total do Supply</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const daysUntil = getDaysUntilUnlock(alert.unlockDate);
          
          return (
            <div 
              key={index} 
              className={`p-6 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {alert.token} Unlock
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'red' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.severity === 'red' ? 'Crítico' : 'Atenção'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Data:</span>
                      <div className="font-semibold text-gray-800">
                        {formatDate(alert.unlockDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {daysUntil > 0 ? `Em ${daysUntil} dias` : 'Hoje'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">% do Supply:</span>
                      <div className="font-semibold text-gray-800">
                        {alert.percentage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Quantidade:</span>
                      <div className="font-semibold text-gray-800">
                        {formatAmount(alert.amount)} {alert.token}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-1">💡 Impacto Esperado:</h5>
                    <p className="text-sm text-gray-700">
                      {alert.severity === 'red' 
                        ? 'Alto impacto no preço devido ao grande volume de tokens entrando em circulação.'
                        : 'Impacto moderado no preço. Monitore o mercado próximo à data.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <span className="text-xl mr-2">📋</span>
          Recomendações
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Monitore os preços próximo às datas de unlock</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Considere reduzir posições antes de unlocks críticos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Diversifique para reduzir exposição a eventos específicos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Unlocks podem criar oportunidades de compra após a pressão de venda</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-gray-600 text-xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Fonte dos Dados
            </h4>
            <p className="text-sm text-gray-600">
              Os dados de unlocks são coletados de fontes públicas e podem não estar 100% atualizados. 
              Sempre verifique informações oficiais dos projetos antes de tomar decisões de investimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
