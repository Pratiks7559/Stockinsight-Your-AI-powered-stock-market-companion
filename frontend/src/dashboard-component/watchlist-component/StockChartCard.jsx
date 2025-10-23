// frontend/src/components/StockChartCard.jsx
import { useState, useEffect } from 'react';
import { fetchStockChartData } from './api';

const StockChartCard = ({ symbol }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1D');

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockChartData(symbol, timeframe);
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [symbol, timeframe]);

  // Simplified chart rendering - in a real app, you'd use a charting library like Recharts
  const renderChart = () => {
    if (!chartData || !chartData.values) return null;
    
    const values = chartData.values.slice(-20); // Show last 20 data points
    const maxPrice = Math.max(...values.map(v => v.high));
    const minPrice = Math.min(...values.map(v => v.low));
    
    return (
      <div className="h-48 relative bg-gray-50 dark:bg-slate-700 rounded border">
        <div className="absolute inset-0 flex items-center p-2">
          {values.map((value, index) => {
            const height = ((value.close - minPrice) / (maxPrice - minPrice)) * 100;
            const color = value.close >= value.open ? 'bg-green-500' : 'bg-red-500';
            
            return (
              <div
                key={index}
                className={`flex-1 mx-0.5 ${color} rounded-t opacity-80`}
                style={{ height: `${height}%` }}
                title={`$${value.close.toFixed(2)}`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{symbol} Chart</h3>
        <div className="flex space-x-2">
          {['1D', '1W', '1M', '3M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        renderChart()
      )}

      {chartData && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              ${chartData.values[chartData.values.length - 1]?.open.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">High</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              ${chartData.values[chartData.values.length - 1]?.high.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Low</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              ${chartData.values[chartData.values.length - 1]?.low.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Volume</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {chartData.values[chartData.values.length - 1]?.volume.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockChartCard;