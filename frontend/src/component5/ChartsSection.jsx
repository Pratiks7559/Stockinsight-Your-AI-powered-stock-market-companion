// components/ChartsSection.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const ChartsSection = ({ holdings, selectedTimeframe, setSelectedTimeframe, darkMode, portfolioHistory }) => {
  // Calculate sector allocation
  const sectorAllocation = holdings.reduce((acc, holding) => {
    const value = holding.quantity * holding.currentPrice;
    if (!acc[holding.sector]) {
      acc[holding.sector] = 0;
    }
    acc[holding.sector] += value;
    return acc;
  }, {});

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'All'];

  // Mock benchmark data
  const benchmarkData = {
    nifty: 12.5,
    sensex: 10.8,
    nasdaq: 15.2,
    portfolio: 18.7
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Portfolio Analytics</h2>
        <div className="flex space-x-2">
          {timeframes.map(timeframe => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg ${
                selectedTimeframe === timeframe 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                  : darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Growth Chart */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h3 className="font-semibold mb-4">Portfolio Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#4A5568" : "#E2E8F0"} />
                <XAxis dataKey="time" stroke={darkMode ? "#A0AEC0" : "#718096"} fontSize={12} />
                <YAxis stroke={darkMode ? "#A0AEC0" : "#718096"} fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
                    borderColor: darkMode ? '#4A5568' : '#E2E8F0'
                  }}
                  labelStyle={{ color: darkMode ? '#FFFFFF' : '#000000' }}
                  formatter={(value) => [formatCurrency(value), "Value"]}
                />
                <Line type="monotone" dataKey="value" stroke="#48BB78" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h3 className="font-semibold mb-4">Sector Allocation</h3>
          <div className="space-y-3">
            {Object.entries(sectorAllocation).map(([sector, value], index) => {
              const totalValue = Object.values(sectorAllocation).reduce((sum, val) => sum + val, 0);
              const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
              
              return (
                <div key={sector} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{sector}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="mt-6">
        <h3 className="font-semibold mb-4">Benchmark Comparison</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(benchmarkData).map(([benchmark, value]) => (
            <div key={benchmark} className={`p-4 rounded-lg text-center ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className="text-sm capitalize">{benchmark}</p>
              <p className={`text-lg font-bold ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {value >= 0 ? '+' : ''}{value}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;