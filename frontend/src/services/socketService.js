// services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    this.subscribers = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
      randomizationFactor: 0.5
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Authenticate user if token exists
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.socket.emit('authenticate', { userId: payload.id });
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      
      // Resubscribe to all previous subscriptions
      this.resubscribeAll();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server forced disconnect - reconnect manually
        this.socket.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection failed:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
      this.isConnected = false;
    });

    // Heartbeat mechanism
    this.startHeartbeat();

    this.socket.on('pong', () => {
      console.log('Server responded to ping');
    });

    // Handle subscription confirmations
    this.socket.on('subscription:confirmed', (data) => {
      console.log('Subscription confirmed:', data);
    });

    this.socket.on('subscription:error', (data) => {
      console.error('Subscription error:', data);
    });
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000);
  }

  subscribeToPrices(symbols, callback) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, queuing subscription');
      this.subscribers.set('prices', { symbols, callback });
      return;
    }

    this.socket.emit('subscribe:prices', { symbols });
    this.socket.on('price:update', (data) => {
      console.log('Price update received:', data);
      callback(data);
    });
    this.subscribers.set('prices', { symbols, callback });
  }

  subscribeToPortfolio(callback) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, queuing subscription');
      this.subscribers.set('portfolio', { callback });
      return;
    }

    // Remove existing listener to avoid duplicates
    this.socket.off('portfolio:update');
    this.socket.on('portfolio:update', callback);
    this.subscribers.set('portfolio', { callback });
  }

  subscribeToOrders(callback) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, queuing subscription');
      this.subscribers.set('orders', { callback });
      return;
    }

    this.socket.on('order:update', callback);
    this.subscribers.set('orders', { callback });
  }

  resubscribeAll() {
    this.subscribers.forEach((subscription, type) => {
      switch (type) {
        case 'prices':
          this.subscribeToPrices(subscription.symbols, subscription.callback);
          break;
        case 'portfolio':
          this.subscribeToPortfolio(subscription.callback);
          break;
        case 'orders':
          this.subscribeToOrders(subscription.callback);
          break;
      }
    });
  }

  placeOrder(orderData) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('place:order', orderData);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.subscribers.clear();
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export default new SocketService();