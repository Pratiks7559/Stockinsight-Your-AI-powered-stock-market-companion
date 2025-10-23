// components/markets/Watchlist.jsx
const Watchlist = () => {
  const isLoggedIn = false; // Simulate guest user
  const watchlist = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.3 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 345.67, change: 1.2 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 145.89, change: -0.8 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.23, change: 0.5 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -2.1 }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
      
      {isLoggedIn ? (
        <div className="space-y-4">
          {watchlist.map((stock, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-400">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${stock.price.toFixed(2)}</div>
                <div className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Track Your Favorite Stocks</h3>
          <p className="text-gray-400 mb-4">Sign in to create and monitor your personal watchlist</p>
          <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default Watchlist;