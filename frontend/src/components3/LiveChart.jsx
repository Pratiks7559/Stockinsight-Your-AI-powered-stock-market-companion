import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LiveChart = ({ symbol, height = 400 }) => {
  const [chartData, setChartData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize with some base data
    const basePrice = 100 + Math.random() * 500;
    const initialData = Array.from({ length: 50 }, (_, i) => ({
      time: Date.now() - (50 - i) * 60000,
      price: basePrice + (Math.random() - 0.5) * 20,
      id: i
    }));
    setChartData(initialData);

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Live chart connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        if (update.type === 'chart_update' && update.symbol === symbol) {
          setChartData(prevData => {
            const newData = [...prevData];
            
            // Update last point
            if (newData.length > 0) {
              newData[newData.length - 1] = {
                time: update.timestamp,
                price: update.ohlc.c,
                id: Date.now()
              };
            }
            
            return newData;
          });
        }
      } catch (error) {
        console.error('Live chart error:', error);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-400">Live Chart - {symbol}</span>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            stroke="#6B7280"
          />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            labelFormatter={(time) => new Date(time).toLocaleString()}
            formatter={(value) => [value.toFixed(2), 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveChart;