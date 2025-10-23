import { useState, useEffect, useRef } from 'react';

export const useRealTimeData = (symbols = []) => {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket('ws://localhost:8080');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttempts.current = 0;
        
        // Subscribe to symbols after connection
        if (symbols.length > 0) {
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'subscribe',
                symbols: symbols
              }));
            }
          }, 100); // Small delay to ensure connection is fully established
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'price_update') {
            setPrices(prev => ({
              ...prev,
              [data.symbol]: {
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                timestamp: data.timestamp,
                error: data.error,
                simulated: data.simulated,
                available: !data.error // Track if data is available
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const subscribe = (newSymbols) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && newSymbols.length > 0) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        symbols: newSymbols
      }));
      console.log('Subscribed to symbols:', newSymbols);
    }
  };

  const unsubscribe = (symbolsToRemove) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && symbolsToRemove.length > 0) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        symbols: symbolsToRemove
      }));
      console.log('Unsubscribed from symbols:', symbolsToRemove);
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (connected && symbols.length > 0) {
      subscribe(symbols);
    }
  }, [connected, JSON.stringify(symbols)]); // Use JSON.stringify to properly compare arrays

  return {
    prices,
    connected,
    subscribe,
    unsubscribe,
    reconnect: connect
  };
};