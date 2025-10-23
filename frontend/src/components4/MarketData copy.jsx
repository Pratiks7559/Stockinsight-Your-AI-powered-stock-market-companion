// src/components/MarketData.js
import React, { useState, useEffect } from 'react';

const MarketData = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market-data');
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-3 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between overflow-hidden">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col items-center min-w-[120px]">
                <div className="h-4 bg-gray-300 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-3 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between overflow-x-auto">
          {marketData.map((item, index) => (
            <div key={index} className="flex flex-col items-center min-w-[120px]">
              <span className="text-sm font-semibold text-gray-600">{item.symbol}</span>
              <span className={`text-lg font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.price.toFixed(2)}
                <span className="text-xs ml-1">
                  {item.change >= 0 ? '↗' : '↘'} {Math.abs(item.change).toFixed(2)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketData;