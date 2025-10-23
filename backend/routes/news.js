import express from 'express';
import axios from 'axios';

const router = express.Router();

// Stock market specific news endpoint
router.get('/stock-news', async (req, res) => {
  try {
    const { 
      symbols = 'AAPL,MSFT,GOOGL,TSLA,AMZN', 
      sector = 'all',
      marketCap = 'all',
      pageSize = 100,
      sortBy = 'publishedAt'
    } = req.query;
    
    const apiKey = process.env.NEWS_API_KEY;
    
    // Stock market specific keywords
    const stockKeywords = [
      'stock market', 'NYSE', 'NASDAQ', 'S&P 500', 'Dow Jones',
      'earnings', 'dividend', 'IPO', 'merger', 'acquisition',
      'bull market', 'bear market', 'trading', 'investment',
      'financial results', 'quarterly report', 'SEC filing'
    ];
    
    // Add sector-specific keywords
    const sectorKeywords = {
      technology: ['tech stocks', 'software', 'AI', 'cloud computing', 'semiconductor'],
      healthcare: ['pharma', 'biotech', 'medical device', 'healthcare'],
      finance: ['banking', 'fintech', 'insurance', 'credit'],
      energy: ['oil', 'gas', 'renewable energy', 'solar', 'wind'],
      retail: ['e-commerce', 'consumer', 'retail sales', 'shopping']
    };
    
    let searchQuery = stockKeywords.join(' OR ');
    if (sector !== 'all' && sectorKeywords[sector]) {
      searchQuery += ' AND (' + sectorKeywords[sector].join(' OR ') + ')';
    }
    
    // Add specific stock symbols
    if (symbols !== 'all') {
      const symbolArray = symbols.split(',');
      searchQuery += ' AND (' + symbolArray.join(' OR ') + ')';
    }
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&pageSize=${pageSize}&sortBy=${sortBy}&language=en&apiKey=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.articles) {
      const formattedNews = data.articles
        .filter(article => article.title && article.description)
        .map(article => {
          // Extract potential stock symbols from title and description
          const text = `${article.title} ${article.description}`.toUpperCase();
          const stockSymbols = [];
          const commonStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
          
          commonStocks.forEach(symbol => {
            if (text.includes(symbol)) {
              stockSymbols.push(symbol);
            }
          });
          
          // Determine market impact based on keywords
          const bullishKeywords = ['surge', 'rally', 'gains', 'up', 'rise', 'positive', 'beat', 'exceed'];
          const bearishKeywords = ['fall', 'drop', 'decline', 'down', 'loss', 'negative', 'miss', 'below'];
          
          let sentiment = 'neutral';
          const lowerText = text.toLowerCase();
          
          if (bullishKeywords.some(keyword => lowerText.includes(keyword))) {
            sentiment = 'positive';
          } else if (bearishKeywords.some(keyword => lowerText.includes(keyword))) {
            sentiment = 'negative';
          }
          
          return {
            id: article.url || Math.random().toString(36),
            title: article.title,
            description: article.description,
            source: article.source.name,
            time: new Date(article.publishedAt).toLocaleString(),
            category: 'stock-market',
            sentiment: sentiment,
            image: article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            url: article.url,
            relatedStocks: stockSymbols,
            publishedAt: article.publishedAt,
            marketImpact: sentiment === 'positive' ? 'bullish' : sentiment === 'negative' ? 'bearish' : 'neutral'
          };
        });
      
      res.json(formattedNews);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Stock news error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search news endpoint
router.get('/search', async (req, res) => {
  try {
    const { q = 'stock market', pageSize = 50, sortBy = 'publishedAt' } = req.query;
    const apiKey = process.env.NEWS_API_KEY;
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=${pageSize}&sortBy=${sortBy}&apiKey=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.articles) {
      const formattedNews = data.articles.map(article => ({
        id: article.url || Math.random().toString(36),
        title: article.title,
        description: article.description || article.content,
        source: article.source.name,
        time: new Date(article.publishedAt).toLocaleString(),
        category: 'search',
        sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
        image: article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        url: article.url,
        relatedStocks: [],
        publishedAt: article.publishedAt
      }));
      
      res.json(formattedNews);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Search news error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category = 'business', country = 'us', pageSize = 50 } = req.query;
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'NewsAPI key not configured' });
    }

    const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.articles && data.articles.length > 0) {
        const formattedNews = data.articles.map(article => ({
          id: article.url || Math.random().toString(36),
          title: article.title,
          description: article.description || article.content,
          source: article.source.name,
          time: new Date(article.publishedAt).toLocaleString(),
          category: category,
          sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
          image: article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          url: article.url,
          relatedStocks: [],
          publishedAt: article.publishedAt
        }));
        
        res.json(formattedNews);
      } else {
        res.status(400).json({ error: 'No news data available from NewsAPI' });
      }
    } catch (apiError) {
      console.error('NewsAPI Error:', apiError.message);
      // Fallback dummy news data
      const fallbackNews = [
        {
          id: '1',
          title: 'Stock Market Reaches New Heights',
          source: 'Financial Times',
          url: '#',
          publishedAt: new Date().toISOString(),
          description: 'Major indices continue their upward trend as investors remain optimistic.',
          sentiment: 'positive',
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          relatedStocks: []
        },
        {
          id: '2',
          title: 'Tech Stocks Show Strong Performance',
          source: 'Reuters',
          url: '#',
          publishedAt: new Date().toISOString(),
          description: 'Technology sector leads market gains with impressive quarterly results.',
          sentiment: 'positive',
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          relatedStocks: []
        }
      ];
      res.json(fallbackNews);
    }
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;