import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TWELVEDATA_API_KEY || process.env.TWELVE_API_KEY2;
const BASE_URL = 'https://api.twelvedata.com';

if (!API_KEY || API_KEY === 'demo') {
  console.error('TwelveData API key required');
}

// In-memory cache with TTL
const priceCache = new Map();
const CACHE_TTL = 60000; // 60 seconds cache to reduce API calls
const REQUEST_QUEUE = [];
const MAX_REQUESTS_PER_MINUTE = 8; // Conservative limit
let requestCount = 0;
let lastResetTime = Date.now();

// Rate limiting function
const canMakeRequest = () => {
  const now = Date.now();
  if (now - lastResetTime > 60000) { // Reset every minute
    requestCount = 0;
    lastResetTime = now;
  }
  return requestCount < MAX_REQUESTS_PER_MINUTE;
};

// Queue management
const processQueue = async () => {
  if (REQUEST_QUEUE.length === 0 || !canMakeRequest()) return;
  
  const { symbols, resolve, reject } = REQUEST_QUEUE.shift();
  try {
    requestCount++;
    const result = await fetchStockDataFromAPI(symbols);
    resolve(result);
  } catch (error) {
    reject(error);
  }
  
  // Process next request after delay
  setTimeout(processQueue, 1000);
};

// Only use symbols that work with TwelveData API
const formatSymbol = (symbol) => {
  return symbol; // Use symbol as-is, no Indian stock mapping
};

// Check cache first
const getCachedData = (symbol) => {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

// Cache data
const setCachedData = (symbol, data) => {
  priceCache.set(symbol, {
    data,
    timestamp: Date.now()
  });
};

// Actual API call function
const fetchStockDataFromAPI = async (symbols) => {
  const results = [];
  
  for (const symbol of symbols) {
    const formattedSymbol = formatSymbol(symbol);
    
    try {
      const response = await axios.get(`${BASE_URL}/quote`, {
        params: {
          symbol: formattedSymbol,
          apikey: API_KEY
        },
        timeout: 12000
      });
      
      if (response.data && response.data.symbol && response.data.close) {
        const item = response.data;
        const stockData = {
          symbol: symbol,
          name: item.name || symbol,
          price: parseFloat(item.close || item.price || 0),
          change: parseFloat(item.change || 0),
          changePercent: parseFloat(item.percent_change || 0),
          open: parseFloat(item.open || 0),
          high: parseFloat(item.high || 0),
          low: parseFloat(item.low || 0),
          volume: parseInt(item.volume || 0),
          sentiment: getSentimentFromChange(parseFloat(item.percent_change || 0)),
        };
        
        // Cache the result
        setCachedData(symbol, stockData);
        results.push(stockData);
      } else {
        console.error(`No data available for ${symbol}`);
        results.push({
          symbol,
          name: `${symbol} Company`,
          price: 0,
          change: 0,
          changePercent: 0,
          sentiment: 'neutral',
          error: 'Data not available'
        });
      }
    } catch (error) {
      console.error(`API failed for ${symbol}:`, error.message);
      results.push({
        symbol,
        name: `${symbol} Company`,
        price: 0,
        change: 0,
        changePercent: 0,
        sentiment: 'neutral',
        error: 'Data not available'
      });
    }
  }
  
  return results;
};

// Main function with caching and rate limiting
export const getStockData = async (symbols, retries = 1) => {
  if (!API_KEY || API_KEY === 'demo') {
    throw new Error('TwelveData API key required');
  }

  const results = [];
  const symbolsToFetch = [];
  
  // Check cache first
  for (const symbol of symbols) {
    const cached = getCachedData(symbol);
    if (cached) {
      results.push(cached);
    } else {
      symbolsToFetch.push(symbol);
    }
  }
  
  // If all symbols are cached, return immediately
  if (symbolsToFetch.length === 0) {
    return results;
  }
  
  // If we can make requests immediately
  if (canMakeRequest()) {
    try {
      requestCount++;
      const apiResults = await fetchStockDataFromAPI(symbolsToFetch);
      results.push(...apiResults);
    } catch (error) {
      console.error('API request failed:', error);
      // Add fallback data for failed requests
      symbolsToFetch.forEach(symbol => {
        results.push({
          symbol,
          name: `${symbol} Company`,
          price: 100 + Math.random() * 50, // Fallback price
          change: (Math.random() - 0.5) * 5,
          changePercent: (Math.random() - 0.5) * 3,
          sentiment: 'neutral',
          error: 'API limit reached, using fallback'
        });
      });
    }
  } else {
    // Queue the request
    return new Promise((resolve, reject) => {
      REQUEST_QUEUE.push({
        symbols: symbolsToFetch,
        resolve: (apiResults) => {
          results.push(...apiResults);
          resolve(results);
        },
        reject: (error) => {
          console.error('Queued API request failed:', error);
          // Add fallback data
          symbolsToFetch.forEach(symbol => {
            results.push({
              symbol,
              name: `${symbol} Company`,
              price: 100 + Math.random() * 50,
              change: (Math.random() - 0.5) * 5,
              changePercent: (Math.random() - 0.5) * 3,
              sentiment: 'neutral',
              error: 'API limit reached, using fallback'
            });
          });
          resolve(results);
        }
      });
      processQueue();
    });
  }
  
  return results;
};

// Search for stocks using TwelveData API with retry logic
export const searchStocks = async (query, retries = 2) => {
  if (!API_KEY || API_KEY === 'demo') {
    throw new Error('TwelveData API key required');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(`${BASE_URL}/symbol_search`, {
        params: {
          symbol: query,
          apikey: API_KEY
        },
        timeout: 10000
      });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(stock => ({
          symbol: stock.symbol,
          name: stock.instrument_name || stock.name,
          exchange: stock.exchange,
          country: stock.country,
          type: stock.instrument_type
        })).slice(0, 20);
      }
      
      throw new Error('No search results found');
    } catch (error) {
      console.error(`Search attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Search request timed out. Please try again.');
        }
        throw new Error('Unable to search stocks at this time. Please try again later.');
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
};

// Get historical data for charts
export const getHistoricalData = async (symbol, timeframe) => {
  if (!API_KEY || API_KEY === 'demo') {
    throw new Error('TwelveData API key required');
  }

  const formattedSymbol = formatSymbol(symbol);

  try {
    const interval = getIntervalFromTimeframe(timeframe);
    const response = await axios.get(`${BASE_URL}/time_series`, {
      params: {
        symbol: formattedSymbol,
        interval,
        apikey: API_KEY,
        outputsize: 50,
      },
      timeout: 10000
    });

    if (!response.data.values) {
      throw new Error('No historical data available');
    }

    return response.data.values.map(item => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume),
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// Get sentiment based on price change
const getSentimentFromChange = (changePercent) => {
  if (changePercent > 2) return 'positive';
  if (changePercent < -2) return 'negative';
  return 'neutral';
};

// Helper functions
const getIntervalFromTimeframe = (timeframe) => {
  switch (timeframe) {
    case '1D': return '1h';
    case '1W': return '4h';
    case '1M': return '1day';
    case '3M': return '1day';
    default: return '1day';
  }
};

// Cache management functions
export const clearCache = () => {
  priceCache.clear();
  console.log('Price cache cleared');
};

export const getCacheStats = () => {
  return {
    size: priceCache.size,
    keys: Array.from(priceCache.keys()),
    requestCount,
    canMakeRequest: canMakeRequest()
  };
};