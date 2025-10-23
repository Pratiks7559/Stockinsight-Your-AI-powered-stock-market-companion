// Markets.jsx
import { useState } from 'react';
import IndicesOverview from '../indices/IndicesOverview';
import StockChart from '../stockchart/StockChart';
import TopMovers from '../topmovers/TopMovers';
import MostActive from '../mostactive/MostActive';
import SectorHeatmap from '../sectorheatmap/SectorHeatmap';
import Watchlist from '../watchlist/Watchlist';
import MarketNewsSidebar from '../marketnews/MarketNewsSidebar';
import MarketCalendar from '../marketcalender/MarketCalender';
import StockSearch from '../stocksearch/StockSearch';

const Markets = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1D');
  const [searchFilters, setSearchFilters] = useState({
    sector: '',
    marketCap: ''
  });

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-2">Markets Dashboard</h1>
        <p className="text-gray-400 mb-6">Track real-time market data and trends</p>
        
        {/* Search and Filters */}
        <StockSearch 
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Indices Overview */}
            <IndicesOverview />
            
            {/* Chart Section */}
            <StockChart 
              selectedStock={selectedStock}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
            
            {/* Top Movers and Most Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopMovers type="gainers" />
              <TopMovers type="losers" />
            </div>
            
            <MostActive />
            
            {/* Sector Heatmap */}
            <SectorHeatmap />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <Watchlist />
            <MarketNewsSidebar />
            <MarketCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;