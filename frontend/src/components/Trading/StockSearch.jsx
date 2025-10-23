import { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';

const StockSearch = ({ onStockSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      // Debounce search to avoid rate limits
      const timeoutId = setTimeout(() => {
        searchStocks();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchStocks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market-data/search?q=${encodeURIComponent(query)}`);
      
      if (response.status === 429) {
        // Rate limit hit, use home page dummy data
        const mockResults = [
          { symbol: 'AAPL', name: 'Apple Inc.' },
          { symbol: 'MSFT', name: 'Microsoft Corp.' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.' },
          { symbol: 'AMZN', name: 'Amazon.com Inc.' },
          { symbol: 'TSLA', name: 'Tesla Inc.' }
        ].filter(s => s.symbol.toLowerCase().includes(query.toLowerCase()));
        setResults(mockResults);
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        setResults(Array.isArray(data) ? data.slice(0, 5) : []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to home page dummy data
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corp.' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.' },
        { symbol: 'TSLA', name: 'Tesla Inc.' }
      ].filter(s => s.symbol.toLowerCase().includes(query.toLowerCase()));
      setResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = async (stock) => {
    try {
      const response = await fetch(`/api/market-data/quotes?symbol=${stock.symbol}`);
      const data = await response.json();
      onStockSelect({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: data.price || 150
      });
      setQuery('');
      setResults([]);
    } catch (error) {
      console.error('Error fetching stock price:', error);
      onStockSelect({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: 150
      });
      setQuery('');
      setResults([]);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (e.g., AAPL, MSFT)"
          className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleStockSelect(stock)}
              className="w-full px-4 py-3 text-left hover:bg-slate-600 flex items-center justify-between border-b border-slate-600 last:border-b-0"
            >
              <div>
                <div className="font-semibold text-white">{stock.symbol}</div>
                <div className="text-sm text-gray-400">{stock.name}</div>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;