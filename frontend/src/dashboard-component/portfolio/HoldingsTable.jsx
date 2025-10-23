// // HoldingsTable.jsx
// import { useState } from 'react';
// import { TrendingUp, TrendingDown, ShoppingCart, Minus } from 'lucide-react';

// const HoldingsTable = ({ holdings, realTimePrices, onBuy, onSell }) => {
//   const [sortField, setSortField] = useState('symbol');
//   const [sortDirection, setSortDirection] = useState('asc');

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2
//     }).format(amount);
//   };

//   const formatPercent = (percent) => {
//     return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
//   };

//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   const sortedHoldings = [...holdings].sort((a, b) => {
//     let aValue = a[sortField];
//     let bValue = b[sortField];

//     // Handle real-time price updates
//     if (sortField === 'currentPrice') {
//       aValue = realTimePrices[a.symbol]?.price || a.currentPrice;
//       bValue = realTimePrices[b.symbol]?.price || b.currentPrice;
//     }

//     if (typeof aValue === 'string') {
//       aValue = aValue.toLowerCase();
//       bValue = bValue.toLowerCase();
//     }

//     if (sortDirection === 'asc') {
//       return aValue > bValue ? 1 : -1;
//     } else {
//       return aValue < bValue ? 1 : -1;
//     }
//   });

//   if (!holdings || holdings.length === 0) {
//     return (
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//           Holdings
//         </h2>
//         <div className="text-center py-8">
//           <div className="text-gray-400 text-lg mb-2">No holdings yet</div>
//           <p className="text-gray-600 dark:text-gray-400">
//             Start building your portfolio by buying your first stock
//           </p>
//           <button
//             onClick={() => onBuy('')}
//             className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Buy Your First Stock
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (

//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//         <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//           Holdings ({holdings.length})
//         </h2>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50 dark:bg-gray-700">
//             <tr>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
//                 onClick={() => handleSort('symbol')}
//               >
//                 Symbol
//               </th>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
//                 onClick={() => handleSort('quantity')}
//               >
//                 Quantity
//               </th>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
//                 onClick={() => handleSort('avgPrice')}
//               >
//                 Avg Cost
//               </th>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
//                 onClick={() => handleSort('currentPrice')}
//               >
//                 Current Price
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Market Value
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 P&L
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//             {sortedHoldings.map((holding) => {
//               const realTimePrice = realTimePrices[holding.symbol];
//               const currentPrice = realTimePrice?.price ? parseFloat(realTimePrice.price) : (holding.currentPrice || holding.avgPrice);
//               const change = realTimePrice?.change ? parseFloat(realTimePrice.change) : ((currentPrice - holding.avgPrice) * holding.quantity);
//               const changePercent = realTimePrice?.changePercent ? parseFloat(realTimePrice.changePercent) : (((currentPrice - holding.avgPrice) / holding.avgPrice) * 100);
              
//               const marketValue = currentPrice * holding.quantity;
//               const unrealizedPL = Math.round(((currentPrice - holding.avgPrice) * holding.quantity) * 100) / 100;
//               const unrealizedPLPercent = Math.round((((currentPrice - holding.avgPrice) / holding.avgPrice) * 100) * 100) / 100;
              
//               const isPositive = unrealizedPL >= 0;
//               const isPriceUp = change >= 0;
//               const hasRealTimeData = !!realTimePrice;

//               return (
//                 <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div>
//                       <div className="text-sm font-medium text-gray-900 dark:text-white">
//                         {holding.symbol}
//                       </div>
//                       <div className="text-sm text-gray-500 dark:text-gray-400">
//                         {holding.name || `${holding.symbol} Inc.`}
//                       </div>
//                     </div>
//                   </td>
                  
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                     {holding.quantity.toLocaleString()}
//                   </td>
                  
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                     {formatCurrency(holding.avgPrice)}
//                   </td>
                  
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center space-x-2">
//                       <div className="text-sm text-gray-900 dark:text-white">
//                         {formatCurrency(currentPrice)}
//                       </div>
//                       {hasRealTimeData && (
//                         <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" title="Live price"></div>
//                       )}
//                     </div>
//                     <div className={`text-xs flex items-center ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
//                       {isPriceUp ? (
//                         <TrendingUp className="h-3 w-3 mr-1" />
//                       ) : (
//                         <TrendingDown className="h-3 w-3 mr-1" />
//                       )}
//                       {formatPercent(changePercent)}
//                     </div>
//                   </td>
                  
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                     {formatCurrency(marketValue)}
//                   </td>
                  
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center space-x-2">
//                       <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                         {formatCurrency(unrealizedPL)}
//                       </div>
//                       {hasRealTimeData && (
//                         <div className={`w-1 h-1 rounded-full animate-pulse ${
//                           isPositive ? 'bg-green-500' : 'bg-red-500'
//                         }`} title="Live P&L"></div>
//                       )}
//                     </div>
//                     <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                       {formatPercent(unrealizedPLPercent)}
//                     </div>
//                   </td>
                  
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => onBuy(holding.symbol)}
//                         className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
//                         title="Buy more"
//                       >
//                         <ShoppingCart className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => onSell(holding.symbol)}
//                         className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
//                         title="Sell"
//                       >
//                         <Minus className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

// };

// export default HoldingsTable;
// HoldingsTable.jsx
import { useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Minus, AlertCircle } from 'lucide-react';

const HoldingsTable = ({ holdings, realTimePrices, onBuy, onSell, onRefresh }) => {
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent) => {
    if (percent === null || percent === undefined) return '0.00%';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle real-time price updates
    if (sortField === 'currentPrice') {
      aValue = realTimePrices[a.symbol]?.price || a.currentPrice || a.avgPrice;
      bValue = realTimePrices[b.symbol]?.price || b.currentPrice || b.avgPrice;
    }

    // Handle market value sorting
    if (sortField === 'marketValue') {
      const aPrice = realTimePrices[a.symbol]?.price || a.currentPrice || a.avgPrice;
      const bPrice = realTimePrices[b.symbol]?.price || b.currentPrice || b.avgPrice;
      aValue = aPrice * a.quantity;
      bValue = bPrice * b.quantity;
    }

    // Handle P&L sorting
    if (sortField === 'unrealizedPL') {
      const aPrice = realTimePrices[a.symbol]?.price || a.currentPrice || a.avgPrice;
      const bPrice = realTimePrices[b.symbol]?.price || b.currentPrice || b.avgPrice;
      aValue = (aPrice - a.avgPrice) * a.quantity;
      bValue = (bPrice - b.avgPrice) * b.quantity;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue === null || aValue === undefined) aValue = 0;
    if (bValue === null || bValue === undefined) bValue = 0;

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Holdings
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No holdings yet</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start building your portfolio by buying your first stock
          </p>
          <button
            onClick={() => onBuy('')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Buy Your First Stock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Holdings ({holdings.length})
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></div>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('symbol')}
              >
                Symbol
                {sortField === 'symbol' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('quantity')}
              >
                Quantity
                {sortField === 'quantity' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('avgPrice')}
              >
                Avg Cost
                {sortField === 'avgPrice' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('currentPrice')}
              >
                Current Price
                {sortField === 'currentPrice' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('marketValue')}
              >
                Market Value
                {sortField === 'marketValue' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('unrealizedPL')}
              >
                P&L
                {sortField === 'unrealizedPL' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedHoldings.map((holding) => {
              const realTimePrice = realTimePrices[holding.symbol];
              const currentPrice = realTimePrice?.price ? parseFloat(realTimePrice.price) : (holding.currentPrice || holding.avgPrice);
              const change = realTimePrice?.change ? parseFloat(realTimePrice.change) : 0;
              const changePercent = realTimePrice?.changePercent ? parseFloat(realTimePrice.changePercent) : 0;
              
              const marketValue = currentPrice * holding.quantity;
              const totalCost = holding.avgPrice * holding.quantity;
              const unrealizedPL = marketValue - totalCost;
              const unrealizedPLPercent = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;
              
              const isPositive = unrealizedPL >= 0;
              const isPriceUp = change >= 0;
              const hasRealTimeData = !!realTimePrice;

              return (
                <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {holding.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {holding.name || `${holding.symbol} Inc.`}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {holding.quantity.toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(holding.avgPrice)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(currentPrice)}
                      </div>
                      {hasRealTimeData && (
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" title="Live price"></div>
                      )}
                    </div>
                    <div className={`text-xs flex items-center ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
                      {isPriceUp ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercent(changePercent)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(marketValue)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(unrealizedPL)}
                      </div>
                      {hasRealTimeData && (
                        <div className={`w-1 h-1 rounded-full animate-pulse ${
                          isPositive ? 'bg-green-500' : 'bg-red-500'
                        }`} title="Live P&L"></div>
                      )}
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(unrealizedPLPercent)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onBuy(holding.symbol)}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Buy more"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onSell(holding.symbol)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Sell"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Portfolio Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-300">Total Invested</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(holdings.reduce((total, holding) => total + (holding.avgPrice * holding.quantity), 0))}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-300">Current Value</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(holdings.reduce((total, holding) => {
                const currentPrice = realTimePrices[holding.symbol]?.price || holding.currentPrice || holding.avgPrice;
                return total + (currentPrice * holding.quantity);
              }, 0))}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-300">Total P&L</div>
            <div className={`font-semibold ${holdings.reduce((total, holding) => {
              const currentPrice = realTimePrices[holding.symbol]?.price || holding.currentPrice || holding.avgPrice;
              return total + ((currentPrice - holding.avgPrice) * holding.quantity);
            }, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(holdings.reduce((total, holding) => {
                const currentPrice = realTimePrices[holding.symbol]?.price || holding.currentPrice || holding.avgPrice;
                return total + ((currentPrice - holding.avgPrice) * holding.quantity);
              }, 0))}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-300">Total Return</div>
            <div className={`font-semibold ${holdings.reduce((total, holding) => {
              const currentPrice = realTimePrices[holding.symbol]?.price || holding.currentPrice || holding.avgPrice;
              const holdingPL = ((currentPrice - holding.avgPrice) * holding.quantity);
              return total + (holding.avgPrice * holding.quantity > 0 ? 
                (holdingPL / (holding.avgPrice * holding.quantity)) * 100 : 0);
            }, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(holdings.reduce((total, holding) => {
                const currentPrice = realTimePrices[holding.symbol]?.price || holding.currentPrice || holding.avgPrice;
                const holdingPL = ((currentPrice - holding.avgPrice) * holding.quantity);
                return total + (holding.avgPrice * holding.quantity > 0 ? 
                  (holdingPL / (holding.avgPrice * holding.quantity)) * 100 : 0);
              }, 0) / Math.max(1, holdings.length))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingsTable;