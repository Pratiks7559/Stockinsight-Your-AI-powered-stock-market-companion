// services/marketDataService.js
import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30 }); // 30 second cache for quotes
const historyCache = new NodeCache({ stdTTL: 300 }); // 5 minute cache for history

const API_BASE_URL = 'https://api.twelvedata.com';
const API_KEY = process.env.TWELVE_API_KEY2;

// Enhanced axios instance with retry logic
const axiosInstance = axios.create({
  timeout: 10000,
  retry: 3,
  retryDelay: 1000
});

// Retry interceptor
axiosInstance.interceptors.response.use(null, (error) => {
  const config = error.config;
  
  if (!config || !config.retry) return Promise.reject(error);
  
  config.__retryCount = config.__retryCount || 0;
  
  if (config.__retryCount >= config.retry) {
    return Promise.reject(error);
  }
  
  config.__retryCount += 1;
  
  const backoff = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, config.retryDelay || 1000);
  });
  
  return backoff.then(() => {
    return axiosInstance(config);
  });
});

// Circuit breaker for API calls
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

const circuitBreaker = new CircuitBreaker();

// Get real-time quote for a symbol
export const getQuote = async (symbol) => {
  // Fix common symbol typos before API call
  const correctedSymbol = symbol.toUpperCase()
    .replace('GOGGL', 'GOOGL')
    .replace('APPL', 'AAPL')
    .replace('AMZN', 'AMZN')
    .replace('TSLA', 'TSLA');

  try {
    const response = await circuitBreaker.call(() => 
      axiosInstance.get(`${API_BASE_URL}/quote`, {
        params: {
          symbol: correctedSymbol,
          apikey: API_KEY
        }
      })
    );

    const data = response.data;
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch quote');
    }

    const quote = {
      symbol: correctedSymbol,
      price: parseFloat(data.close),
      change: parseFloat(data.change) || 0,
      percent_change: parseFloat(data.percent_change) || 0,
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      open: parseFloat(data.open),
      volume: parseInt(data.volume) || 0,
      previous_close: parseFloat(data.previous_close),
      timestamp: data.datetime,
      sector: data.sector || 'Unknown'
    };

    return quote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    
    // Fix common symbol typos
    const correctedSymbol = symbol.toUpperCase()
      .replace('GOGGL', 'GOOGL')
      .replace('MSFT', 'MSFT')
      .replace('APPL', 'AAPL');
    
    // Generate dynamic mock price that changes over time
    const basePrice = 100 + (hash(correctedSymbol) % 200);
    const timeVariation = Math.sin(Date.now() / 100000) * 20;
    const randomVariation = (Math.random() - 0.5) * 10;
    const currentPrice = basePrice + timeVariation + randomVariation;
    
    return {
      symbol: correctedSymbol,
      name: `${correctedSymbol} Inc.`,
      price: Math.max(1, currentPrice),
      change: randomVariation,
      percent_change: (randomVariation / basePrice) * 100,
      high: currentPrice * 1.05,
      low: currentPrice * 0.95,
      open: currentPrice * (0.98 + Math.random() * 0.04),
      volume: Math.floor(Math.random() * 1000000),
      previous_close: currentPrice - randomVariation,
      timestamp: new Date().toISOString(),
      sector: 'Technology'
    };
  }
};

// Simple hash function for consistent mock data
function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
  }

// Get historical data for a symbol
export const getHistory = async (symbol, interval = '1day', outputsize = 30) => {
  const cacheKey = `history_${symbol}_${interval}_${outputsize}`;
  const cached = historyCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await circuitBreaker.call(() =>
      axiosInstance.get(`${API_BASE_URL}/time_series`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          outputsize,
          apikey: API_KEY
        }
      })
    );

    const data = response.data;
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch history');
    }

    const history = {
      symbol: data.meta.symbol,
      interval: data.meta.interval,
      values: data.values.map(item => ({
        datetime: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume) || 0
      }))
    };

    historyCache.set(cacheKey, history);
    return history;
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error.message);
    
    // Return mock historical data if API fails
    const mockData = [];
    const basePrice = 100;
    const now = new Date();
    
    for (let i = outputsize - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const price = basePrice + (Math.random() - 0.5) * 20;
      const variation = price * 0.02;
      
      mockData.push({
        datetime: date.toISOString().split('T')[0],
        open: price + (Math.random() - 0.5) * variation,
        high: price + Math.random() * variation,
        low: price - Math.random() * variation,
        close: price + (Math.random() - 0.5) * variation,
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return {
      symbol: symbol.toUpperCase(),
      interval,
      values: mockData
    };
  }
};

// Get multiple quotes at once
export const getMultipleQuotes = async (symbols) => {
  const quotes = {};
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchPromises = batch.map(symbol => 
      getQuote(symbol).then(quote => ({ symbol, quote })).catch(error => ({ symbol, error }))
    );
    
    const results = await Promise.all(batchPromises);
    results.forEach(({ symbol, quote, error }) => {
      if (quote) {
        quotes[symbol] = quote;
      } else {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
      }
    });
    
    // Small delay between batches
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return quotes;
};

// Search symbols
export const searchSymbols = async (query) => {
  const cacheKey = `search_${query}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await circuitBreaker.call(() =>
      axiosInstance.get(`${API_BASE_URL}/symbol_search`, {
        params: {
          symbol: query.toUpperCase(),
          apikey: API_KEY
        }
      })
    );

    const data = response.data;
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to search symbols');
    }

    const symbols = data.data?.filter(item => 
      ['NASDAQ', 'NYSE', 'AMEX'].includes(item.exchange)
    ).slice(0, 10).map(item => ({
      symbol: item.symbol,
      name: item.instrument_name,
      exchange: item.exchange,
      type: item.instrument_type
    })) || [];

    cache.set(cacheKey, symbols, 300); // 5 minute cache
    return symbols;
  } catch (error) {
    console.error(`Error searching symbols for ${query}:`, error.message);
    
    // Return mock data if API fails
    const mockSymbols = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Common Stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
      { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'Common Stock' }
    ].filter(s => 
      s.symbol.includes(query.toUpperCase()) || 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toUpperCase().includes(s.symbol)
    );
    
    return mockSymbols;
  }
};

// Get market indices
export const getIndices = async () => {
  const cacheKey = 'market_indices';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const symbols = ['SPY', 'QQQ', 'DIA', 'IWM']; // Major ETFs representing indices
    const quotes = await getMultipleQuotes(symbols);
    
    const indices = {
      'S&P 500': quotes['SPY'] || null,
      'NASDAQ': quotes['QQQ'] || null,
      'Dow Jones': quotes['DIA'] || null,
      'Russell 2000': quotes['IWM'] || null
    };

    cache.set(cacheKey, indices);
    return indices;
  } catch (error) {
    console.error('Error fetching indices:', error);
    return {};
  }
};