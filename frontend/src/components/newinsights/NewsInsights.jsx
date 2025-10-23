// components/NewsInsights.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const NewsInsights = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 10 * 60 * 1000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const stockSymbols = ['AAPL,MSFT,GOOGL', 'TSLA,AMZN,NVDA', 'META,NFLX,AMD', 'JPM,V,MA', 'JNJ,PG,KO'];
      const randomSymbols = stockSymbols[Math.floor(Math.random() * stockSymbols.length)];
      
      const response = await axios.get('/api/news/stock-news', {
        params: {
          symbols: randomSymbols,
          pageSize: 12,
          sortBy: 'publishedAt'
        }
      });
      
      const shuffledNews = response.data.sort(() => Math.random() - 0.5);
      setNews(shuffledNews.slice(0, 6));
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
      setNews([
        {
          id: 1,
          title: 'Federal Reserve Holds Interest Rates Steady Amid Inflation Concerns',
          source: 'Financial Times',
          time: '2 hours ago',
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Market News & Insights</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(item => (
              <div key={item.id} className="bg-slate-900 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="h-48 bg-slate-700 overflow-hidden">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  )}
                  <a 
                    href={item.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-medium flex items-center"
                  >
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <button 
            onClick={fetchNews}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh News
          </button>
        </div>
      </div>
    </section>
  )
}

export default NewsInsights