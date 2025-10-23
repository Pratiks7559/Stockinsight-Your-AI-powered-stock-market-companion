import { DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

const SellConfirmation = ({ stock, quantity, currentPrice, onConfirm, onCancel }) => {
  const totalValue = currentPrice * quantity;
  const avgCost = stock.avgPrice;
  const totalCost = avgCost * quantity;
  const plAmount = totalValue - totalCost;
  const plPercent = ((currentPrice - avgCost) / avgCost) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold">Confirm Sell Order</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-700 rounded p-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold">{stock.symbol}</h4>
              <p className="text-gray-400">Selling {quantity} shares</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Market Price:</span>
              <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Your Average Cost:</span>
              <span className="font-semibold">${avgCost.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-600 pt-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">Total Market Value:</span>
                <span className="font-bold text-green-400 flex items-center">
                  <DollarSign className="w-4 h-4" />
                  {totalValue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-slate-700 rounded p-3">
              <div className="flex justify-between">
                <span className="text-gray-400">P&L on this sale:</span>
                <span className={`font-semibold ${plAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {plAmount >= 0 ? '+' : ''}${plAmount.toFixed(2)} 
                  ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-900/20 rounded border border-blue-500/30">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-300">
              You will receive ${totalValue.toFixed(2)} at current market price of ${currentPrice.toFixed(2)} per share.
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition-colors"
          >
            Confirm Sell
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellConfirmation;