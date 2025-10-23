// components/markets/MostActive.jsx
const MostActive = () => {
  const activeStocks = [
    { name: 'RELIANCE', volume: '15.2M', price: 2845.60, change: 3.2 },
    { name: 'SBIN', volume: '12.8M', price: 795.45, change: 0.5 },
    { name: 'TATA STEEL', volume: '10.5M', price: 1542.30, change: -0.8 },
    { name: 'ICICI BANK', volume: '9.7M', price: 1085.60, change: 1.2 },
    { name: 'HINDALCO', volume: '8.3M', price: 645.80, change: -1.1 }
  ];

  // Find max volume for percentage calculation
  const maxVolume = Math.max(...activeStocks.map(stock => parseFloat(stock.volume.replace('M', ''))));

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Most Active Stocks
      </h2>
      <div className="space-y-4">
        {activeStocks.map((stock, i) => {
          const volumeValue = parseFloat(stock.volume.replace('M', ''));
          const volumePercent = (volumeValue / maxVolume) * 100;
          
          return (
            <div key={i} className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-medium">{stock.name}</div>
                <div className="text-sm text-gray-400">Vol: {stock.volume}</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${volumePercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right flex-1">
                <div className="font-semibold">₹{stock.price.toLocaleString()}</div>
                <div className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MostActive;