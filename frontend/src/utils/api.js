// utils/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Portfolio API
export const portfolioAPI = {
  // Get portfolio data with proper average cost calculation
  getPortfolio: async () => {
    const response = await api.get('/api/portfolio');
    return response.data;
  },

  // Buy stock - UPDATED to handle average cost calculation
  buyStock: async (data) => {
    const response = await api.post('/api/transactions/buy', data, {
      headers: {
        'idempotency-key': `buy_${data.symbol}_${Date.now()}_${Math.random()}`
      }
    });
    return response.data;
  },

  // Sell stock - UPDATED to handle proper quantity validation
  sellStock: async (data) => {
    const response = await api.post('/api/transactions/sell', data, {
      headers: {
        'idempotency-key': `sell_${data.symbol}_${Date.now()}_${Math.random()}`
      }
    });
    return response.data;
  },

  // Get transactions with execution prices
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/transactions', { params });
    return response.data;
  },

  // Get current quote
  getQuote: async (symbol) => {
    const response = await api.get(`/api/market/quote/${symbol}`);
    return response.data;
  },

  // Get multiple quotes at once
  getQuotes: async (symbols) => {
    const response = await api.get(`/api/market/quotes?symbols=${symbols.join(',')}`);
    return response.data;
  },

  // Search symbols
  searchSymbols: async (query) => {
    const response = await api.get(`/api/market/search?query=${query}`);
    return response.data;
  },

  // Get portfolio summary
  getPortfolioSummary: async () => {
    const response = await api.get('/api/portfolio/summary');
    return response.data;
  },

  // Get holding details
  getHolding: async (symbol) => {
    const response = await api.get(`/api/portfolio/holding/${symbol}`);
    return response.data;
  },

  getAIInsights: async () => {
    const response = await api.get('/api/portfolio/ai-insights');
    return response.data;
  },

  getRiskAnalysis: async () => {
    const response = await api.get('/api/risk-analysis');
    return response.data;
  },

  // Update holding manually (for corrections)
  updateHolding: async (symbol, data) => {
    const response = await api.put(`/api/portfolio/holding/${symbol}`, data);
    return response.data;
  }
};

// AI Insights API
export const aiAPI = {
  // Get AI prediction
  getPrediction: async (symbol, horizon = 7) => {
    const response = await api.get(`/api/ai/predict/${symbol}?horizon=${horizon}`);
    return response.data;
  },

  // Get sentiment analysis
  getSentiment: async (symbol, limit = 10) => {
    const response = await api.get(`/api/ai/sentiment/${symbol}?limit=${limit}`);
    return response.data;
  },

  // Get recommendations
  getRecommendations: async () => {
    const response = await api.get('/api/ai/recommendations');
    return response.data;
  },

  // Get portfolio insights
  getPortfolioInsights: async () => {
    const response = await api.get('/api/ai/portfolio-insights');
    return response.data;
  }
};

// Market data API
export const marketAPI = {
  getQuote: async (symbol) => {
    const response = await api.get(`/api/market/quote/${symbol}`);
    return response.data;
  },

  getHistory: async (symbol, interval = '1day', outputsize = 30) => {
    const response = await api.get(`/api/market/history/${symbol}?interval=${interval}&outputsize=${outputsize}`);
    return response.data;
  },

  getIndices: async () => {
    const response = await api.get('/api/market/indices');
    return response.data;
  },

  getRealTimePrices: async (symbols) => {
    const response = await api.get(`/api/market/realtime?symbols=${symbols.join(',')}`);
    return response.data;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/user/profile', data);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/api/user/preferences');
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await api.put('/api/user/preferences', data);
    return response.data;
  }
};

// Export the main api instance
export default api;