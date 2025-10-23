import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Minus, DollarSign } from 'lucide-react';
import TradingPanel from '../Trading/TradingPanel';
import RecommendationPanel from './RecommendationPanel';
import HoldingCard from './HoldingCard';

const PortfolioManager = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPortfolio(data);
      
      // Update live prices for all holdings
      if (data?.portfolio?.holdings) {
        const updatedHoldings = await Promise.all(
          data.portfolio.holdings.map(async (holding) => {
            try {
              const quoteResponse = await fetch(`/api/market-data/quotes?symbol=${holding.symbol}`);
              const quoteData = await quoteResponse.json();
              return {
                ...holding,
                currentPrice: quoteData.price,
                marketValue: quoteData.price * holding.quantity,
                unrealizedPL: (quoteData.price - holding.avgPrice) * holding.quantity,
                unrealizedPLPercent: ((quoteData.price - holding.avgPrice) / holding.avgPrice) * 100
              };
            } catch (error) {
              return holding;
            }
          })
        );
        
        setPortfolio(prev => ({
          ...prev,
          portfolio: {
            ...prev.portfolio,
            holdings: updatedHoldings
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeComplete = () => {
    fetchPortfolio();
    setSelectedStock(null);
    // Force refresh all holding cards
    window.dispatchEvent(new Event('portfolio-updated'));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 rounded p-4">
            <div className="text-sm text-gray-400">Total Value</div>
            <div className="text-2xl font-bold text-white">
              ${portfolio?.summary?.totalCurrentValue?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-slate-700 rounded p-4">
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className={`text-2xl font-bold ${
              (portfolio?.summary?.totalUnrealizedPL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(portfolio?.summary?.totalUnrealizedPL || 0) >= 0 ? '+' : ''}
              ${portfolio?.summary?.totalUnrealizedPL?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-slate-700 rounded p-4">
            <div className="text-sm text-gray-400">P&L %</div>
            <div className={`text-2xl font-bold ${
              (portfolio?.summary?.totalUnrealizedPLPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(portfolio?.summary?.totalUnrealizedPLPercent || 0) >= 0 ? '+' : ''}
              {portfolio?.summary?.totalUnrealizedPLPercent?.toFixed(2) || '0.00'}%
            </div>
          </div>
          <div className="bg-slate-700 rounded p-4">
            <div className="text-sm text-gray-400">Holdings</div>
            <div className="text-2xl font-bold text-white">
              {portfolio?.portfolio?.holdings?.length || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings List */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Holdings</h3>
          {portfolio?.portfolio?.holdings?.length > 0 ? (
            <div className="space-y-3">
              {portfolio.portfolio.holdings.map((holding) => (
                <HoldingCard 
                  key={holding.symbol} 
                  holding={holding} 
                  onTrade={setSelectedStock}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No holdings yet. Start trading to build your portfolio!</p>
            </div>
          )}
        </div>

        {/* Trading Panel */}
        <div>
          {selectedStock ? (
            <TradingPanel
              symbol={selectedStock.symbol}
              currentPrice={selectedStock.currentPrice}
              initialAction={selectedStock.action}
              onTradeComplete={handleTradeComplete}
            />
          ) : (
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Select a stock to trade</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <RecommendationPanel userId={localStorage.getItem('userId')} />
    </div>
  );
};

export default PortfolioManager;