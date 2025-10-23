// hooks/useSocket.js
import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export const useSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    reconnectAttempts: 0
  });

  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Update connection status periodically
    const interval = setInterval(() => {
      setConnectionStatus(socketService.getConnectionStatus());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    connectionStatus,
    socket: socketService.socket,
    connected: connectionStatus.connected
  };
};

// Legacy support for direct socket access
export const useSocketLegacy = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    reconnectAttempts: 0
  });

  useEffect(() => {
    socketService.connect();
    const interval = setInterval(() => {
      setConnectionStatus(socketService.getConnectionStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    connectionStatus,
    subscribeToPrices: socketService.subscribeToPrices.bind(socketService),
    subscribeToPortfolio: socketService.subscribeToPortfolio.bind(socketService),
    subscribeToOrders: socketService.subscribeToOrders.bind(socketService),
    placeOrder: socketService.placeOrder.bind(socketService)
  };
};