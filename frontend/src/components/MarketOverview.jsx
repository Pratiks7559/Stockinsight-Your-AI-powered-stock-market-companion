import { useState, useEffect } from 'react';
import axios from 'axios';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMarketData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/market-overview');
      setMarketData(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Market Overview</h2>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              marketData?.marketStatus?.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                marketData?.marketStatus?.isOpen ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              Market {marketData?.marketStatus?.status}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketData?.indices?.map((index, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{index.name}</h3>
                <span className="text-xs text-gray-400">{index.symbol}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{index.value}</p>
                  <div className={`flex items-center text-sm ${
                    index.isUp ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span className="mr-1">
                      {index.isUp ? '↗' : '↘'}
                    </span>
                    {index.change} ({index.changePercent})
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Volume</p>
                  <p className="text-sm text-gray-300">{(index.volume / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Sentiment & Economic Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Market Sentiment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Overall Sentiment</p>
                <p className={`text-lg font-semibold ${
                  marketData?.marketSentiment?.overall === 'Bullish' ? 'text-green-400' :
                  marketData?.marketSentiment?.overall === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {marketData?.marketSentiment?.overall}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fear & Greed Index</p>
                <p className="text-lg font-semibold text-white">{marketData?.marketSentiment?.fearGreedIndex}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">VIX Level</p>
                <p className="text-lg font-semibold text-white">{marketData?.marketSentiment?.vixLevel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Sentiment Score</p>
                <p className="text-lg font-semibold text-white">{marketData?.marketSentiment?.score}/100</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Economic Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">GDP Growth</p>
                <p className="text-lg font-semibold text-green-400">{marketData?.economicIndicators?.gdpGrowth}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Inflation Rate</p>
                <p className="text-lg font-semibold text-yellow-400">{marketData?.economicIndicators?.inflation}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Unemployment</p>
                <p className="text-lg font-semibold text-blue-400">{marketData?.economicIndicators?.unemployment}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Interest Rate</p>
                <p className="text-lg font-semibold text-purple-400">{marketData?.economicIndicators?.interestRate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="text-green-400 mr-2">↗</span>
              Top Gainers
            </h3>
            <div className="space-y-3">
              {marketData?.movers?.topGainers?.slice(0, 5).map((stock, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{stock.ticker}</p>
                    <p className="text-sm text-gray-400">${stock.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">{stock.change_percentage}</p>
                    <p className="text-xs text-gray-400">{(stock.volume / 1000000).toFixed(1)}M vol</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="text-red-400 mr-2">↘</span>
              Top Losers
            </h3>
            <div className="space-y-3">
              {marketData?.movers?.topLosers?.slice(0, 5).map((stock, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{stock.ticker}</p>
                    <p className="text-sm text-gray-400">${stock.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-semibold">{stock.change_percentage}</p>
                    <p className="text-xs text-gray-400">{(stock.volume / 1000000).toFixed(1)}M vol</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="text-blue-400 mr-2">📊</span>
              Most Active
            </h3>
            <div className="space-y-3">
              {marketData?.movers?.mostActive?.slice(0, 5).map((stock, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{stock.ticker}</p>
                    <p className="text-sm text-gray-400">${stock.price}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      stock.change_percentage.startsWith('-') ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {stock.change_percentage}
                    </p>
                    <p className="text-xs text-gray-400">{(stock.volume / 1000000).toFixed(1)}M vol</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cryptocurrency */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="text-yellow-400 mr-2">₿</span>
            Cryptocurrency
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData?.crypto?.map((coin, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-white">{coin.symbol}</p>
                    <p className="text-sm text-gray-400">{coin.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    coin.isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {coin.changePercent}
                  </span>
                </div>
                <p className="text-lg font-bold text-white">${coin.price}</p>
                <p className={`text-sm ${coin.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.isUp ? '+' : ''}{coin.change}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Updates Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-slate-800 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-gray-300 text-sm">Live updates every 30 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;