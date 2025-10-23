// // components/ChartsPage.jsx
// import { useState } from 'react';
// import StockSelector from './StockSelector';
// import TimeRangeFilter from './TimeRangeFilter';
// import LineChartView from './LineChartView';
// import CandlestickChartView from './CandlestickChartView';
// import IndicatorsPanel from './IndicatorsPanel';
// import VolumeChart from './VolumeChart';
// import CompareStocks from './CompareStocks';
// import InsightsPanel from './InsightsPanel';

// const ChartsPage = () => {
//   const [selectedStock, setSelectedStock] = useState('AAPL');
//   const [timeRange, setTimeRange] = useState('1M');
//   const [chartType, setChartType] = useState('line');
//   const [comparedStocks, setComparedStocks] = useState([]);
//   const [indicators, setIndicators] = useState({
//     ma20: false,
//     ma50: false,
//     ma200: false,
//     rsi: false,
//     macd: false,
//     bollinger: false
//   });

//   const stocks = [
//     { symbol: 'AAPL', name: 'Apple Inc.' },
//     { symbol: 'MSFT', name: 'Microsoft Corp.' },
//     { symbol: 'GOOGL', name: 'Alphabet Inc.' },
//     { symbol: 'AMZN', name: 'Amazon.com Inc.' },
//     { symbol: 'TSLA', name: 'Tesla Inc.' },
//     { symbol: 'RELIANCE', name: 'Reliance Industries' },
//     { symbol: 'INFY', name: 'Infosys Ltd.' },
//     { symbol: 'TCS', name: 'Tata Consultancy Services' },
//     { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' }
//   ];

//   return (
//     <div className="min-h-screen bg-slate-900 text-gray-100 p-4 md:p-6">
//       <div className="container mx-auto">
//         <header className="mb-6">
//           <h1 className="text-3xl font-bold">Advanced Stock Charts</h1>
//           <p className="text-gray-400">Interactive charts with technical indicators</p>
//         </header>

//         {/* Controls Section */}
//         <div className="bg-slate-800 rounded-xl shadow-lg p-4 mb-6">
//           <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
//             <StockSelector 
//               stocks={stocks}
//               selectedStock={selectedStock}
//               setSelectedStock={setSelectedStock}
//             />
            
//             <TimeRangeFilter 
//               timeRange={timeRange}
//               setTimeRange={setTimeRange}
//             />
            
//             <div className="flex gap-2">
//               {['line', 'candlestick'].map(type => (
//                 <button
//                   key={type}
//                   onClick={() => setChartType(type)}
//                   className={`px-4 py-2 rounded-lg capitalize ${
//                     chartType === type 
//                       ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
//                       : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
//                   }`}
//                 >
//                   {type}
//                 </button>
//               ))}
//             </div>
            
//             <CompareStocks 
//               stocks={stocks}
//               comparedStocks={comparedStocks}
//               setComparedStocks={setComparedStocks}
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Chart Area */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Chart Display */}
//             <div className="bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
//               {chartType === 'line' ? (
//                 <LineChartView 
//                   selectedStock={selectedStock}
//                   timeRange={timeRange}
//                   comparedStocks={comparedStocks}
//                   indicators={indicators}
//                 />
//               ) : (
//                 <CandlestickChartView 
//                   selectedStock={selectedStock}
//                   timeRange={timeRange}
//                   indicators={indicators}
//                 />
//               )}
//             </div>

//             {/* Volume Chart */}
//             <VolumeChart 
//               selectedStock={selectedStock}
//               timeRange={timeRange}
//             />

//             {/* Indicators Panel */}
//             <IndicatorsPanel 
//               indicators={indicators}
//               setIndicators={setIndicators}
//             />
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <InsightsPanel 
//               selectedStock={selectedStock}
//               timeRange={timeRange}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChartsPage;
// frontend/components/ChartsPage.jsx
import { useState, useEffect } from 'react';
import StockSelector from './StockSelector';
import TimeRangeFilter from './TimeRangeFilter';
import LineChartView from './LineChartView';
import CandlestickChartView from './CandlestickChartView';
import LiveChart from './LiveChart';
import VolumeChart from './VolumeChart';
import IndicatorsPanel from './IndicatorsPanel';
import CompareStocks from './CompareStocks';
import InsightsPanel from './InsightsPanel';


const ChartsPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1M');
  const [chartData, setChartData] = useState(null);
  const [compareSymbols, setCompareSymbols] = useState([]);
  const [chartType, setChartType] = useState('candlestick');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());



  useEffect(() => {
    fetchChartData();
  }, [selectedSymbol, timeRange]);

  // Update current time every minute and refresh chart data every 5 minutes
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    const dataTimer = setInterval(() => {
      fetchChartData();
    }, 300000); // 5 minutes
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(dataTimer);
    };
  }, [selectedSymbol, timeRange]);



  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/history?symbol=${selectedSymbol}&range=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching chart data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Left Panel */}
          <div className="lg:w-1/4 space-y-6">
            <StockSelector
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
              compareSymbols={compareSymbols}
              onCompareSymbolsChange={setCompareSymbols}
            />
            
            <TimeRangeFilter
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
            />

            <IndicatorsPanel data={chartData?.ohlc || []} />
          </div>

          {/* Main Chart Area */}
          <div className="lg:w-3/4 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedSymbol} - {timeRange}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Last updated: {currentTime.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-4 py-2 rounded-lg ${
                      chartType === 'line' 
                        ? 'bg-blue-500' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('candlestick')}
                    className={`px-4 py-2 rounded-lg ${
                      chartType === 'candlestick' 
                        ? 'bg-blue-500' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    Candlestick
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
                  <p className="text-red-200">{error}</p>
                  <button
                    onClick={fetchChartData}
                    className="mt-2 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !error && (
                <>
                  {chartType === 'line' ? (
                    <LineChartView data={chartData.ohlc} height={400} />
                  ) : chartData ? (
                    <CandlestickChartView data={chartData.ohlc} height={400} />
                  ) : null}
                  {chartData && <VolumeChart data={chartData.ohlc} height={150} />}
                </>
              )}
            </div>

            <InsightsPanel data={chartData?.ohlc || []} symbol={selectedSymbol} />
          </div>
        </div>

        {compareSymbols.length > 0 && (
          <CompareStocks
            symbols={[selectedSymbol, ...compareSymbols]}
            timeRange={timeRange}
            selectedStocksFromSelector={compareSymbols}
          />
        )}
      </div>
    </div>
  );
};

export default ChartsPage;