// TransactionHistory.jsx
import { useState } from 'react';
import { Download, Filter, Info, TrendingUp, TrendingDown } from 'lucide-react';

const TransactionHistory = ({ transactions, onRefresh }) => {
  const [filter, setFilter] = useState('ALL');
  const [sortField, setSortField] = useState('executedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(3)}%`;
  };

  // Get execution details from transaction
  const getExecutionDetails = (transaction) => {
    const details = {
      executionPrice: transaction.price,
      marketPrice: transaction.marketPrice || transaction.price,
      slippage: 0,
      slippageCost: 0,
      hasSlippage: false,
      executionNote: transaction.executionNote || ''
    };
    
    // Calculate slippage if both prices available
    if (transaction.marketPrice && transaction.price && transaction.marketPrice !== transaction.price) {
      details.slippage = ((transaction.price - transaction.marketPrice) / transaction.marketPrice) * 100;
      details.slippageCost = Math.abs(transaction.price - transaction.marketPrice) * transaction.quantity;
      details.hasSlippage = Math.abs(details.slippage) > 0.01; // Show if slippage > 0.01%
    }
    
    return details;
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'ALL') return true;
    return tx.type === filter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'executedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Symbol', 'Quantity', 'Price', 'Total', 'Mode', 'Status'];
    const csvData = [
      headers.join(','),
      ...sortedTransactions.map(tx => [
        formatDate(tx.executedAt),
        tx.type,
        tx.symbol,
        tx.quantity,
        tx.price,
        tx.quantity * tx.price,
        tx.mode,
        tx.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Transaction History
          </h2>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Execution Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Execution Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTransactions.map((transaction) => {
              const executionDetails = getExecutionDetails(transaction);
              
              return (
                <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(transaction.executedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'BUY' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.quantity.toLocaleString()}
                  </td>
                  
                  {/* Enhanced Execution Price Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(executionDetails.executionPrice)}
                      </div>
                      {executionDetails.hasSlippage && (
                        <div className="flex items-center text-xs">
                          {executionDetails.slippage > 0 ? (
                            <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                          )}
                          <span className={executionDetails.slippage > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatPercent(Math.abs(executionDetails.slippage))}
                          </span>
                        </div>
                      )}
                      {transaction.marketPrice && transaction.marketPrice !== transaction.price && (
                        <div className="text-xs text-gray-500">
                          Market: {formatCurrency(transaction.marketPrice)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Total Column with slippage cost */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.quantity * transaction.price)}
                      </div>
                      {executionDetails.hasSlippage && executionDetails.slippageCost > 0 && (
                        <div className="text-xs text-gray-500">
                          Slippage: {formatCurrency(executionDetails.slippageCost)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Execution Details Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {/* Mode Badge */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                        transaction.mode === 'SIMULATION'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {transaction.mode || 'SIMULATION'}
                      </span>
                      
                      {/* Live Price Indicator */}
                      {transaction.executionNote && transaction.executionNote.includes('live') && (
                        <div className="flex items-center text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                          Live Price
                        </div>
                      )}
                      
                      {/* Execution Method */}
                      {executionDetails.hasSlippage ? (
                        <div className="text-xs text-orange-600">
                          Market Order
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          Instant Fill
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Status Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                        transaction.status === 'EXECUTED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {transaction.status}
                      </span>
                      
                      {/* Execution Time Details */}
                      {transaction.status === 'EXECUTED' && (
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.executedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;