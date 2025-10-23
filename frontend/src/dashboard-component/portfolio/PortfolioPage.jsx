// PortfolioPage.jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import ErrorBoundary from '../../components/ErrorBoundary';
import PortfolioOverview from './PortfolioOverview';
import HoldingsTable from './HoldingsTable';
import TransactionModal from './TransactionModal';
import TransactionHistory from './TransactionHistory';
import MiniChart from './MiniChart';
import AlertsPanel from './AlertsPanel';
import AIInsightsPanel from './AIInsightsPanel';
import RealTimePLIndicator from './RealTimePLIndicator';
import { portfolioAPI } from '../../utils/api';
import socketService from '../../services/socketService';
import RecommendationPanel from '../../components/portfolio/RecommendationPanel';
import { useAuth } from '../../contexts/AuthContext';

const PortfolioPage = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('BUY');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const { connectionStatus } = useSocket();
  const [realTimePrices, setRealTimePrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [aiInsights, setAIInsights] = useState(null);

  useEffect(() => {
    // Subscribe to price updates
    socketService.subscribeToPrices([], (data) => {
      setRealTimePrices(prev => ({
        ...prev,
        [data.symbol]: data
      }));
      setLastUpdate(new Date());
    });

    // Subscribe to portfolio updates
    socketService.subscribeToPortfolio((data) => {
      console.log('Portfolio update received:', data);
      setPortfolio(data.portfolio);
      setSummary(data.summary);
      setLastUpdate(new Date());
    });

    return () => {
      // Cleanup handled by socketService
    };
  }, []);

  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Subscribe to price updates for holdings
    if (connectionStatus.connected && portfolio?.holdings?.length > 0) {
      const symbols = portfolio.holdings.map(h => h.symbol);
      socketService.subscribeToPrices(symbols, (data) => {
        setRealTimePrices(prev => ({
          ...prev,
          [data.symbol]: data
        }));
        setLastUpdate(new Date());
      });
    }
  }, [connectionStatus.connected, portfolio]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.portfolio);
      setSummary(response.summary);
      setAIInsights(response.aiInsights);
      setError(null);
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await portfolioAPI.getTransactions();
      setTransactions(response.transactions);
    } catch (err) {
      console.error('Transactions fetch error:', err);
    }
  };

  // const handleTransaction = async (transactionData) => {
  //   try {
  //     if (transactionType === 'BUY') {
  //       await portfolioAPI.buyStock(transactionData);
  //     } else {
  //       await portfolioAPI.sellStock(transactionData);
  //     }
      
  //     // Refresh data with error handling
  //     try {
  //       await fetchPortfolio();
  //       await fetchTransactions();
        
  //       // Re-subscribe to socket if connected
  //       if (connectionStatus.connected && portfolio?.holdings?.length > 0) {
  //         const symbols = portfolio.holdings.map(h => h.symbol);
  //         socketService.subscribeToPrices(symbols, (data) => {
  //           setRealTimePrices(prev => ({
  //             ...prev,
  //             [data.symbol]: data
  //           }));
  //           setLastUpdate(new Date());
  //         });
  //       }
  //     } catch (refreshError) {
  //       console.error('Error refreshing data:', refreshError);
  //       // Don't throw, just log - modal should still close
  //     }
      
  //     setShowTransactionModal(false);
  //   } catch (err) {
  //     console.error('Transaction error:', err);
  //     throw err;
  //   }
  // };
 const handleTransaction = async (transactionData) => {
    try {
      let response;
      if (transactionType === 'BUY') {
        response = await portfolioAPI.buyStock(transactionData);
      } else {
        response = await portfolioAPI.sellStock(transactionData);
      }
      
      // Refresh all data to ensure consistency
      await Promise.all([
        fetchPortfolio(),
        fetchTransactions()
      ]);
      
      setShowTransactionModal(false);
      
    } catch (err) {
      console.error('Transaction error:', err);
      throw err;
    }
  };
  const openTransactionModal = (type, symbol = '') => {
    setTransactionType(type);
    setSelectedSymbol(symbol);
    setShowTransactionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchPortfolio}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400">Manage your investments</p>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} title={connectionStatus.connected ? 'Connected' : 'Disconnected'}></div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => openTransactionModal('BUY')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Buy Stock
            </button>
            <button
              onClick={() => openTransactionModal('SELL')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sell Stock
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview 
          summary={summary} 
          realTimePrices={realTimePrices}
          lastUpdate={lastUpdate}
          holdings={portfolio?.holdings || []}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Holdings Table */}
            <HoldingsTable 
              holdings={portfolio?.holdings || []}
              realTimePrices={realTimePrices}
              onBuy={(symbol) => openTransactionModal('BUY', symbol)}
              onSell={(symbol) => openTransactionModal('SELL', symbol)}
            />

            {/* Mini Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio?.holdings?.slice(0, 4).map((holding) => (
                <MiniChart 
                  key={holding.symbol}
                  symbol={holding.symbol}
                  currentPrice={realTimePrices[holding.symbol]?.price || holding.currentPrice}
                />
              ))}
            </div>

            {/* Transaction History */}
            <TransactionHistory 
              transactions={transactions}
              onRefresh={fetchTransactions}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time P&L Indicator */}
            <RealTimePLIndicator 
              summary={summary}
              isRealTime={connectionStatus.connected}
              lastUpdate={lastUpdate}
              holdings={portfolio?.holdings || []}
              realTimePrices={realTimePrices}
            />

            {/* AI Insights */}
            <AIInsightsPanel 
              insights={aiInsights}
              holdings={portfolio?.holdings || []}
              realTimePrices={realTimePrices}
            />

            {/* Alerts */}
            <AlertsPanel 
              holdings={portfolio?.holdings || []}
              realTimePrices={realTimePrices}
            />

            {/* Recommendations */}
            {user?.id && (
              <RecommendationPanel userId={user.id} />
            )}
          </div>
        </div>

        {/* Transaction Modal */}
        {showTransactionModal && (
          <TransactionModal
            type={transactionType}
            symbol={selectedSymbol}
            onSubmit={handleTransaction}
            onClose={() => setShowTransactionModal(false)}
          />
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default PortfolioPage;