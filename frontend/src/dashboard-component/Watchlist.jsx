// src/components/Dashboard/Watchlist.jsx
import { useState, useEffect } from 'react'
import Card from './UI/Card'

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.3, changePercent: 1.33, sentiment: 'positive' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 345.67, change: 3.2, changePercent: 0.93, sentiment: 'positive' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 145.89, change: 1.5, changePercent: 1.04, sentiment: 'positive' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.23, change: -0.8, changePercent: -0.45, sentiment: 'neutral' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -2.1, changePercent: -0.85, sentiment: 'negative' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2845.60, change: 12.5, changePercent: 0.44, sentiment: 'positive' },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1842.75, change: 5.8, changePercent: 0.32, sentiment: 'positive' }
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWatchlist = watchlist.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return '📈'
      case 'negative': return '📉'
      default: return '➡️'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300">
          Add Stock
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
              All
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
              Gainers
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
              Losers
            </button>
          </div>
        </div>
      </Card>

      {/* AI Recommendation */}
      <Card className="bg-slate-800 p-6">
        <div className="flex items-start">
          <div className="bg-blue-500 p-2 rounded-lg mr-4">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">AI Recommendation</h3>
            <p className="text-gray-400 mt-1">You track Reliance; consider adding ONGC (correlation: 0.82)</p>
          </div>
        </div>
      </Card>

      {/* Watchlist Table */}
      <Card className="bg-slate-800 p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-700">
              <th className="pb-3">Symbol</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Change</th>
              <th className="pb-3">Sentiment</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.map((stock, index) => (
              <tr key={index} className="border-b border-slate-700 hover:bg-slate-750">
                <td className="py-3 font-semibold">{stock.symbol}</td>
                <td className="py-3">{stock.name}</td>
                <td className="py-3">${stock.price.toFixed(2)}</td>
                <td className={`py-3 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </td>
                <td className="py-3">
                  <span className={getSentimentColor(stock.sentiment)}>
                    {getSentimentIcon(stock.sentiment)} {stock.sentiment}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-blue-500 hover:text-blue-400 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-400">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default Watchlist