// PortfolioOverview.jsx
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

const PortfolioOverview = ({ summary, realTimePrices, lastUpdate, holdings = [] }) => {
  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate real-time values if realTimePrices available
  let realTimeCurrentValue = summary.totalCurrentValue;
  let realTimeUnrealizedPL = summary.totalUnrealizedPL;
  let realTimeUnrealizedPLPercent = summary.totalUnrealizedPLPercent;
  
  if (realTimePrices && Object.keys(realTimePrices).length > 0 && holdings.length > 0) {
    realTimeCurrentValue = holdings.reduce((total, holding) => {
      const realTimePrice = realTimePrices[holding.symbol]?.price;
      const currentPrice = realTimePrice ? parseFloat(realTimePrice) : holding.currentPrice;
      return total + (currentPrice * holding.quantity);
    }, 0);
    
    realTimeUnrealizedPL = realTimeCurrentValue - summary.totalInvested;
    realTimeUnrealizedPLPercent = summary.totalInvested > 0 ? (realTimeUnrealizedPL / summary.totalInvested) * 100 : 0;
  }

  const {
    totalInvested,
    realizedPL
  } = summary;
  
  const totalPL = realTimeUnrealizedPL + (realizedPL || 0);

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Portfolio Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(realTimeCurrentValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        {/* Total Invested */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
            </div>
            <PieChart className="h-8 w-8 text-gray-200" />
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className={`bg-gradient-to-r ${realTimeUnrealizedPL >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-lg p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${realTimeUnrealizedPL >= 0 ? 'text-green-100' : 'text-red-100'} text-sm`}>
                Unrealized P&L
              </p>
              <p className="text-2xl font-bold">{formatCurrency(realTimeUnrealizedPL)}</p>
              <p className="text-sm">{formatPercent(realTimeUnrealizedPLPercent)}</p>
            </div>
            {realTimeUnrealizedPL >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-200" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-200" />
            )}
          </div>
        </div>

        {/* Total P&L */}
        <div className={`bg-gradient-to-r ${totalPL >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} rounded-lg p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${totalPL >= 0 ? 'text-emerald-100' : 'text-orange-100'} text-sm`}>
                Total P&L
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalPL)}</p>
              <p className="text-sm">
                Realized: {formatCurrency(realizedPL)}
              </p>
            </div>
            {totalPL >= 0 ? (
              <TrendingUp className="h-8 w-8 text-emerald-200" />
            ) : (
              <TrendingDown className="h-8 w-8 text-orange-200" />
            )}
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time P&L updates active</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;