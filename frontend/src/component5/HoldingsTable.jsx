// components/HoldingsTable.jsx
import { useState } from 'react';

const HoldingsTable = ({ holdings, darkMode }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Holdings</h2>
        <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300">
          Add Holding
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${darkMode ? 'bg-slate-700' : 'bg-gray-100'} text-left`}>
              <th 
                className="p-3 cursor-pointer" 
                onClick={() => handleSort('symbol')}
              >
                Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="p-3">Name</th>
              <th 
                className="p-3 cursor-pointer" 
                onClick={() => handleSort('quantity')}
              >
                Qty {sortConfig.key === 'quantity' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                className="p-3 cursor-pointer" 
                onClick={() => handleSort('currentPrice')}
              >
                Current Price {sortConfig.key === 'currentPrice' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                className="p-3 cursor-pointer" 
                onClick={() => handleSort('avgCost')}
              >
                Avg Cost {sortConfig.key === 'avgCost' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                className="p-3 cursor-pointer" 
                onClick={() => handleSort('changePercent')}
              >
                P/L % {sortConfig.key === 'changePercent' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((holding) => (
              <tr key={holding.id} className="border-b border-gray-700">
                <td className="p-3 font-semibold">{holding.symbol}</td>
                <td className="p-3">{holding.name}</td>
                <td className="p-3">{holding.quantity}</td>
                <td className="p-3">${holding.currentPrice.toFixed(2)}</td>
                <td className="p-3">${holding.avgCost.toFixed(2)}</td>
                <td className={`p-3 ${holding.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                </td>
                <td className="p-3">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;