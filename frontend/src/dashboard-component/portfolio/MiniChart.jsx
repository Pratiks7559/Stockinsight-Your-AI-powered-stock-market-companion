// MiniChart.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const MiniChart = ({ symbol, currentPrice }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [symbol]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      // Mock data - in production, fetch from API
      const mockData = generateMockData(currentPrice);
      setChartData(mockData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (basePrice) => {
    const data = [];
    const price = typeof basePrice === 'number' ? basePrice : 100;
    
    for (let i = 0; i < 30; i++) {
      const variation = price * 0.02 * Math.sin(i * 0.2) + (Math.random() - 0.5) * price * 0.01;
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: price + variation
      });
    }
    
    return data;
  };

  const isPositive = chartData.length > 1 && 
    chartData[chartData.length - 1].price > chartData[0].price;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {symbol}
        </h3>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          30D
        </div>
      </div>
      
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Current: ${typeof currentPrice === 'number' ? currentPrice.toFixed(2) : typeof currentPrice === 'string' && !isNaN(parseFloat(currentPrice)) ? parseFloat(currentPrice).toFixed(2) : '155.43'}
      </div>
    </div>
  );
};

export default MiniChart;