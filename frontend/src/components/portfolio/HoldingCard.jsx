import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';

const HoldingCard = ({ holding, onTrade }) => {
  const [livePrice, setLivePrice] = useState(holding.currentPrice);
  const [marketValue, setMarketValue] = useState(holding.currentPrice * holding.quantity);
  const [plAmount, setPlAmount] = useState((holding.currentPrice - holding.avgPrice) * holding.quantity);
  const [plPercent, setPlPercent] = useState(((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100);

  useEffect(() => {
    // Update prices every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/market-data/quotes?symbol=${holding.symbol}`);
        const data = await response.json();
        const newPrice = data.price;
        
        setLivePrice(newPrice);
        setMarketValue(newPrice * holding.quantity);
        setPlAmount((newPrice - holding.avgPrice) * holding.quantity);
        setPlPercent(((newPrice - holding.avgPrice) / holding.avgPrice) * 100);
      } catch (error) {
        console.error('Error updating price:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [holding.symbol, holding.quantity, holding.avgPrice]);

  return (
    <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-lg">{holding.symbol}</h4>
          <span className="text-sm text-gray-400">{holding.name}</span>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {holding.quantity} shares @ ${holding.avgPrice?.toFixed(2)} avg cost
        </div>
        <div className="text-sm text-blue-400 mt-1">
          Invested: ${(holding.avgPrice * holding.quantity).toFixed(2)}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-semibold flex items-center gap-2">
          ${livePrice?.toFixed(2)}
          {livePrice > holding.avgPrice ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div className="text-sm font-medium text-white">
          Market Value: ${marketValue?.toFixed(2)}
        </div>
        <div className={`text-sm font-medium ${
          plAmount >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          P&L: {plAmount >= 0 ? '+' : ''}${plAmount?.toFixed(2)} 
          ({plPercent >= 0 ? '+' : ''}{plPercent?.toFixed(2)}%)
        </div>
      </div>

      <div className="ml-4 flex gap-2">
        <button
          onClick={() => onTrade({...holding, currentPrice: livePrice, action: 'BUY'})}
          className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
          title={`Buy more at $${livePrice?.toFixed(2)}`}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            console.log('Sell button clicked, current price:', livePrice);
            onTrade({...holding, currentPrice: livePrice, action: 'SELL'});
          }}
          className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
          title={`Sell at $${livePrice?.toFixed(2)}`}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HoldingCard;