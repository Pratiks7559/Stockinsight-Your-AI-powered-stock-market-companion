// // components/CompareStocks.jsx
// import { useState } from 'react';

// const CompareStocks = ({ stocks, comparedStocks, setComparedStocks }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedStock, setSelectedStock] = useState('');

//   const addComparison = () => {
//     if (selectedStock && !comparedStocks.some(stock => stock.symbol === selectedStock)) {
//       const stockToAdd = stocks.find(stock => stock.symbol === selectedStock);
//       setComparedStocks(prev => [...prev, stockToAdd]);
//       setSelectedStock('');
//     }
//   };

//   const removeComparison = (symbol) => {
//     setComparedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//         </svg>
//         Compare
//         {comparedStocks.length > 0 && (
//           <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
//             {comparedStocks.length}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 rounded-xl shadow-lg p-4 z-10">
//           <h3 className="font-semibold mb-3">Compare Stocks</h3>
          
//           <div className="flex gap-2 mb-3">
//             <select 
//               value={selectedStock}
//               onChange={(e) => setSelectedStock(e.target.value)}
//               className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select stock</option>
//               {stocks.map(stock => (
//                 <option key={stock.symbol} value={stock.symbol}>
//                   {stock.symbol}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={addComparison}
//               className="px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
//             >
//               Add
//             </button>
//           </div>
          
//           <div className="space-y-2">
//             {comparedStocks.map(stock => (
//               <div key={stock.symbol} className="flex items-center justify-between bg-slate-700 p-2 rounded-lg">
//                 <span>{stock.symbol}</span>
//                 <button
//                   onClick={() => removeComparison(stock.symbol)}
//                   className="text-red-400 hover:text-red-300"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompareStocks;
// frontend/components/CompareStocks.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const CompareStocks = ({ symbols = [], timeRange = '1M', selectedStocksFromSelector = [] }) => {
  const [selectedStocks, setSelectedStocks] = useState(symbols.length > 0 ? symbols : ['AAPL', 'MSFT']);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#EC4899', '#06B6D4'];
  const timeRanges = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];

  // Update selected stocks when props change
  useEffect(() => {
    if (selectedStocksFromSelector.length > 0) {
      setSelectedStocks([...new Set([...selectedStocks, ...selectedStocksFromSelector])]);
    }
  }, [selectedStocksFromSelector]);

  // Update internal timeRange when prop changes
  useEffect(() => {
    setCurrentTimeRange(timeRange);
  }, [timeRange]);

  useEffect(() => {
    if (selectedStocks.length > 0) {
      fetchComparisonData();
      fetchRealTimeData();
    }
    
    const comparisonInterval = setInterval(fetchComparisonData, 60000); // 1 minute
    const realTimeInterval = setInterval(fetchRealTimeData, 15000); // 15 seconds
    
    return () => {
      clearInterval(comparisonInterval);
      clearInterval(realTimeInterval);
    };
  }, [selectedStocks, currentTimeRange]);

  const fetchComparisonData = async () => {
    if (selectedStocks.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/compare?symbols=${selectedStocks.join(',')}&range=${currentTimeRange}`);
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      // Fallback to individual stock data
      await fetchFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    if (selectedStocks.length === 0) return;
    
    try {
      const response = await fetch(`/api/quotes?symbols=${selectedStocks.join(',')}`);
      const data = await response.json();
      
      const realTimeMap = {};
      data.forEach(stock => {
        realTimeMap[stock.symbol] = {
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent
        };
      });
      setRealTimeData(realTimeMap);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const fetchFallbackData = async () => {
    try {
      const promises = selectedStocks.map(symbol => 
        fetch(`/api/history?symbol=${symbol}&range=${currentTimeRange}`).then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const fallbackData = {
        comparison: results.map((data, index) => ({
          symbol: selectedStocks[index],
          data: data.ohlc || [],
          currentPrice: data.ohlc?.[data.ohlc.length - 1]?.close || 0,
          changePercent: 0,
          performance: 0
        }))
      };
      
      setComparisonData(fallbackData);
    } catch (error) {
      console.error('Error fetching fallback data:', error);
    }
  };

  const formatTimeLabel = (dateString) => {
    const date = new Date(dateString);
    
    switch(timeRange) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      case '5D':
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        return isToday ? 
          'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) :
          date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '1M':
      case '3M':
      case '6M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '1Y':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      case '5Y':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const processChartData = () => {
    if (!comparisonData?.comparison) return [];
    
    const maxLength = Math.max(...comparisonData.comparison.map(stock => stock.data.length));
    const chartData = [];
    
    for (let i = 0; i < maxLength; i++) {
      const point = {};
      let hasValidDate = false;
      
      comparisonData.comparison.forEach((stock, stockIndex) => {
        if (stock.data[i]) {
          if (!hasValidDate) {
            point.time = formatTimeLabel(stock.data[i].date);
            point.timestamp = new Date(stock.data[i].date).getTime();
            hasValidDate = true;
          }
          
          // Normalize to percentage change from first price
          const firstPrice = stock.data[0]?.price || stock.data[i].price;
          const currentPrice = stock.data[i].price;
          const percentChange = ((currentPrice - firstPrice) / firstPrice) * 100;
          
          point[stock.symbol] = percentChange;
        }
      });
      
      if (hasValidDate) {
        chartData.push(point);
      }
    }
    
    return chartData.sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = processChartData();

  const addStock = (symbol) => {
    if (selectedStocks.length < 8 && !selectedStocks.includes(symbol)) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };
  
  const removeStock = (symbol) => {
    if (selectedStocks.length > 1) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    }
  };

  const getAvailableStocks = () => {
    // Combine stocks from selector with popular stocks
    const popularStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'ADBE', 'CRM',
      'RELIANCE.NSE', 'TCS.NSE', 'INFY.NSE', 'HDFCBANK.NSE', 'ICICIBANK.NSE'
    ];
    
    return [...new Set([...selectedStocksFromSelector, ...popularStocks])];
  };

  return (
    <section className="py-16 bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">
          📈 Compare Stocks - Real-time Analysis
        </h2>
        
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
          {/* Header with notification */}
          {selectedStocksFromSelector.length > 0 && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  📊 Stocks from Stock Selector automatically added: {selectedStocksFromSelector.join(', ')}
                </span>
              </div>
            </div>
          )}
          
          {/* Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-4">
              <select 
                onChange={(e) => addStock(e.target.value)}
                value=""
                className="bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Add Stock to Compare</option>
                {getAvailableStocks().filter(stock => !selectedStocks.includes(stock)).map(stock => (
                  <option key={stock} value={stock}>{stock}</option>
                ))}
              </select>
              
              <div className="flex flex-wrap gap-2">
                {selectedStocks.map((stock, index) => (
                  <div key={stock} className="flex items-center bg-slate-700 rounded-lg px-3 py-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-white mr-2">{stock}</span>
                    {selectedStocks.length > 1 && (
                      <button 
                        onClick={() => removeStock(stock)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {timeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => setCurrentTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm ${currentTimeRange === range ? 'bg-green-500 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Performance Summary */}
          {comparisonData?.comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {comparisonData.comparison.map((stock, index) => (
                <div key={stock.symbol} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <h4 className="font-semibold text-white">{stock.symbol}</h4>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${realTimeData[stock.symbol]?.price?.toFixed(2) || stock.currentPrice?.toFixed(2) || 'N/A'}
                  </p>
                  <p className={`text-sm ${(realTimeData[stock.symbol]?.changePercent || stock.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(realTimeData[stock.symbol]?.changePercent || stock.changePercent || 0) >= 0 ? '+' : ''}
                    {(realTimeData[stock.symbol]?.changePercent || stock.changePercent || 0).toFixed(2)}% 
                    ({stock.performance || 0}% {currentTimeRange})
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Chart */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-white">Normalized Performance Comparison (%)</h3>
      
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                    formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
                  />
                  <Legend />
                  {selectedStocks.map((symbol, index) => (
                    <Line
                      key={symbol}
                      type="monotone"
                      dataKey={symbol}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-400">
                Select stocks to compare
              </div>
            )}
          </div>
          
          {/* Update Info */}
          <div className="mt-4 text-center text-gray-400 text-sm">
            <div className="flex justify-center items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time updates • Last updated: {new Date().toLocaleString()}
            </div>
            <div className="mt-1 text-xs">
              Showing {selectedStocks.length} stocks • Chart updates every minute • Prices update every 15 seconds
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompareStocks;