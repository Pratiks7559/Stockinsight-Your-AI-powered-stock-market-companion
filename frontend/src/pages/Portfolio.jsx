import { useState } from 'react';
import PortfolioManager from '../components/Portfolio/PortfolioManager';
import StockSearch from '../components/Trading/StockSearch';
import TradingPanel from '../components/Trading/TradingPanel';
import { Plus } from 'lucide-react';

const Portfolio = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setShowSearch(false);
  };

  const handleTradeComplete = () => {
    setSelectedStock(null);
    // Refresh portfolio data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Stock
          </button>
        </div>

        {showSearch && (
          <div className="mb-6 max-w-md">
            <StockSearch onStockSelect={handleStockSelect} />
          </div>
        )}

        {selectedStock && (
          <div className="mb-6 max-w-md">
            <TradingPanel
              symbol={selectedStock.symbol}
              currentPrice={selectedStock.currentPrice}
              initialAction={selectedStock.action}
              onTradeComplete={handleTradeComplete}
            />
          </div>
        )}

        <PortfolioManager />
      </div>
    </div>
  );
};

export default Portfolio;