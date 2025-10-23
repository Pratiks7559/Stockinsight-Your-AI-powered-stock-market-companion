import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper function for API requests
async function cachedApiRequest(url, cache, cacheKey, ttl = 30) {
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(url);
    cache.set(cacheKey, response.data, ttl);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.message);
    throw new Error('Failed to fetch data from external API');
  }
}

router.get('/', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }

    const symbolList = symbols.split(',');
    const quotes = [];
    const { cache, API_CONFIG } = req.app.locals;

    const fallbackData = {
      'AAPL': { name: 'Apple Inc.', price: 175.34 },
      'MSFT': { name: 'Microsoft Corporation', price: 337.69 },
      'GOOGL': { name: 'Alphabet Inc.', price: 130.29 },
      'AMZN': { name: 'Amazon.com Inc.', price: 142.56 },
      'TSLA': { name: 'Tesla, Inc.', price: 210.23 },
      'NVDA': { name: 'NVIDIA Corporation', price: 435.70 },
      'META': { name: 'Meta Platforms Inc.', price: 298.45 },
      'NFLX': { name: 'Netflix Inc.', price: 456.78 },
      'TCS.NSE': { name: 'Tata Consultancy Services', price: 3245.50 },
      'RELIANCE.NSE': { name: 'Reliance Industries Ltd.', price: 2456.75 },
      'INFY.NSE': { name: 'Infosys Limited', price: 1567.80 },
      'HDFCBANK.NSE': { name: 'HDFC Bank Limited', price: 1634.25 },
      'ICICIBANK.NSE': { name: 'ICICI Bank Limited', price: 987.60 },
      'SBIN.NSE': { name: 'State Bank of India', price: 567.45 },
      'ITC.NSE': { name: 'ITC Limited', price: 456.30 },
      'HINDUNILVR.NSE': { name: 'Hindustan Unilever Ltd.', price: 2345.67 },
      'BAJFINANCE.NSE': { name: 'Bajaj Finance Limited', price: 6789.45 },
      'KOTAKBANK.NSE': { name: 'Kotak Mahindra Bank Ltd.', price: 1789.56 }
    };

    for (const symbol of symbolList) {
      try {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.quotes}?symbol=${symbol}&apikey=${API_CONFIG.apiKey}`;
        const data = await cachedApiRequest(url, cache, `quote_${symbol}`, 15);
        
        quotes.push({
          symbol: data.symbol || symbol,
          name: data.name || fallbackData[symbol]?.name || symbol,
          price: data.close ? parseFloat(data.close) : fallbackData[symbol]?.price || Math.random() * 500 + 50,
          change: data.change ? parseFloat(data.change) : (Math.random() - 0.5) * 10,
          changePercent: data.percent_change ? parseFloat(data.percent_change) : (Math.random() - 0.5) * 5,
          timestamp: new Date().toISOString()
        });
      } catch (symbolError) {
        const fallback = fallbackData[symbol] || { name: symbol, price: Math.random() * 500 + 50 };
        quotes.push({
          symbol: symbol,
          name: fallback.name,
          price: fallback.price,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json(quotes);
  } catch (error) {
    console.error('Quotes error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;