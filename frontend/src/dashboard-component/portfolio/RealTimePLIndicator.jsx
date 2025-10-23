import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const RealTimePLIndicator = ({ summary, isRealTime, lastUpdate, holdings, realTimePrices }) => {
  if (!summary) return null;

  // Calculate real-time P&L if real-time prices available
  let realTimeUnrealizedPL = summary.totalUnrealizedPL || 0;
  let realTimeUnrealizedPLPercent = summary.totalUnrealizedPLPercent || 0;
  
  if (realTimePrices && holdings && Object.keys(realTimePrices).length > 0) {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    holdings.forEach(holding => {
      const invested = holding.avgPrice * holding.quantity;
      const realTimePrice = realTimePrices[holding.symbol]?.price;
      const currentPrice = realTimePrice ? parseFloat(realTimePrice) : (holding.currentPrice || holding.avgPrice);
      const currentValue = currentPrice * holding.quantity;
      
      totalInvested += invested;
      totalCurrentValue += currentValue;
    });
    
    realTimeUnrealizedPL = totalCurrentValue - totalInvested;
    realTimeUnrealizedPLPercent = totalInvested > 0 ? (realTimeUnrealizedPL / totalInvested) * 100 : 0;
  }
  
  const totalPL = realTimeUnrealizedPL + (summary.realizedPL || 0);
  const isPositive = realTimeUnrealizedPL >= 0;
  const totalPLPositive = totalPL >= 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live P&L
          </h3>
          {isRealTime && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400">LIVE</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'No updates'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Unrealized P&L */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">Unrealized</span>
          </div>
          <div className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(realTimeUnrealizedPL)}
          </div>
          <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(realTimeUnrealizedPLPercent)}
          </div>
        </div>

        {/* Total P&L */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            {totalPLPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-orange-600" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
          </div>
          <div className={`text-xl font-bold ${totalPLPositive ? 'text-emerald-600' : 'text-orange-600'}`}>
            {formatCurrency(totalPL)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            All time
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-600">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <div className={`w-1 h-1 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{isRealTime ? 'Real-time updates active' : 'Waiting for updates'}</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimePLIndicator;