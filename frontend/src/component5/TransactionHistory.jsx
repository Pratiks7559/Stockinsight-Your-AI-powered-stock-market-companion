// components/TransactionHistory.jsx
import { useState } from 'react';

const TransactionHistory = ({ transactions, darkMode }) => {
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'buy', label: 'Buys' },
    { key: 'sell', label: 'Sells' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'buy') return transaction.type === 'Buy';
    if (filter === 'sell') return transaction.type === 'Sell';
    // For time-based filters, we would filter by date in a real app
    return true;
  });

  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300">
          Export CSV
        </button>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-lg whitespace-nowrap ${
              filter === key 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                : darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${darkMode ? 'bg-slate-700' : 'bg-gray-100'} text-left`}>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Symbol</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-700">
                <td className="p-3">{transaction.date}</td>
                <td className={`p-3 font-semibold ${transaction.type === 'Buy' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.type}
                </td>
                <td className="p-3 font-semibold">{transaction.symbol}</td>
                <td className="p-3">{transaction.quantity}</td>
                <td className="p-3">${transaction.price.toFixed(2)}</td>
                <td className="p-3">${transaction.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;