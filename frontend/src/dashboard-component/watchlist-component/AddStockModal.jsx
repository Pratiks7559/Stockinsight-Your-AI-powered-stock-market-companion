// frontend/src/components/AddStockModal.jsx
import { useState } from 'react';
import { searchStocks } from './api';

const AddStockModal = ({ isOpen, onClose, onAddStock, existingSymbols }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchStocks(query);
      setSearchResults(results.filter(stock => !existingSymbols.includes(stock.symbol)));
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (symbol) => {
    onAddStock(symbol);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Stock to Watchlist
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search for stocks..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              autoFocus
            />
            
            {loading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchResults.map((stock, index) => (
                <div
                  key={`${stock.symbol}-${index}`}
                  className="flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                  onClick={() => handleAdd(stock.symbol)}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 font-semibold">
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
            <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
              No stocks found. Try a different search term.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;