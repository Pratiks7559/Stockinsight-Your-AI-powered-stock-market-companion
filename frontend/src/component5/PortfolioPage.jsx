// PortfolioPage.jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import ChartsSection from './ChartsSection';
import HoldingsTable from './HoldingsTable';
import PortfolioControls from './PortfolioControl';
import PortfolioDashboard from './PortfolioDashboard';
import RiskInsights from './RiskInsights';
import TransactionHistory from './TransactionHistory';
import WatchlistSection from './WatchlistSection';
import PortfolioNews from './PortfolioNews';

const PortfolioPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activePortfolio, setActivePortfolio] = useState('Main Portfolio');
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  // Mock data for portfolio holdings
  useEffect(() => {
    const mockHoldings = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        buyPrice: 145.32,
        currentPrice: 175.43,
        avgCost: 145.32,
        sector: 'Technology',
        change: 2.3,
        changePercent: 1.33
      },
      {
        id: 2,
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 5,
        buyPrice: 285.64,
        currentPrice: 345.67,
        avgCost: 285.64,
        sector: 'Technology',
        change: 3.2,
        changePercent: 0.93
      },
      {
        id: 3,
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        quantity: 20,
        buyPrice: 2450.75,
        currentPrice: 2845.60,
        avgCost: 2450.75,
        sector: 'Energy',
        change: 12.5,
        changePercent: 0.44
      },
      {
        id: 4,
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        quantity: 8,
        buyPrice: 215.40,
        currentPrice: 245.67,
        avgCost: 215.40,
        sector: 'Automotive',
        change: -4.2,
        changePercent: -1.68
      },
      {
        id: 5,
        symbol: 'INFY',
        name: 'Infosys Ltd',
        quantity: 25,
        buyPrice: 1650.50,
        currentPrice: 1842.75,
        avgCost: 1650.50,
        sector: 'Technology',
        change: 5.8,
        changePercent: 0.32
      }
    ];

    const mockTransactions = [
      {
        id: 1,
        date: '2023-10-15',
        type: 'Buy',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        price: 145.32,
        total: 1453.20
      },
      {
        id: 2,
        date: '2023-10-10',
        type: 'Buy',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 5,
        price: 285.64,
        total: 1428.20
      },
      {
        id: 3,
        date: '2023-10-05',
        type: 'Buy',
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        quantity: 20,
        price: 2450.75,
        total: 49015.00
      },
      {
        id: 4,
        date: '2023-10-01',
        type: 'Sell',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        quantity: 3,
        price: 135.42,
        total: 406.26
      },
      {
        id: 5,
        date: '2023-09-28',
        type: 'Buy',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        quantity: 8,
        price: 215.40,
        total: 1723.20
      },
      {
        id: 6,
        date: '2023-09-25',
        type: 'Buy',
        symbol: 'INFY',
        name: 'Infosys Ltd',
        quantity: 25,
        price: 1650.50,
        total: 41262.50
      }
    ];

    const mockWatchlist = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.3, changePercent: 1.33 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 345.67, change: 3.2, changePercent: 0.93 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 145.89, change: 1.5, changePercent: 1.04 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.23, change: -0.8, changePercent: -0.45 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.25, change: 2.8, changePercent: 0.17 }
    ];

    setHoldings(mockHoldings);
    setTransactions(mockTransactions);
    setWatchlist(mockWatchlist);
  }, []);

  // Calculate portfolio metrics
  const investedCapital = holdings.reduce((total, holding) => total + (holding.quantity * holding.buyPrice), 0);
  const currentValue = holdings.reduce((total, holding) => total + (holding.quantity * holding.currentPrice), 0);
  const profitLoss = currentValue - investedCapital;
  const profitLossPercent = investedCapital > 0 ? (profitLoss / investedCapital) * 100 : 0;

  const todayChange = holdings.reduce((total, holding) => {
    return total + (holding.quantity * holding.currentPrice * (holding.changePercent / 100));
  }, 0);

  const todayChangePercent = currentValue > 0 ? (todayChange / currentValue) * 100 : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-gray-500">Track and manage your investments</p>
          </div>
          
          <PortfolioControls 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            activePortfolio={activePortfolio}
            setActivePortfolio={setActivePortfolio}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Dashboard */}
            <PortfolioDashboard 
              investedCapital={investedCapital}
              currentValue={currentValue}
              profitLoss={profitLoss}
              profitLossPercent={profitLossPercent}
              todayChange={todayChange}
              todayChangePercent={todayChangePercent}
              darkMode={darkMode}
            />

            {/* Holdings Table */}
            <HoldingsTable 
              holdings={holdings}
              darkMode={darkMode}
            />

            {/* Charts Section */}
            <ChartsSection 
              holdings={holdings}
              selectedTimeframe={selectedTimeframe}
              setSelectedTimeframe={setSelectedTimeframe}
              darkMode={darkMode}
            />

            {/* Transaction History */}
            <TransactionHistory 
              transactions={transactions}
              darkMode={darkMode}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Watchlist Section */}
            <WatchlistSection 
              watchlist={watchlist}
              darkMode={darkMode}
            />

            {/* Risk & Insights */}
            <RiskInsights 
              holdings={holdings}
              darkMode={darkMode}
            />

            {/* Portfolio News */}
            <PortfolioNews 
              holdings={holdings}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;