// // components/CandlestickChartView.jsx
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const CandlestickChartView = ({ selectedStock, timeRange, indicators }) => {
//   // Generate OHLC data for candlestick chart
//   const generateCandlestickData = () => {
//     const points = timeRange === '1D' ? 24 : 
//                   timeRange === '5D' ? 40 : 
//                   timeRange === '1M' ? 30 : 
//                   timeRange === '6M' ? 26 : 52;
    
//     return Array.from({ length: points }, (_, i) => {
//       const baseValue = 150 + Math.random() * 50;
//       const volatility = 2 + Math.random() * 3;
      
//       const open = baseValue;
//       const high = open + (Math.random() * volatility);
//       const low = open - (Math.random() * volatility);
//       const close = low + (Math.random() * (high - low));
      
//       const date = new Date();
//       if (timeRange === '1D') {
//         date.setHours(date.getHours() - (points - i));
//       } else {
//         date.setDate(date.getDate() - (points - i));
//       }
      
//       return {
//         name: timeRange === '1D' ? date.toLocaleTimeString() : date.toLocaleDateString(),
//         open,
//         high,
//         low,
//         close,
//         ma20: baseValue * (0.98 + Math.random() * 0.04),
//         ma50: baseValue * (0.97 + Math.random() * 0.06),
//         ma200: baseValue * (0.95 + Math.random() * 0.1)
//       };
//     });
//   };

//   const data = generateCandlestickData();
//   const latestClose = data[data.length - 1]?.close || 0;
//   const previousClose = data[0]?.close || 0;
//   const change = ((latestClose - previousClose) / previousClose) * 100;

//   // Custom tooltip for candlestick data
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
//           <p className="text-gray-400">{data.name}</p>
//           <p className="text-sm">Open: <span className="text-blue-400">${data.open.toFixed(2)}</span></p>
//           <p className="text-sm">High: <span className="text-green-400">${data.high.toFixed(2)}</span></p>
//           <p className="text-sm">Low: <span className="text-red-400">${data.low.toFixed(2)}</span></p>
//           <p className="text-sm">Close: <span className="text-blue-400">${data.close.toFixed(2)}</span></p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h2 className="text-xl font-bold">{selectedStock}</h2>
//           <p className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
//             ${latestClose.toFixed(2)} {change >= 0 ? '+' : ''}{change.toFixed(2)}%
//           </p>
//         </div>
//         <div className="text-gray-400 text-sm">
//           {timeRange} • {new Date().toLocaleDateString()}
//         </div>
//       </div>
      
//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//             <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
//             <YAxis domain={['auto', 'auto']} tick={{ fill: '#9ca3af', fontSize: 12 }} />
//             <Tooltip content={<CustomTooltip />} />
            
//             {/* Candlestick representation using lines */}
//             {data.map((entry, index) => (
//               <g key={`candle-${index}`}>
//                 {/* High-Low line */}
//                 <line
//                   x1={index * (100 / data.length) + 5}
//                   y1={entry.high}
//                   x2={index * (100 / data.length) + 5}
//                   y2={entry.low}
//                   stroke={entry.close >= entry.open ? '#10b981' : '#ef4444'}
//                   strokeWidth={1}
//                 />
//                 {/* Open-Close box */}
//                 <rect
//                   x={index * (100 / data.length) + 2.5}
//                   y={entry.close >= entry.open ? entry.open : entry.close}
//                   width={5}
//                   height={Math.abs(entry.close - entry.open)}
//                   fill={entry.close >= entry.open ? '#10b981' : '#ef4444'}
//                 />
//               </g>
//             ))}
            
//             {/* Indicator lines */}
//             {indicators.ma20 && (
//               <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="MA 20" />
//             )}
//             {indicators.ma50 && (
//               <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="MA 50" />
//             )}
//             {indicators.ma200 && (
//               <Line type="monotone" dataKey="ma200" stroke="#ec4899" strokeWidth={1.5} dot={false} name="MA 200" />
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default CandlestickChartView;
// frontend/components/CandlestickChartView.jsx
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CandlestickChartView = ({ data, height = 300 }) => {
  const [showBollinger, setShowBollinger] = useState(false);
  const [liveData, setLiveData] = useState(data || []);
  const [isLive, setIsLive] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setLiveData(data);
    }
  }, [data]);

  // WebSocket connection for real-time candlestick updates
  useEffect(() => {
    if (!isLive) return;

    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('Candlestick WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        if (update.type === 'chart_update') {
          setLiveData(prevData => {
            const newData = [...prevData];
            if (newData.length > 0) {
              // Update last candlestick with WebSocket OHLC data
              newData[newData.length - 1] = {
                ...newData[newData.length - 1],
                ...update.ohlc
              };
            }
            // Force component re-render
            setUpdateTrigger(prev => prev + 1);
            return newData;
          });
        }
      } catch (error) {
        console.error('Candlestick WebSocket error:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('Candlestick WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [isLive]);

  // Simple Bollinger Bands calculation (for demonstration)
  const calculateBollingerBands = () => {
    const period = 20;
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, upper: null, lower: null, middle: null };
      
      const slice = data.slice(index - period + 1, index + 1);
      const sum = slice.reduce((acc, val) => acc + val.c, 0);
      const middle = sum / period;
      
      const squaredDiffs = slice.reduce((acc, val) => acc + Math.pow(val.c - middle, 2), 0);
      const stdDev = Math.sqrt(squaredDiffs / period);
      
      return {
        ...item,
        upper: middle + (2 * stdDev),
        lower: middle - (2 * stdDev),
        middle: middle
      };
    });
  };

  const chartData = showBollinger ? calculateBollingerBands() : liveData;
  
  // Force re-render key
  const chartKey = `candlestick-${updateTrigger}-${liveData.length}-${liveData[liveData.length - 1]?.c || 0}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-3 py-1 rounded text-sm ${
              showBollinger ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            Bollinger Bands
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-gray-400">WebSocket</span>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded text-sm ${
              isLive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} key={chartKey}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="t" 
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            stroke="#6B7280"
          />
          <YAxis 
            domain={['auto', 'auto']}
            stroke="#6B7280"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value, name) => {
              if (name === 'price') return [value.toFixed(2), 'Price'];
              if (name === 'upper') return [value.toFixed(2), 'Upper Band'];
              if (name === 'lower') return [value.toFixed(2), 'Lower Band'];
              if (name === 'middle') return [value.toFixed(2), 'Middle Band'];
              return [value.toFixed(2), name];
            }}
          />
          {/* Candlestick would need a specialized component, using line for now */}
          <Line 
            type="monotone" 
            dataKey="c" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            name="price"
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
          {showBollinger && (
            <>
              <Line 
                type="monotone" 
                dataKey="upper" 
                stroke="#10B981" 
                strokeWidth={1}
                dot={false}
                name="upper"
              />
              <Line 
                type="monotone" 
                dataKey="middle" 
                stroke="#F59E0B" 
                strokeWidth={1}
                dot={false}
                name="middle"
              />
              <Line 
                type="monotone" 
                dataKey="lower" 
                stroke="#EF4444" 
                strokeWidth={1}
                dot={false}
                name="lower"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChartView;