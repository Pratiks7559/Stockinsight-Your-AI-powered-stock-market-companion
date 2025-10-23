// frontend/src/components/WatchlistPage.jsx
import { useState, useEffect } from 'react';
import StockTable from './StockTable';
import AddStockModal from './AddStockModal';
import AIInsightsPanel from './AIInsightsPanel';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from './api';
import { useRealTimeData } from '../../hooks/useRealTimeData';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get real-time data for watchlist symbols
  const symbols = watchlist.map(stock => stock.symbol);
  const { prices, connected } = useRealTimeData(symbols);

  useEffect(() => {
    loadWatchlist();
  }, []);
  
  // Update watchlist with real-time prices
  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      setWatchlist(prevWatchlist => 
        prevWatchlist.map(stock => {
          const realTimeData = prices[stock.symbol];
          if (realTimeData) {
            return {
              ...stock,
              price: realTimeData.price,
              change: realTimeData.change,
              changePercent: realTimeData.changePercent,
              open: realTimeData.open || stock.open,
              high: realTimeData.high || stock.high,
              low: realTimeData.low || stock.low,
              volume: realTimeData.volume || stock.volume,
              sentiment: realTimeData.sentiment || stock.sentiment
            };
          }
          return stock;
        })
      );
    }
  }, [prices]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await fetchWatchlist();
      // Only update if we have valid data with prices
      if (data && data.length > 0) {
        setWatchlist(data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol) => {
    try {
      await addToWatchlist(symbol);
      await loadWatchlist(); // Refresh the watchlist
    } catch (err) {
      setError('Failed to add stock to watchlist');
      console.error('Error adding stock:', err);
    }
  };

  const handleRemoveStock = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
    } catch (err) {
      setError('Failed to remove stock from watchlist');
      console.error('Error removing stock:', err);
    }
  };

  if (loading && watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Watchlist
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {connected ? 'Live Updates' : 'Disconnected'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            + Add Stock
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockTable 
              stocks={watchlist} 
              onRemoveStock={handleRemoveStock}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-1">
            <AIInsightsPanel watchlist={watchlist} />
          </div>
        </div>

        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddStock={handleAddStock}
          existingSymbols={watchlist.map(stock => stock.symbol)}
        />
      </div>
    </div>
  );
};

export default WatchlistPage;