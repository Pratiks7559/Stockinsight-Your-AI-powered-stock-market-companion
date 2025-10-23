// components/WatchlistSection.jsx
const WatchlistSection = ({ watchlist, darkMode }) => {
  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
      
      <div className="space-y-3">
        {watchlist.map((stock, index) => (
          <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
            <div>
              <div className="font-semibold">{stock.symbol}</div>
              <div className="text-sm text-gray-500">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${stock.price.toFixed(2)}</div>
              <div className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg transition-colors">
        + Add to Watchlist
      </button>
    </div>
  );
};

export default WatchlistSection;