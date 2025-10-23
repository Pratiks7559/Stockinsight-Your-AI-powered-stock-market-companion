// // components/StockSelector.jsx
// import { useState, useEffect } from "react";

// const StockSelector = ({ selectedStock, setSelectedStock }) => {
//   const [stocks, setStocks] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "JPM", "V"];

//   useEffect(() => {
//     fetchStocks();
//   }, []);

//   const fetchStocks = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // ✅ Backend route is /api/quotes (plural) and supports multiple symbols
//       const response = await fetch(`/api/quotes?symbols=${symbols.join(",")}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch stock data");
//       }

//       const data = await response.json();
//       setStocks(data);

//       // Set default selected stock if not already set
//       if (!selectedStock && data.length > 0 && setSelectedStock) {
//         setSelectedStock(data[0].symbol);
//       }
//     } catch (err) {
//       console.error("Error fetching stocks:", err);
//       setError(err.message);

//       // Fallback dummy data
//       const fallbackStocks = [
//         { symbol: "AAPL", name: "Apple Inc.", price: 175.34, change: 1.23, changePercent: 0.71 },
//         { symbol: "MSFT", name: "Microsoft Corporation", price: 337.69, change: 2.45, changePercent: 0.73 },
//         { symbol: "GOOGL", name: "Alphabet Inc.", price: 130.29, change: 0.87, changePercent: 0.67 },
//         { symbol: "AMZN", name: "Amazon.com Inc.", price: 142.56, change: -0.45, changePercent: -0.31 },
//         { symbol: "TSLA", name: "Tesla, Inc.", price: 210.23, change: 5.67, changePercent: 2.77 },
//         { symbol: "NVDA", name: "NVIDIA Corporation", price: 435.70, change: 12.34, changePercent: 2.92 },
//         { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 155.38, change: -1.23, changePercent: -0.79 },
//         { symbol: "V", name: "Visa Inc.", price: 243.89, change: 0.89, changePercent: 0.37 }
//       ];
//       setStocks(fallbackStocks);

//       if (!selectedStock && fallbackStocks.length > 0 && setSelectedStock) {
//         setSelectedStock(fallbackStocks[0].symbol);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex-1">
//         <label className="block text-sm font-medium text-gray-300 mb-1">Select Stock</label>
//         <select
//           className="bg-slate-700 text-white px-4 py-2 rounded-lg w-full md:w-48"
//           disabled
//         >
//           <option>Loading stocks...</option>
//         </select>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex-1">
//         <label className="block text-sm font-medium text-gray-300 mb-1">Select Stock</label>
//         <div className="flex flex-col gap-2">
//           <select className="bg-slate-700 text-white px-4 py-2 rounded-lg w-full md:w-48">
//             <option>Error loading stocks</option>
//             {stocks.map(stock => (
//               <option key={stock.symbol} value={stock.symbol}>
//                 {stock.symbol} - {stock.name}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={fetchStocks}
//             className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1">
//       <label className="block text-sm font-medium text-gray-300 mb-1">Select Stock</label>
//       <select
//         value={selectedStock}
//         onChange={(e) => setSelectedStock && setSelectedStock(e.target.value)}
//         className="bg-slate-700 text-white px-4 py-2 rounded-lg w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
//       >
//         {stocks.map(stock => (
//           <option key={stock.symbol} value={stock.symbol}>
//             {stock.symbol} - {stock.name} {stock.price && typeof stock.price === 'number' ? `($${stock.price.toFixed(2)})` : ''}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default StockSelector;
// frontend/components/StockSelector.jsx
import { useState, useEffect } from 'react';

const StockSelector = ({ selectedSymbol, onSymbolChange, compareSymbols, onCompareSymbolsChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularStocks] = useState([
    // US Tech Stocks
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corporation' },
    { symbol: 'IBM', name: 'International Business Machines' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
    { symbol: 'UBER', name: 'Uber Technologies Inc.' },
    { symbol: 'SPOT', name: 'Spotify Technology S.A.' },
    { symbol: 'ZOOM', name: 'Zoom Video Communications' },
    { symbol: 'SHOP', name: 'Shopify Inc.' },
    { symbol: 'SQ', name: 'Block Inc.' },
    { symbol: 'TWTR', name: 'Twitter Inc.' },
    { symbol: 'SNAP', name: 'Snap Inc.' },
    { symbol: 'PINS', name: 'Pinterest Inc.' },
    { symbol: 'ROKU', name: 'Roku Inc.' },
    { symbol: 'DOCU', name: 'DocuSign Inc.' },
    
    // US Financial & Traditional
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'BAC', name: 'Bank of America Corp.' },
    { symbol: 'WFC', name: 'Wells Fargo & Co.' },
    { symbol: 'GS', name: 'Goldman Sachs Group Inc.' },
    { symbol: 'MS', name: 'Morgan Stanley' },
    { symbol: 'AXP', name: 'American Express Co.' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'PG', name: 'Procter & Gamble Co.' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'MCD', name: 'McDonalds Corp.' },
    { symbol: 'NKE', name: 'Nike Inc.' },
    { symbol: 'COST', name: 'Costco Wholesale Corp.' },
    { symbol: 'TGT', name: 'Target Corp.' },
    
    // Indian Stocks
    { symbol: 'RELIANCE.NSE', name: 'Reliance Industries Ltd.' },
    { symbol: 'TCS.NSE', name: 'Tata Consultancy Services' },
    { symbol: 'INFY.NSE', name: 'Infosys Limited' },
    { symbol: 'HDFCBANK.NSE', name: 'HDFC Bank Limited' },
    { symbol: 'ICICIBANK.NSE', name: 'ICICI Bank Limited' },
    { symbol: 'SBIN.NSE', name: 'State Bank of India' },
    { symbol: 'ITC.NSE', name: 'ITC Limited' },
    { symbol: 'HINDUNILVR.NSE', name: 'Hindustan Unilever Ltd.' },
    { symbol: 'BAJFINANCE.NSE', name: 'Bajaj Finance Limited' },
    { symbol: 'KOTAKBANK.NSE', name: 'Kotak Mahindra Bank Ltd.' },
    { symbol: 'LT.NSE', name: 'Larsen & Toubro Ltd.' },
    { symbol: 'WIPRO.NSE', name: 'Wipro Limited' },
    { symbol: 'HCLTECH.NSE', name: 'HCL Technologies Ltd.' },
    { symbol: 'TECHM.NSE', name: 'Tech Mahindra Ltd.' },
    { symbol: 'MARUTI.NSE', name: 'Maruti Suzuki India Ltd.' },
    { symbol: 'TATAMOTORS.NSE', name: 'Tata Motors Ltd.' },
    { symbol: 'BHARTIARTL.NSE', name: 'Bharti Airtel Ltd.' },
    { symbol: 'ONGC.NSE', name: 'Oil & Natural Gas Corp. Ltd.' },
    { symbol: 'NTPC.NSE', name: 'NTPC Ltd.' },
    { symbol: 'POWERGRID.NSE', name: 'Power Grid Corp. of India Ltd.' },
    { symbol: 'COALINDIA.NSE', name: 'Coal India Ltd.' },
    { symbol: 'IOC.NSE', name: 'Indian Oil Corp. Ltd.' },
    { symbol: 'BPCL.NSE', name: 'Bharat Petroleum Corp. Ltd.' },
    { symbol: 'HPCL.NSE', name: 'Hindustan Petroleum Corp. Ltd.' },
    { symbol: 'GAIL.NSE', name: 'GAIL India Ltd.' },
    { symbol: 'DRREDDY.NSE', name: 'Dr. Reddys Laboratories Ltd.' },
    { symbol: 'SUNPHARMA.NSE', name: 'Sun Pharmaceutical Industries Ltd.' },
    { symbol: 'CIPLA.NSE', name: 'Cipla Ltd.' },
    { symbol: 'DIVISLAB.NSE', name: 'Divis Laboratories Ltd.' },
    { symbol: 'BRITANNIA.NSE', name: 'Britannia Industries Ltd.' },
    { symbol: 'NESTLEIND.NSE', name: 'Nestle India Ltd.' },
    { symbol: 'TATASTEEL.NSE', name: 'Tata Steel Ltd.' },
    { symbol: 'JSWSTEEL.NSE', name: 'JSW Steel Ltd.' },
    { symbol: 'HINDALCO.NSE', name: 'Hindalco Industries Ltd.' },
    { symbol: 'VEDL.NSE', name: 'Vedanta Ltd.' },
    { symbol: 'ADANIPORTS.NSE', name: 'Adani Ports & SEZ Ltd.' },
    { symbol: 'ADANIENT.NSE', name: 'Adani Enterprises Ltd.' },
    { symbol: 'ULTRACEMCO.NSE', name: 'UltraTech Cement Ltd.' },
    { symbol: 'SHREECEM.NSE', name: 'Shree Cement Ltd.' },
    { symbol: 'BAJAJFINSV.NSE', name: 'Bajaj Finserv Ltd.' },
    { symbol: 'BAJAJ-AUTO.NSE', name: 'Bajaj Auto Ltd.' },
    { symbol: 'HEROMOTOCO.NSE', name: 'Hero MotoCorp Ltd.' },
    { symbol: 'EICHERMOT.NSE', name: 'Eicher Motors Ltd.' },
    { symbol: 'M&M.NSE', name: 'Mahindra & Mahindra Ltd.' },
    { symbol: 'TATACONSUM.NSE', name: 'Tata Consumer Products Ltd.' },
    { symbol: 'GODREJCP.NSE', name: 'Godrej Consumer Products Ltd.' },
    { symbol: 'DABUR.NSE', name: 'Dabur India Ltd.' },
    { symbol: 'MARICO.NSE', name: 'Marico Ltd.' },
    { symbol: 'COLPAL.NSE', name: 'Colgate Palmolive India Ltd.' },
    { symbol: 'PIDILITIND.NSE', name: 'Pidilite Industries Ltd.' },
    { symbol: 'ASIANPAINT.NSE', name: 'Asian Paints Ltd.' },
    { symbol: 'BERGER.NSE', name: 'Berger Paints India Ltd.' },
    { symbol: 'TITAN.NSE', name: 'Titan Company Ltd.' },
    { symbol: 'APOLLOHOSP.NSE', name: 'Apollo Hospitals Enterprise Ltd.' },
    { symbol: 'FORTIS.NSE', name: 'Fortis Healthcare Ltd.' },
    { symbol: 'MAXHEALTH.NSE', name: 'Max Healthcare Institute Ltd.' },
    { symbol: 'ZOMATO.NSE', name: 'Zomato Ltd.' },
    { symbol: 'PAYTM.NSE', name: 'One 97 Communications Ltd.' },
    { symbol: 'NYKAA.NSE', name: 'FSN E-Commerce Ventures Ltd.' }
  ]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/quotes?symbols=${searchQuery}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleCompareToggle = (symbol) => {
    if (compareSymbols.includes(symbol)) {
      onCompareSymbolsChange(compareSymbols.filter(s => s !== symbol));
    } else if (compareSymbols.length < 2) {
      onCompareSymbolsChange([...compareSymbols, symbol]);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Select Stock</h3>
      
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
          placeholder="Search symbol..."
          className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {searchQuery.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {popularStocks.filter(stock => 
              stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
              stock.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((stock) => (
              <div
                key={stock.symbol}
                className="px-4 py-2 hover:bg-slate-600 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  onSymbolChange(stock.symbol);
                  setSearchQuery('');
                }}
              >
                <div>
                  <div className="font-semibold">{stock.symbol}</div>
                  <div className="text-sm text-slate-300">{stock.name}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompareToggle(stock.symbol);
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    compareSymbols.includes(stock.symbol)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-gray-300'
                  }`}
                >
                  {compareSymbols.includes(stock.symbol) ? '✓' : '+'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-400">Popular Stocks</h4>
        {popularStocks.slice(0, 8).map((stock) => (
          <div
            key={stock.symbol}
            className={`flex justify-between items-center p-2 rounded-lg cursor-pointer ${
              selectedSymbol === stock.symbol
                ? 'bg-blue-500/20 border border-blue-500'
                : 'hover:bg-slate-700'
            }`}
            onClick={() => onSymbolChange(stock.symbol)}
          >
            <div>
              <div className="font-semibold">{stock.symbol}</div>
              <div className="text-xs text-slate-400">{stock.name}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCompareToggle(stock.symbol);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
  compareSymbols.includes(stock.symbol)
    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
    : 'bg-slate-600 hover:bg-slate-500 text-gray-300 hover:text-white'
}`}

            >
              {compareSymbols.includes(stock.symbol) ? '✓ Compare' : '+ Compare'}
            </button>
          </div>
        ))}
      </div>

      {compareSymbols.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-400 mb-2">
            📊 Comparing ({compareSymbols.length} stocks)
          </h4>
          <div className="flex flex-wrap gap-2">
            {compareSymbols.map((symbol) => (
              <span
                key={symbol}
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-sm flex items-center gap-2 text-white font-medium"
              >
                {symbol}
                <button
                  onClick={() => handleCompareToggle(symbol)}
                  className="text-white hover:text-red-200 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            💡 These stocks will appear in the Compare Stocks section below
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSelector;