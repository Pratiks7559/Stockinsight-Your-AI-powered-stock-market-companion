// frontend/src/components/StockTable.jsx
import React, { useState, useEffect } from 'react';
import StockChartCard from './StockChartCard';

const StockTable = ({ stocks, onRemoveStock, loading }) => {
  const [expandedSymbol, setExpandedSymbol] = useState(null);

  if (stocks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Your Watchlist
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your watchlist is empty. Add some stocks to track them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {stocks.map((stock, index) => (
              <React.Fragment key={`stock-${stock.symbol}-${index}`}>
                <tr 
                  key={`${stock.symbol}-${index}`}
                  className="hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => setExpandedSymbol(expandedSymbol === stock.symbol ? null : stock.symbol)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {stock.symbol}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{stock.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loading ? (
                      <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-all duration-300">
                        <span className={`${stock.change > 0 ? 'animate-pulse text-green-600' : stock.change < 0 ? 'animate-pulse text-red-600' : ''}`}>
                          ${Number(stock.price || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loading ? (
                      <div className="animate-pulse bg-gray-300 h-4 w-12 rounded"></div>
                    ) : (
                      <div className={`text-sm font-medium transition-all duration-300 ${
                        (stock.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <span className={`${Math.abs(stock.change || 0) > 0.1 ? 'animate-bounce' : ''}`}>
                          {(stock.change || 0) >= 0 ? '+' : ''}{Number(stock.change || 0).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      stock.sentiment === 'positive' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : stock.sentiment === 'negative' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {stock.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStock(stock.symbol);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
                {expandedSymbol === stock.symbol && (
                  <tr key={`${stock.symbol}-chart-${index}`} className="bg-gray-50 dark:bg-slate-700">
                    <td colSpan="6" className="px-6 py-4">
                      <StockChartCard symbol={stock.symbol} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default StockTable;