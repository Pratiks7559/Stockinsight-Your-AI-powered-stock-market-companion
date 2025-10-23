import { useState, useEffect } from 'react';
import axios from 'axios';

const StockNewsPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStocks, setSelectedStocks] = useState('all');
  const [marketCapFilter, setMarketCapFilter] = useState('all');
  const [marketImpactFilter, setMarketImpactFilter] = useState('all');
  const [newsType, setNewsType] = useState('stock-market');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Fetch stock-specific real-time news
  const fetchStockNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/news/stock-news', {
        params: {
          symbols: selectedStocks,
          sector: selectedSector,
          marketCap: marketCapFilter,
          pageSize: 100
        }
      });
      setNewsArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock news:', err);
      setError('Failed to fetch stock news');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch regular news
  const fetchNews = async (category = 'business') => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/news', {
        params: {
          category: category === 'all' ? 'business' : category,
          country: 'us',
          pageSize: 50
        }
      });
      setNewsArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // Search news function
  const searchNews = async (query) => {
    if (!query.trim()) {
      fetchNews(activeCategory);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/news/search', {
        params: {
          q: query,
          pageSize: 50,
          sortBy: 'publishedAt'
        }
      });
      setNewsArticles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error searching news:', err);
      setError('Failed to search news');
    } finally {
      setLoading(false);
    }
  };

  // Handle news fetching based on type
  const handleFetchNews = () => {
    if (newsType === 'stock-market') {
      fetchStockNews();
    } else {
      fetchNews(activeCategory);
    }
  };
  
  // Fetch news on component mount and set up auto-refresh
  useEffect(() => {
    handleFetchNews();
    
    const refreshInterval = newsType === 'stock-market' ? 10 * 60 * 1000 : 15 * 60 * 1000;
    const interval = setInterval(handleFetchNews, refreshInterval);
    
    return () => clearInterval(interval);
  }, [activeCategory, newsType, selectedSector, selectedStocks, marketCapFilter]);

  // Search when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchNews(searchQuery);
      } else {
        fetchNews(activeCategory);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const [stockTickerData, setStockTickerData] = useState([]);
  const [tickerLoading, setTickerLoading] = useState(true);

  // Fetch real-time stock data from TwelveData API
  const fetchTickerData = async () => {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
    const API_KEY = '225b1e653af84cb28a9ff4b13e409eea';
    
    try {
      const promises = symbols.map(async (symbol) => {
        const response = await axios.get(`https://api.twelvedata.com/quote`, {
          params: {
            symbol: symbol,
            apikey: API_KEY
          }
        });
        
        const data = response.data;
        return {
          symbol: data.symbol,
          name: data.name || symbol,
          price: parseFloat(data.close || 0),
          change: parseFloat(data.change || 0),
          changePercent: parseFloat(data.percent_change || 0)
        };
      });
      
      const tickerData = await Promise.all(promises);
      setStockTickerData(tickerData.filter(stock => stock.price > 0));
    } catch (error) {
      console.error('Error fetching TwelveData ticker:', error);
    } finally {
      setTickerLoading(false);
    }
  };

  // Fetch ticker data on mount and set up auto-refresh
  useEffect(() => {
    fetchTickerData();
    const tickerInterval = setInterval(fetchTickerData, 30000); // Update every 30 seconds
    return () => clearInterval(tickerInterval);
  }, []);

  // Sample user portfolio
  const userPortfolio = ['AAPL', 'MSFT', 'TSLA'];

  // Advanced stock market filtering
  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.relatedStocks?.some(stock => stock.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSentiment = sentimentFilter === 'all' || article.sentiment === sentimentFilter;
    const matchesMarketImpact = marketImpactFilter === 'all' || article.marketImpact === marketImpactFilter;
    
    return matchesCategory && matchesSearch && matchesSentiment && matchesMarketImpact;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.publishedAt || b.time) - new Date(a.publishedAt || a.time);
    } else {
      // For "impactful" we might use engagement metrics in a real app
      return b.id - a.id;
    }
  });

  // Toggle bookmark
  const toggleBookmark = (articleId) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
  };

  // Featured article (first article)
  const featuredArticle = sortedArticles[0];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      {/* <header className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold">StockInsight</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Breaking News Ticker */}
      <div className={`py-2 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} overflow-hidden`}>
        {tickerLoading ? (
          <div className="flex justify-center items-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm">Loading real-time prices...</span>
          </div>
        ) : (
          <div className="flex animate-marquee whitespace-nowrap">
            {stockTickerData.map((stock, index) => (
              <div key={index} className="flex items-center mx-4">
                <span className="font-semibold mr-1">{stock.symbol}</span>
                <span className="mx-1">${stock.price.toFixed(2)}</span>
                <span className={stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{(stock.changePercent * 100).toFixed(2)}%)
                </span>
              </div>
            ))}
            {/* Duplicate for seamless animation */}
            {stockTickerData.map((stock, index) => (
              <div key={`dup-${index}`} className="flex items-center mx-4">
                <span className="font-semibold mr-1">{stock.symbol}</span>
                <span className="mx-1">${stock.price.toFixed(2)}</span>
                <span className={stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{(stock.changePercent * 100).toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg">Loading real-time news...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
              <button 
                onClick={fetchNews}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <>
        {/* Hero Section */}
        {featuredArticle && (
          <div className={`rounded-xl shadow-lg overflow-hidden mb-8 transition-transform duration-300 hover:scale-[1.02] ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-1/3">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    featuredArticle.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                    featuredArticle.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {featuredArticle.sentiment.charAt(0).toUpperCase() + featuredArticle.sentiment.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">{featuredArticle.time}</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">{featuredArticle.title}</h2>
                <p className="mb-4 text-gray-700">{featuredArticle.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{featuredArticle.source}</span>
                  <button 
                    onClick={() => toggleBookmark(featuredArticle.id)}
                    className={`p-2 rounded-full ${bookmarkedArticles.has(featuredArticle.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Market News Filters */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          {/* News Type Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setNewsType('stock-market')}
                className={`px-4 py-2 rounded-lg font-medium ${newsType === 'stock-market' ? 
                  'bg-gradient-to-r from-green-500 to-blue-500 text-white' : 
                  darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📈 Stock Market News
              </button>
              <button
                onClick={() => setNewsType('general')}
                className={`px-4 py-2 rounded-lg font-medium ${newsType === 'general' ? 
                  'bg-gradient-to-r from-green-500 to-blue-500 text-white' : 
                  darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📰 General News
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder={newsType === 'stock-market' ? "Search stocks, tickers, or financial news..." : "Search news, sources, or keywords..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
              />
            </div>
          </div>
          
          {newsType === 'stock-market' ? (
            <>
              {/* Stock Sectors */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">📊 Market Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {['all', 'technology', 'healthcare', 'finance', 'energy', 'retail'].map(sector => (
                    <button
                      key={sector}
                      onClick={() => setSelectedSector(sector)}
                      className={`px-3 py-2 rounded-lg capitalize text-sm ${selectedSector === sector ? 
                        'bg-gradient-to-r from-green-500 to-blue-500 text-white' : 
                        darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {sector === 'all' ? '🌐 All Sectors' : sector}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Stock Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">🏢 Stocks</label>
                  <select 
                    value={selectedStocks}
                    onChange={(e) => setSelectedStocks(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  >
                    <option value="all">All Stocks</option>
                    <option value="AAPL,MSFT,GOOGL">FAANG Stocks</option>
                    <option value="TSLA,NVDA,AMD">Tech Growth</option>
                    <option value="JPM,BAC,WFC">Banking</option>
                    <option value="JNJ,PFE,MRNA">Healthcare</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">📈 Market Impact</label>
                  <select 
                    value={marketImpactFilter}
                    onChange={(e) => setMarketImpactFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  >
                    <option value="all">All Impact</option>
                    <option value="bullish">🟢 Bullish</option>
                    <option value="bearish">🔴 Bearish</option>
                    <option value="neutral">⚪ Neutral</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">😊 Sentiment</label>
                  <select 
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  >
                    <option value="all">All Sentiment</option>
                    <option value="positive">😊 Positive</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="negative">😞 Negative</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">📂 Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'business', 'technology', 'health', 'sports', 'entertainment', 'science'].map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-2 rounded-lg capitalize text-sm ${activeCategory === category ? 
                      'bg-gradient-to-r from-green-500 to-blue-500 text-white' : 
                      darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category === 'all' ? 'All News' : category}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Bottom Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                <option value="recent">⏰ Most Recent</option>
                <option value="impactful">🔥 Most Impactful</option>
              </select>
              
              <button
                onClick={handleFetchNews}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Load News
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📊 Showing {filteredArticles.length} of {newsArticles.length} articles
            </p>
          </div>
        </div>

        {/* For You Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.filter(article => 
              article.relatedStocks.some(stock => userPortfolio.includes(stock))
            ).slice(0, 3).map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                darkMode={darkMode} 
                isBookmarked={bookmarkedArticles.has(article.id)}
                toggleBookmark={toggleBookmark}
                userPortfolio={userPortfolio}
              />
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4">Market News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                darkMode={darkMode} 
                isBookmarked={bookmarkedArticles.has(article.id)}
                toggleBookmark={toggleBookmark}
                userPortfolio={userPortfolio}
              />
            ))}
          </div>
        </div>

        {/* Auto Refresh Info */}
        <div className="flex justify-center mt-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              {newsType === 'stock-market' ? '🔄 Auto-refresh every 10 minutes' : '🔄 Auto-refresh every 15 minutes'}
            </p>
            <button 
              onClick={handleFetchNews}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
};

// Article Card Component
const ArticleCard = ({ article, darkMode, isBookmarked, toggleBookmark, userPortfolio }) => {
  const hasRelatedStock = article.relatedStocks.some(stock => userPortfolio.includes(stock));
  
  return (
    <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="relative">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-48 object-cover"
        />
        {hasRelatedStock && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            In Your Portfolio
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            article.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
            article.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
          </span>
          <span className="text-sm text-gray-500">{article.time}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-700 mb-4 line-clamp-3">{article.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{article.source}</span>
          <button 
            onClick={() => toggleBookmark(article.id)}
            className={`p-1 rounded-full ${isBookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockNewsPage;
