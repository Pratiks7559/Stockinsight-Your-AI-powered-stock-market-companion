// // components/LineChartView.jsx
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// const LineChartView = ({ selectedStock, timeRange, comparedStocks, indicators }) => {
//   // Generate dummy data based on time range
//   const generateData = () => {
//     const points = timeRange === '1D' ? 24 : 
//                   timeRange === '5D' ? 40 : 
//                   timeRange === '1M' ? 30 : 
//                   timeRange === '6M' ? 26 : 52;
    
//     return Array.from({ length: points }, (_, i) => {
//       const baseValue = 150 + Math.random() * 50;
//       const date = new Date();
      
//       // Adjust date based on time range
//       if (timeRange === '1D') {
//         date.setHours(date.getHours() - (points - i));
//       } else {
//         date.setDate(date.getDate() - (points - i));
//       }
      
//       return {
//         name: timeRange === '1D' ? date.toLocaleTimeString() : date.toLocaleDateString(),
//         price: baseValue,
//         ma20: baseValue * (0.98 + Math.random() * 0.04),
//         ma50: baseValue * (0.97 + Math.random() * 0.06),
//         ma200: baseValue * (0.95 + Math.random() * 0.1),
//         comparison: baseValue * (0.99 + Math.random() * 0.02)
//       };
//     });
//   };

//   const data = generateData();
//   const latestPrice = data[data.length - 1]?.price || 0;
//   const previousPrice = data[0]?.price || 0;
//   const change = ((latestPrice - previousPrice) / previousPrice) * 100;

//   return (
//     <div>
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h2 className="text-xl font-bold">{selectedStock}</h2>
//           <p className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
//             ${latestPrice.toFixed(2)} {change >= 0 ? '+' : ''}{change.toFixed(2)}%
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
//             <Tooltip 
//               contentStyle={{ 
//                 backgroundColor: '#1e293b', 
//                 border: '1px solid #334155',
//                 borderRadius: '0.5rem'
//               }}
//               formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
//             />
//             <Legend />
//             <Line 
//               type="monotone" 
//               dataKey="price" 
//               stroke="#3b82f6" 
//               strokeWidth={2} 
//               dot={false} 
//               activeDot={{ r: 6 }} 
//             />
            
//             {/* Comparison lines */}
//             {comparedStocks.map((stock, index) => {
//               const colors = ['#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];
//               return (
//                 <Line 
//                   key={stock.symbol}
//                   type="monotone" 
//                   dataKey="comparison" 
//                   stroke={colors[index % colors.length]}
//                   strokeWidth={2} 
//                   dot={false} 
//                   name={stock.symbol}
//                 />
//               );
//             })}
            
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

// export default LineChartView;
// frontend/components/LineChartView.jsx
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChartView = ({ data, height = 300 }) => {
  const [showMA20, setShowMA20] = useState(false);
  const [showMA50, setShowMA50] = useState(false);
  const [showMA200, setShowMA200] = useState(false);
  const [liveData, setLiveData] = useState(data || []);
  const [isLive, setIsLive] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const intervalRef = useRef(null);

  // Update live data when new data comes
  useEffect(() => {
    if (data && data.length > 0) {
      setLiveData(data);
    }
  }, [data]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isLive) return;

    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('Chart WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        if (update.type === 'chart_update') {
          setLiveData(prevData => {
            if (!prevData || prevData.length === 0) return prevData;
            
            const newData = [...prevData];
            const lastIndex = newData.length - 1;
            
            // Force update last point to trigger re-render
            newData[lastIndex] = {
              ...newData[lastIndex],
              c: update.ohlc.c,
              h: Math.max(newData[lastIndex].h || update.ohlc.c, update.ohlc.c),
              l: Math.min(newData[lastIndex].l || update.ohlc.c, update.ohlc.c),
              t: update.ohlc.t
            };
            
            console.log('Chart updated:', update.ohlc.c);
            return newData;
          });
          
          // Force re-render after state update
          setTimeout(() => {
            setUpdateTrigger(prev => prev + 1);
          }, 0);
        }
      } catch (error) {
        console.error('Chart WebSocket error:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('Chart WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [isLive]);

  const calculateMA = (period) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, ma: null };
      
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + val.c, 0);
      
      return { ...item, ma: sum / period };
    });
  };

  const chartData = showMA20 || showMA50 || showMA200 ? calculateMA(showMA200 ? 200 : showMA50 ? 50 : 20) : liveData;
  
  // Force re-render key
  const chartKey = `line-${updateTrigger}-${liveData.length}-${liveData[liveData.length - 1]?.c || 0}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowMA20(!showMA20)}
            className={`px-3 py-1 rounded text-sm ${
              showMA20 ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            MA20
          </button>
        <button
          onClick={() => setShowMA50(!showMA50)}
          className={`px-3 py-1 rounded text-sm ${
            showMA50 ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          MA50
        </button>
        <button
          onClick={() => setShowMA200(!showMA200)}
          className={`px-3 py-1 rounded text-sm ${
            showMA200 ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          MA200
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

      <ResponsiveContainer width="100%" height={height} key={`container-${updateTrigger}`}>
        <LineChart data={[...chartData]} key={chartKey}>
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
            formatter={(value) => [value.toFixed(2), 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="c" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={300}
            animationEasing="ease-out"
          />
          {showMA20 && (
            <Line 
              type="monotone" 
              dataKey="ma" 
              stroke="#10B981" 
              strokeWidth={1.5}
              dot={false}
            />
          )}
          {showMA50 && (
            <Line 
              type="monotone" 
              dataKey="ma" 
              stroke="#F59E0B" 
              strokeWidth={1.5}
              dot={false}
            />
          )}
          {showMA200 && (
            <Line 
              type="monotone" 
              dataKey="ma" 
              stroke="#EF4444" 
              strokeWidth={1.5}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartView;