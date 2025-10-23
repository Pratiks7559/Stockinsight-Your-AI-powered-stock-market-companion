// src/components/Dashboard/Overview.jsx
import { useState, useEffect } from 'react'
import StockChart from './Charts/StockChart'
import Card from './UI/Card'
import { fetchWatchlist } from './watchlist-component/api'
import { useRealTimeData } from '../hooks/useRealTimeData'
import RiskLevel from './RiskLevel'

const Overview = ({ summary }) => {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  
  const symbols = watchlist.map(stock => stock.symbol)
  const { prices, connected } = useRealTimeData(symbols)

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const data = await fetchWatchlist()
        setWatchlist(data.slice(0, 5)) // Show only first 5 stocks in overview
      } catch (error) {
        console.error('Error loading watchlist:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadWatchlist()
  }, [])

  const chartData = [
    { date: 'Jan', portfolio: 22000, benchmark: 21000 },
    { date: 'Feb', portfolio: 22500, benchmark: 21500 },
    { date: 'Mar', portfolio: 23000, benchmark: 22000 },
    { date: 'Apr', portfolio: 23500, benchmark: 22500 },
    { date: 'May', portfolio: 24000, benchmark: 23000 },
    { date: 'Jun', portfolio: 24500, benchmark: 23500 },
    { date: 'Jul', portfolio: 25000, benchmark: 24000 },
    { date: 'Aug', portfolio: summary?.totalCurrentValue || 25340, benchmark: 24500 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-gray-400">Last updated: Today at 3:45 PM</div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-gray-400 text-sm">Portfolio Value</h2>
              {summary ? (
                <p className="text-2xl font-bold mt-1">${summary.totalCurrentValue.toLocaleString()}</p>
              ) : (
                <div className="animate-pulse h-8 w-32 bg-slate-700 rounded mt-1"></div>
              )}
            </div>
            {summary && (
              <div className={`text-right ${summary.totalUnrealizedPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <p className="text-sm">Today</p>
                <p className="font-semibold">
                  {summary.totalUnrealizedPL >= 0 ? '+' : ''}${Math.abs(summary.totalUnrealizedPL).toLocaleString()} 
                  ({summary.totalUnrealizedPL >= 0 ? '+' : ''}{summary.totalUnrealizedPLPercent.toFixed(2)}%)
                </p>
              </div>
            )}
          </div>
        </Card>

        <RiskLevel />

        <Card className="bg-slate-800 p-6">
          <h2 className="text-gray-400 text-sm">AI Summary</h2>
          <p className="mt-2">Your portfolio grew <span className="text-green-500 font-semibold">5.2%</span> this week. 
          Consider adding more tech stocks for better diversification.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio vs Benchmark Chart */}
        <Card className="bg-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Portfolio vs Nifty 50</h2>
          <div className="h-64">
            <StockChart data={chartData} />
          </div>
        </Card>

        {/* Watchlist Preview */}
        <Card className="bg-slate-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Watchlist</h2>
            <a href="/dashboard/watchlist" className="text-blue-400 text-sm hover:text-blue-300">View All</a>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No stocks in watchlist</div>
            ) : (
              watchlist.map((stock, index) => {
                const realTimeData = prices[stock.symbol]
                const currentPrice = realTimeData?.price || stock.price || 0
                const currentChange = realTimeData?.changePercent || stock.changePercent || 0
                
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${Number(currentPrice).toFixed(2)}</div>
                      <div className={currentChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {currentChange >= 0 ? '+' : ''}{Number(currentChange).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Overview