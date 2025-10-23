// components/MarketOverview.jsx
import { useState, useEffect } from 'react';

const MarketOverview = () => {
  const [indices, setIndices] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch all data from your backend API
      const [indicesResponse, moversResponse] = await Promise.all([
        fetch('/api/market/indices'),
        fetch('/api/market/movers')
      ]);

      if (!indicesResponse.ok || !moversResponse.ok) {
        throw new Error('Failed to fetch market data');
      }

      const indicesData = await indicesResponse.json();
      const moversData = await moversResponse.json();

      setIndices(indicesData);
      setTopGainers(moversData.topGainers);
      setTopLosers(moversData.topLosers);
      setMostActive(moversData.mostActive);

    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback to dummy data if API fails
      setIndices([
        { name: 'Nifty 50', value: '22,475.50', change: '+1.2%', changePercent: '+1.2%', isUp: true },
        { name: 'Sensex', value: '74,005.94', change: '+0.8%', changePercent: '+0.8%', isUp: true },
        { name: 'Nasdaq', value: '16,349.25', change: '-0.3%', changePercent: '-0.3%', isUp: false },
        { name: 'Dow Jones', value: '39,512.84', change: '+0.5%', changePercent: '+0.5%', isUp: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Market Overview</h2>
        
        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {indices.map((index, i) => (
            <div key={i} className="bg-slate-900 p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">{index.name}</h3>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold">{index.value}</span>
                <span className={index.isUp ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                  {index.change} ({index.changePercent})
                </span>
              </div>
              {/* Simple sparkline */}
              <div className="h-12 mt-4 flex items-end">
                <div className="flex-1 flex items-end space-x-px">
                  {[30, 45, 60, 40, 65, 50, 70].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${index.isUp ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Gainers */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Top Gainers
            </h3>
            <div className="space-y-4">
              {topGainers.length > 0 ? topGainers.map((stock, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                  <span className="font-medium">{stock.ticker}</span>
                  <div className="text-right">
                    <div className="font-semibold">${parseFloat(stock.price).toFixed(2)}</div>
                    <div className="text-green-500">+{parseFloat(stock.change_percentage).toFixed(2)}%</div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400">No data available</p>
              )}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Top Losers
            </h3>
            <div className="space-y-4">
              {topLosers.length > 0 ? topLosers.map((stock, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                  <span className="font-medium">{stock.ticker}</span>
                  <div className="text-right">
                    <div className="font-semibold">${parseFloat(stock.price).toFixed(2)}</div>
                    <div className="text-red-500">{parseFloat(stock.change_percentage).toFixed(2)}%</div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400">No data available</p>
              )}
            </div>
          </div>

          {/* Most Active */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Most Active
            </h3>
            <div className="space-y-4">
              {mostActive.length > 0 ? mostActive.map((stock, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                  <span className="font-medium">{stock.ticker}</span>
                  <div className="text-right">
                    <div className="font-semibold">${parseFloat(stock.price).toFixed(2)}</div>
                    <div className="text-gray-400">Vol: {stock.volume}</div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;