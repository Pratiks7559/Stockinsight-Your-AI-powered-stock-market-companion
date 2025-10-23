import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const useStockSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const searchStocks = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase();
    if (cacheRef.current.has(cacheKey)) {
      setSearchResults(cacheRef.current.get(cacheKey));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search requests
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`, {
          headers: getAuthHeaders(),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error('Failed to search stocks');
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : [];
        
        // Cache results
        cacheRef.current.set(cacheKey, results);
        
        // Limit cache size
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        
        setSearchResults(results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error('Stock search error:', err);
          setSearchResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 150); // faster 150ms debounce
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchStocks,
    clearSearch
  };
};