// frontend/src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

// Watchlist APIs
export const fetchWatchlist = () => apiRequest('/watchlist');
export const addToWatchlist = (symbol) => apiRequest('/watchlist', {
  method: 'POST',
  body: JSON.stringify({ symbol }),
});
export const removeFromWatchlist = (symbol) => apiRequest(`/watchlist/${symbol}`, {
  method: 'DELETE',
});

// Stock search
export const searchStocks = (query) => apiRequest(`/stocks/search?q=${encodeURIComponent(query)}`);

// Stock data
export const fetchStockChartData = (symbol, timeframe) => 
  apiRequest(`/stocks/${symbol}/chart?timeframe=${timeframe}`);

// AI insights
export const getAIInsights = (symbols) => 
  apiRequest('/ai/insights', {
    method: 'POST',
    body: JSON.stringify({ symbols }),
  });