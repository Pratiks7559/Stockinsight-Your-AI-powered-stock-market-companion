// Markets.jsx
import React, { useState, useEffect } from 'react';
import './Markets.css';

const Markets = ({ isDarkMode, isLoggedIn }) => {
  const [timeRange, setTimeRange] = useState('1D');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [watchlist, setWatchlist] = useState([]);

  // Dummy data for market indices
  const marketIndices = [
    { name: 'Nifty 50', value: 22419.95, change: 1.62 },
    { name: 'Sensex', value: 73872.29, change: 1.23 },
    { name: 'Nasdaq', value: 16340.87, change: -0.36 },
    { name: 'Dow Jones', value: 38791.35, change: -0.41 }
  ];

  // Dummy data for top stocks
  const topGainers = [
    { symbol: 'RELIANCE', price: 2856.15, change: 3.2 },
    { symbol: 'HDFCBANK', price: 1520.75, change: 2.8 },
    { symbol: 'INFY', price: 1850.40, change: 2.5 },
    { symbol: 'TCS', price: 3950.20, change: 2.1 }
  ];

  const topLosers = [
    { symbol: 'WIPRO', price: 485.30, change: -2.3 },
    { symbol: 'ONGC', price: 235.75, change: -1.9 },
    { symbol: 'ITC', price: 425.60, change: -1.5 },
    { symbol: 'HINDUNILVR', price: 2450.80, change: -1.2 }
  ];

  const mostActive = [
    { symbol: 'RELIANCE', price: 2856.15, volume: '15.2M' },
    { symbol: 'SBIN', price: 755.40, volume: '12.8M' },
    { symbol: 'INFY', price: 1850.40, volume: '10.5M' },
    { symbol: 'HDFCBANK', price: 1520.75, volume: '9.7M' }
  ];

  // Dummy data for news
  const marketNews = [
    { 
      id: 1, 
      headline: 'RBI Keeps Repo Rate Unchanged at 6.5%', 
      source: 'Economic Times',
      logo: '📰'
    },
    { 
      id: 2, 
      headline: 'IT Sector Shows Strong Q4 Earnings', 
      source: 'Business Standard',
      logo: '💼'
    },
    { 
      id: 3, 
      headline: 'Government Announces Infrastructure Boost', 
      source: 'Financial Express',
      logo: '🏗️'
    },
    { 
      id: 4, 
      headline: 'Global Markets React to Fed Policy Decision', 
      source: 'Bloomberg',
      logo: '🌎'
    }
  ];

  // Dummy data for sector performance
  const sectorPerformance = [
    { name: 'IT', performance: 2.5 },
    { name: 'Banking', performance: 1.8 },
    { name: 'Pharma', performance: -0.7 },
    { name: 'Auto', performance: 0.9 },
    { name: 'FMCG', performance: 1.2 },
    { name: 'Energy', performance: -1.1 }
  ];

  // Dummy watchlist data
  const sampleWatchlist = [
    { symbol: 'RELIANCE', price: 2856.15, change: 3.2 },
    { symbol: 'INFY', price: 1850.40, change: 2.5 },
    { symbol: 'HDFCBANK', price: 1520.75, change: 2.8 }
  ];

  // Initialize watchlist based on login status
  useEffect(() => {
    if (isLoggedIn) {
      // In a real app, this would come from an API or context
      setWatchlist(sampleWatchlist);
    }
  }, [isLoggedIn]);

  // Function to generate dummy chart data
  const generateChartData = () => {
    const data = [];
    const points = timeRange === '1D' ? 24 : 
                  timeRange === '5D' ? 40 : 
                  timeRange === '1M' ? 30 : 
                  timeRange === '6M' ? 26 : 52;
    
    let value = 100;
    for (let i = 0; i < points; i++) {
      value += Math.random() * 4 - 2;
      data.push(value);
    }
    return data;
  };

  const [chartData, setChartData] = useState(generateChartData());

  // Regenerate chart data when time range changes
  useEffect(() => {
    setChartData(generateChartData());
  }, [timeRange, selectedStock]);

  return (
    <div className={`markets-page ${isDarkMode ? 'dark' : 'light'}`}>
      <h1 className="markets-title">Markets Overview</h1>
      
      {/* Market Overview Dashboard */}
      <section className="market-overview">
        <h2>Market Indices</h2>
        <div className="indices-grid">
          {marketIndices.map((index, i) => (
            <div key={i} className="index-card">
              <h3>{index.name}</h3>
              <p className="index-value">{index.value.toLocaleString()}</p>
              <p className={`index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                {index.change >= 0 ? '+' : ''}{index.change}%
              </p>
            </div>
          ))}
        </div>
        
        <div className="stocks-section">
          <div className="stocks-column">
            <h3>Top Gainers</h3>
            {topGainers.map((stock, i) => (
              <div key={i} className="stock-item">
                <span className="stock-symbol">{stock.symbol}</span>
                <span className="stock-price">₹{stock.price.toFixed(2)}</span>
                <span className="stock-change positive">+{stock.change}%</span>
              </div>
            ))}
          </div>
          
          <div className="stocks-column">
            <h3>Top Losers</h3>
            {topLosers.map((stock, i) => (
              <div key={i} className="stock-item">
                <span className="stock-symbol">{stock.symbol}</span>
                <span className="stock-price">₹{stock.price.toFixed(2)}</span>
                <span className="stock-change negative">{stock.change}%</span>
              </div>
            ))}
          </div>
          
          <div className="stocks-column">
            <h3>Most Active</h3>
            {mostActive.map((stock, i) => (
              <div key={i} className="stock-item">
                <span className="stock-symbol">{stock.symbol}</span>
                <span className="stock-price">₹{stock.price.toFixed(2)}</span>
                <span className="stock-volume">{stock.volume}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Interactive Stock Charts */}
      <section className="charts-section">
        <h2>Interactive Charts</h2>
        <div className="chart-controls">
          <select 
            value={selectedStock} 
            onChange={(e) => setSelectedStock(e.target.value)}
            className="stock-selector"
          >
            <option value="AAPL">Apple (AAPL)</option>
            <option value="RELIANCE">Reliance (RELIANCE)</option>
            <option value="INFY">Infosys (INFY)</option>
            <option value="HDFCBANK">HDFC Bank (HDFCBANK)</option>
          </select>
          
          <div className="time-range-selector">
            {['1D', '5D', '1M', '6M', '1Y'].map(range => (
              <button
                key={range}
                className={timeRange === range ? 'active' : ''}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="chart-container">
          <div className="stock-chart">
            {chartData.map((value, i) => (
              <div 
                key={i} 
                className="chart-bar" 
                style={{ height: `${(value - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData)) * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="technical-indicators">
          <h3>Technical Indicators</h3>
          <div className="indicators-grid">
            <div className="indicator">
              <span className="indicator-name">RSI</span>
              <span className="indicator-value">62.5</span>
            </div>
            <div className="indicator">
              <span className="indicator-name">MACD</span>
              <span className="indicator-value">0.25</span>
            </div>
            <div className="indicator">
              <span className="indicator-name">MA(50)</span>
              <span className="indicator-value">148.72</span>
            </div>
          </div>
        </div>
      </section>
      
      <div className="lower-sections">
        {/* News & Insights */}
        <section className="news-section">
          <h2>Market News & Insights</h2>
          <div className="news-grid">
            {marketNews.map(news => (
              <div key={news.id} className="news-card">
                <div className="news-logo">{news.logo}</div>
                <h3>{news.headline}</h3>
                <p className="news-source">{news.source}</p>
                <button className="read-more-btn">Read More</button>
              </div>
            ))}
          </div>
        </section>
        
        {/* Portfolio / Watchlist Preview */}
        <section className="watchlist-section">
          <h2>{isLoggedIn ? 'Your Watchlist' : 'Sample Watchlist'}</h2>
          {isLoggedIn && watchlist.length > 0 ? (
            <div className="watchlist-stocks">
              {watchlist.map((stock, i) => (
                <div key={i} className="watchlist-item">
                  <span className="stock-symbol">{stock.symbol}</span>
                  <span className="stock-price">₹{stock.price.toFixed(2)}</span>
                  <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="watchlist-cta">
              <p>Create a personalized watchlist to track your favorite stocks</p>
              <button className="cta-button">Create Your Portfolio</button>
            </div>
          )}
        </section>
      </div>
      
      {/* Market Analysis & Insights */}
      <section className="market-analysis">
        <h2>Sector Performance Heatmap</h2>
        <div className="sector-heatmap">
          {sectorPerformance.map(sector => (
            <div key={sector.name} className="sector-item">
              <span className="sector-name">{sector.name}</span>
              <div 
                className="performance-bar" 
                style={{ 
                  width: `${Math.abs(sector.performance) * 30}px`,
                  backgroundColor: sector.performance >= 0 ? 
                    (isDarkMode ? 'rgba(0, 255, 0, 0.6)' : 'rgba(0, 200, 0, 0.7)') : 
                    (isDarkMode ? 'rgba(255, 0, 0, 0.6)' : 'rgba(255, 0, 0, 0.7)')
                }}
              ></div>
              <span className={`sector-performance ${sector.performance >= 0 ? 'positive' : 'negative'}`}>
                {sector.performance >= 0 ? '+' : ''}{sector.performance}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Markets;