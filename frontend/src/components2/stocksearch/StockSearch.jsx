// components/markets/StockSearch.jsx
const StockSearch = ({ 
  selectedStock = 'AAPL', 
  setSelectedStock = () => {}, 
  searchFilters = { sector: '', marketCap: '' }, 
  setSearchFilters = () => {} 
}) => {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 'Large' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', marketCap: 'Large' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', marketCap: 'Large' },
    { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Technology', marketCap: 'Large' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial', marketCap: 'Large' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology', marketCap: 'Large' }
  ];

  const sectors = ['Technology', 'Financial', 'Healthcare', 'Energy', 'Consumer', 'Utilities'];
  const marketCaps = ['Large', 'Mid', 'Small'];

  const handleFilterChange = (filterType, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Stock Search & Filters</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Search Stocks</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by company name or symbol..."
              className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Sector Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Sector</label>
          <select 
            value={searchFilters.sector}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
        
        {/* Market Cap Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Market Cap</label>
          <select 
            value={searchFilters.marketCap}
            onChange={(e) => handleFilterChange('marketCap', e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Caps</option>
            {marketCaps.map(cap => (
              <option key={cap} value={cap}>{cap}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stock Results */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stocks.map(stock => (
          <button
            key={stock.symbol}
            onClick={() => setSelectedStock(stock.symbol)}
            className={`p-2 rounded-lg text-center transition-colors ${
              selectedStock === stock.symbol 
                ? 'bg-blue-600' 
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <div className="font-medium">{stock.symbol}</div>
            <div className="text-xs text-gray-400 truncate">{stock.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockSearch;