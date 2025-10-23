import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const TradingPanel = ({ symbol, currentPrice, onTradeComplete, initialAction }) => {
  const [tradeType, setTradeType] = useState(initialAction || 'BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [livePrice, setLivePrice] = useState(currentPrice);

  console.log('TradingPanel props:', { symbol, currentPrice, initialAction });

  useEffect(() => {
    console.log('TradingPanel useEffect - setting price:', currentPrice);
    setLivePrice(currentPrice);
    
    // Set trade type based on initialAction
    if (initialAction) {
      setTradeType(initialAction);
    }
    
    // Update price every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/market-data/quotes?symbol=${symbol}`);
        const data = await response.json();
        console.log('Price updated:', data.price);
        setLivePrice(data.price);
      } catch (error) {
        console.error('Error updating price:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol, currentPrice, initialAction]);

  const handleTrade = async () => {
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      // Get fresh live price before trade
      const quoteResponse = await fetch(`/api/market-data/quotes?symbol=${symbol}`);
      const quoteData = await quoteResponse.json();
      const freshPrice = quoteData.price;
      
      console.log(`Fresh price for ${symbol}: $${freshPrice}`);
      setLivePrice(freshPrice);

      const response = await fetch(`/api/transactions/${tradeType.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symbol,
          quantity: parseInt(quantity),
          mode: 'SIMULATION'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const message = tradeType === 'BUY' 
          ? `✅ Bought ${quantity} ${symbol} shares at $${data.executedPrice.toFixed(2)} each\nTotal Cost: $${(data.executedPrice * quantity).toFixed(2)}`
          : `✅ Sold ${quantity} ${symbol} shares at market price $${data.executedPrice.toFixed(2)}\nTotal Received: $${(data.executedPrice * quantity).toFixed(2)}`;
        alert(message);
        setQuantity('');
        onTradeComplete?.(data.transaction);
      } else {
        alert(data.error || 'Trade failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = (parseFloat(quantity) || 0) * livePrice;

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Trade {symbol}</h3>
      </div>

      <div className="mb-4 p-3 bg-slate-700 rounded">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">{symbol}</div>
          <div className="text-xl font-bold text-green-400">
            Live Price: ${livePrice.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTradeType('BUY')}
          className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
            tradeType === 'BUY'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          BUY
        </button>
        <button
          onClick={() => setTradeType('SELL')}
          className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
            tradeType === 'SELL'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          <TrendingDown className="w-4 h-4 inline mr-2" />
          SELL
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quantity
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter shares"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          min="1"
        />
      </div>

      {quantity && (
        <div className="mb-4 p-3 bg-slate-700 rounded">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              {tradeType === 'BUY' ? 'Total Cost:' : 'Total Sale Value:'}
            </span>
            <span className="text-lg font-semibold text-white flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {totalValue.toFixed(2)}
            </span>
          </div>
          {tradeType === 'SELL' && (
            <div className="mt-2 text-sm text-blue-400">
              Market Value per share: ${livePrice.toFixed(2)}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleTrade}
        disabled={loading || !quantity}
        className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
          tradeType === 'BUY'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Processing...' : `${tradeType} ${symbol}`}
      </button>

      <div className="mt-4 text-xs text-gray-400 text-center">
        * {tradeType === 'BUY' ? `Buying ${symbol}` : `Selling ${symbol}`} at ${livePrice.toFixed(2)} per share
        <br />{tradeType === 'BUY' ? 'Total Cost' : 'You will receive'}: ${totalValue.toFixed(2)}
        {tradeType === 'SELL' && (
          <><br />Market value based sale</>
        )}
      </div>
    </div>
  );
};

export default TradingPanel;