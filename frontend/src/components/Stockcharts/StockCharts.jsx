import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area, AreaChart } from 'recharts'
import axios from 'axios'

const StockCharts = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [timeRange, setTimeRange] = useState('1M')
  const [chartType, setChartType] = useState('candlestick')
  const [showMA20, setShowMA20] = useState(true)
  const [showMA50, setShowMA50] = useState(true)
  const [showMA200, setShowMA200] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState(null)
  const [chartData, setChartData] = useState([])
  const [technicalIndicators, setTechnicalIndicators] = useState(null)
  const [marketInsights, setMarketInsights] = useState(null)

  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
  ]

  const timeRanges = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y']
  const chartTypes = ['line', 'area', 'candlestick', 'volume']

  const fetchStockData = async () => {
    setLoading(true)
    try {
      const [historyResponse, indicatorsResponse, insightsResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/history?symbol=${selectedStock}&range=${timeRange}`),
        axios.get(`http://localhost:3001/api/indicators?symbol=${selectedStock}`),
        axios.get(`http://localhost:3001/api/insights?symbol=${selectedStock}`)
      ])
      
      setStockData(historyResponse.data)
      setTechnicalIndicators(indicatorsResponse.data)
      setMarketInsights(insightsResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    fetchStockData()
    
    let interval;
    if (timeRange === '1D' || timeRange === '5D') {
      interval = setInterval(() => {
        fetchStockData()
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedStock, timeRange])

  useEffect(() => {
    if (!stockData?.ohlc) return

    const processedData = stockData.ohlc.map(item => {
      const date = new Date(item.t);
      let timeLabel;
      
      if (timeRange === '1D') {
        timeLabel = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (timeRange === '5D') {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        if (isToday) {
          timeLabel = 'Today ' + date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        } else {
          timeLabel = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          });
        }
      } else {
        timeLabel = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      return {
        time: timeLabel,
        price: item.c,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        ma20: item.ma20,
        ma50: item.ma50,
        ma200: item.ma200,
      };
    });

    setChartData(processedData)
  }, [stockData, timeRange])

  const getCurrentPrice = () => {
    if (!stockData?.ohlc?.length) return { price: 0, change: 0, changePercent: 0 }
    const latest = stockData.ohlc[stockData.ohlc.length - 1]
    const previous = stockData.ohlc[stockData.ohlc.length - 2]
    const change = latest.c - previous.c
    const changePercent = (change / previous.c) * 100
    return { price: latest.c, change, changePercent }
  }

  const { price, change, changePercent } = getCurrentPrice()

  return (
    <section className="py-16 bg-slate-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Advanced Stock Charts</h2>
        
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
          {/* Chart Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-4">
              <select 
                value={selectedStock} 
                onChange={(e) => setSelectedStock(e.target.value)}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {stocks.map(stock => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-2">
                {chartTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-2 rounded-lg text-sm capitalize ${chartType === type ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {timeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === range ? 'bg-green-500 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Moving Averages Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowMA20(!showMA20)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showMA20 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-slate-700 text-amber-400 hover:bg-slate-600 border border-amber-500'
              }`}
            >
              MA20
            </button>
            <button
              onClick={() => setShowMA50(!showMA50)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showMA50 
                  ? 'bg-violet-500 text-white shadow-lg' 
                  : 'bg-slate-700 text-violet-400 hover:bg-slate-600 border border-violet-500'
              }`}
            >
              MA50
            </button>
            <button
              onClick={() => setShowMA200(!showMA200)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showMA200 
                  ? 'bg-pink-500 text-white shadow-lg' 
                  : 'bg-slate-700 text-pink-400 hover:bg-slate-600 border border-pink-500'
              }`}
            >
              MA200
            </button>
          </div>
          
          {/* Chart Container */}
          <div className="relative h-96 bg-slate-900 rounded-lg p-4">
            {loading && (
              <div className="absolute inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="text-white">Loading chart data...</div>
              </div>
            )}
            
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'candlestick' ? (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }} 
                    />
                    
                    {/* Candlestick representation using bars */}
                    <Bar 
                      dataKey="high" 
                      fill="#10b981" 
                      stroke="#10b981" 
                      strokeWidth={1}
                    />
                    <Bar 
                      dataKey="low" 
                      fill="#ef4444" 
                      stroke="#ef4444" 
                      strokeWidth={1}
                    />
                    
                    {showMA20 && <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                    {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
                    {showMA200 && <Line type="monotone" dataKey="ma200" stroke="#ec4899" strokeWidth={2} dot={false} />}
                  </ComposedChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }} 
                    />
                    
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    {showMA20 && <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                    {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
                    {showMA200 && <Line type="monotone" dataKey="ma200" stroke="#ec4899" strokeWidth={2} dot={false} />}
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Chart Info */}
          <div className="mt-6 flex flex-wrap justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">${price.toFixed(2)}</h3>
              <p className={`text-lg ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}% (${change.toFixed(2)})
              </p>
            </div>
            <div className="text-gray-400 text-sm">
              {timeRange === '1D' ? 'Live' : 'Last updated'}: {new Date().toLocaleString()} • {selectedStock} • {timeRange}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StockCharts