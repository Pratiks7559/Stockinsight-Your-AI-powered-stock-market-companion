// AlertsPanel.jsx
import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Bell } from 'lucide-react';

const AlertsPanel = ({ holdings, realTimePrices }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    generateAlerts();
  }, [holdings, realTimePrices]);

  const generateAlerts = () => {
    const newAlerts = [];

    holdings.forEach(holding => {
      const realTimePrice = realTimePrices[holding.symbol];
      const currentPrice = realTimePrice?.price || holding.currentPrice;
      const change = realTimePrice?.changePercent || 0;

      // Price movement alerts
      if (Math.abs(change) > 5) {
        newAlerts.push({
          id: `price_${holding.symbol}`,
          type: change > 0 ? 'positive' : 'negative',
          symbol: holding.symbol,
          message: `${holding.symbol} ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          icon: change > 0 ? TrendingUp : TrendingDown
        });
      }

      // P&L alerts
      const unrealizedPLPercent = ((currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
      if (unrealizedPLPercent > 20) {
        newAlerts.push({
          id: `profit_${holding.symbol}`,
          type: 'positive',
          symbol: holding.symbol,
          message: `${holding.symbol} up ${unrealizedPLPercent.toFixed(1)}% - Consider taking profits`,
          timestamp: new Date().toISOString(),
          icon: TrendingUp
        });
      } else if (unrealizedPLPercent < -15) {
        newAlerts.push({
          id: `loss_${holding.symbol}`,
          type: 'warning',
          symbol: holding.symbol,
          message: `${holding.symbol} down ${Math.abs(unrealizedPLPercent).toFixed(1)}% - Review position`,
          timestamp: new Date().toISOString(),
          icon: AlertTriangle
        });
      }
    });

    setAlerts(newAlerts.slice(0, 5)); // Limit to 5 alerts
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alerts
        </h2>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">No alerts</div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            You'll see important updates here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const IconComponent = alert.icon;
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;