// components/markets/StockChart.jsx
import { useState } from 'react';

const StockChart = ({ selectedStock, timeRange, setTimeRange }) => {
  const timeRanges = ['1D', '5D', '1M', '6M', '1Y'];
  
  // Generate dummy chart data based on time range
  const generateChartData = () => {
    const points = timeRange === '1D' ? 24 : 
                  timeRange === '5D' ? 40 : 
                  timeRange === '1M' ? 30 : 
                  timeRange === '6M' ? 26 : 52;
    
    return Array.from({ length: points }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 200,
      time: i,
    }));
  };

  const chartData = generateChartData();
  const chartType = 'line'; // Can be 'line' or 'candle'

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">{selectedStock} Chart</h2>
        
        <div className="flex space-x-2">
          {timeRanges.map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg ${
                timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="h-80 bg-slate-900 rounded-lg p-4">
        {/* Simple chart simulation */}
        <div className="h-full flex items-end space-x-px">
          {chartData.map((data, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-700 rounded-t"
              style={{ height: `${(data.value - 200) / 100 * 100}%` }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Chart Info */}
      <div className="mt-6 flex flex-wrap justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">$175.43</h3>
          <p className={chartData[chartData.length - 1].value > chartData[0].value ? 'text-green-500' : 'text-red-500'}>
            +2.3% ($3.95)
          </p>
        </div>
        <div className="text-gray-400">
          As of {new Date().toLocaleTimeString()} • {selectedStock} • {timeRange}
        </div>
      </div>
    </div>
  );
};

export default StockChart;