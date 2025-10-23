import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ComparisonCard from './UI/ComparisonCard';

const Compare = () => {
  const [symbols, setSymbols] = useState(['AAPL', 'GOOGL']);
  const [inputSymbol, setInputSymbol] = useState('');
  const [range, setRange] = useState('1M');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    if (symbols.length > 0) fetchData();
  }, [symbols, range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/compare?symbols=${symbols.join(',')}&range=${range}`);
      const result = await response.json();
      
      // Normalize data for chart
      const chartData = normalizeData(result.comparison);
      setData({ ...result, chartData });
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeData = (comparison) => {
    if (!comparison.length) return [];
    
    const maxLength = Math.max(...comparison.map(stock => stock.data.length));
    const chartData = [];

    for (let i = 0; i < maxLength; i++) {
      const dataPoint = { date: '' };
      
      comparison.forEach((stock, index) => {
        if (stock.data[i]) {
          dataPoint.date = stock.data[i].date;
          const basePrice = stock.data[0]?.price || 1;
          dataPoint[stock.symbol] = ((stock.data[i].price / basePrice - 1) * 100).toFixed(2);
        }
      });
      
      if (dataPoint.date) chartData.push(dataPoint);
    }
    
    return chartData;
  };

  const addSymbol = () => {
    if (inputSymbol && !symbols.includes(inputSymbol.toUpperCase()) && symbols.length < 4) {
      setSymbols([...symbols, inputSymbol.toUpperCase()]);
      setInputSymbol('');
    }
  };

  const removeSymbol = (symbol) => {
    setSymbols(symbols.filter(s => s !== symbol));
  };

  return (
    <div className="space-y-6">
      <ComparisonCard title="Stock Comparison">

        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Enter symbol (e.g., TSLA)"
              className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
            />
            <button
              onClick={addSymbol}
              disabled={symbols.length >= 4}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
          >
            <option value="1D">1 Day</option>
            <option value="5D">5 Days</option>
            <option value="1M">1 Month</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
          </select>
        </div>

        {/* Symbol Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {symbols.map((symbol, index) => (
            <span
              key={symbol}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: colors[index] + '20', color: colors[index] }}
            >
              {symbol}
              <button
                onClick={() => removeSymbol(symbol)}
                className="hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Chart */}
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-gray-400">Loading comparison data...</div>
          </div>
        ) : data?.chartData ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend />
                {symbols.map((symbol, index) => (
                  <Line
                    key={symbol}
                    type="monotone"
                    dataKey={symbol}
                    stroke={colors[index]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-gray-400">Add symbols to compare stocks</div>
          </div>
        )}
      </ComparisonCard>

      {/* Comparison Table */}
      {data?.comparison && (
        <ComparisonCard title="Performance Summary">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-gray-300">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-300">Name</th>
                  <th className="text-right py-3 px-4 text-gray-300">Price</th>
                  <th className="text-right py-3 px-4 text-gray-300">Change</th>
                  <th className="text-right py-3 px-4 text-gray-300">Change %</th>
                  <th className="text-right py-3 px-4 text-gray-300">{range} Performance</th>
                </tr>
              </thead>
              <tbody>
                {data.comparison.map((stock, index) => (
                  <tr key={stock.symbol} className="border-b border-slate-700">
                    <td className="py-3 px-4">
                      <span
                        className="font-medium"
                        style={{ color: colors[index] }}
                      >
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{stock.name}</td>
                    <td className="py-3 px-4 text-right text-white">${stock.currentPrice.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${parseFloat(stock.performance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(stock.performance) >= 0 ? '+' : ''}{stock.performance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComparisonCard>
      )}
    </div>
  );
};

export default Compare;