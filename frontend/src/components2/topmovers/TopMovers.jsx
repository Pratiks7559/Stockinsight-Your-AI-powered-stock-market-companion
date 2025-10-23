// components/markets/TopMovers.jsx
const TopMovers = ({ type }) => {
  const isGainer = type === 'gainers';
  const title = isGainer ? 'Top Gainers' : 'Top Losers';
  
  const movers = isGainer ? [
    { name: 'RELIANCE', price: 2845.60, change: 3.2 },
    { name: 'HDFC BANK', price: 1645.25, change: 2.8 },
    { name: 'INFOSYS', price: 1842.75, change: 2.1 },
    { name: 'TCS', price: 3895.45, change: 1.9 },
    { name: 'BAJFINANCE', price: 6845.30, change: 1.7 }
  ] : [
    { name: 'TATA MOTORS', price: 945.80, change: -1.8 },
    { name: 'ONGC', price: 215.40, change: -1.5 },
    { name: 'ITC', price: 425.65, change: -1.2 },
    { name: 'HINDUNILVR', price: 2345.90, change: -0.9 },
    { name: 'BHARTIARTL', price: 1215.25, change: -0.7 }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        {isGainer ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {title}
      </h2>
      <div className="space-y-3">
        {movers.map((stock, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <span className="font-medium">{stock.name}</span>
            <div className="text-right">
              <div className="font-semibold">₹{stock.price.toLocaleString()}</div>
              <div className={isGainer ? 'text-green-500' : 'text-red-500'}>
                {isGainer ? '+' : ''}{stock.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMovers;