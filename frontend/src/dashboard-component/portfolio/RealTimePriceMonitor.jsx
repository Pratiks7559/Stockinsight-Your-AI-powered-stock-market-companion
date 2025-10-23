// RealTimePriceMonitor.jsx
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import socketService from '../../services/socketService';

const RealTimePriceMonitor = ({ symbol, onPriceUpdate, className = "" }) => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);
  const [changePercent, setChangePercent] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [priceDirection, setPriceDirection] = useState(null);
  const priceRef = useRef(null);

  useEffect(() => {
    if (!symbol) return;

    const handlePriceUpdate = (data) => {
      if (data.symbol?.toUpperCase() !== symbol.toUpperCase()) return;

      const newPrice = parseFloat(data.price);
      const newChange = parseFloat(data.change || 0);
      const newChangePercent = parseFloat(data.changePercent || 0);

      // Detect price direction for visual feedback
      if (priceRef.current !== null && newPrice !== priceRef.current) {
        setPriceDirection(newPrice > priceRef.current ? 'up' : 'down');
        setTimeout(() => setPriceDirection(null), 1500);
      }

      setPrice(newPrice);
      setChange(newChange);
      setChangePercent(newChangePercent);
      setLastUpdate(new Date());
      priceRef.current = newPrice;

      // Keep price history (last 10 prices)
      setPriceHistory(prev => {
        const newHistory = [...prev, { price: newPrice, timestamp: Date.now() }];
        return newHistory.slice(-10);
      });

      // Callback to parent component
      if (onPriceUpdate) {
        onPriceUpdate({
          symbol,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          timestamp: Date.now()
        });
      }
    };

    // Subscribe to price updates
    socketService.connect();
    socketService.subscribeToPrices([symbol], handlePriceUpdate);

    return () => {
      // Cleanup handled by socket service
    };
  }, [symbol, onPriceUpdate]);

  if (!price) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="text-xs text-gray-400">Loading price...</div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isPositive = change >= 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Current Price */}
      <div className={`text-lg font-semibold transition-all duration-300 ${
        priceDirection === 'up' ? 'text-green-600 animate-pulse scale-105' :
        priceDirection === 'down' ? 'text-red-600 animate-pulse scale-105' :
        'text-gray-900 dark:text-white'
      }`}>
        {formatCurrency(price)}
        {priceDirection === 'up' && <span className="ml-1 text-green-500">↗️</span>}
        {priceDirection === 'down' && <span className="ml-1 text-red-500">↘️</span>}
      </div>

      {/* Change Indicator */}
      <div className={`flex items-center space-x-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>
          {isPositive ? '+' : ''}{change?.toFixed(2)} ({changePercent?.toFixed(2)}%)
        </span>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600 font-medium">LIVE</span>
      </div>

      {/* Last Update Time */}
      {lastUpdate && (
        <div className="text-xs text-gray-400">
          {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Price Volatility Indicator */}
      {priceHistory.length > 5 && (
        <div className="text-xs text-gray-500">
          {(() => {
            const recent = priceHistory.slice(-5);
            const volatility = Math.max(...recent.map(p => p.price)) - Math.min(...recent.map(p => p.price));
            const avgPrice = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
            const volatilityPercent = (volatility / avgPrice) * 100;
            
            if (volatilityPercent > 2) {
              return <span className="text-yellow-600">🔥 High Vol</span>;
            } else if (volatilityPercent < 0.5) {
              return <span className="text-blue-600">📈 Stable</span>;
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default RealTimePriceMonitor;