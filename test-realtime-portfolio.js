// Test script for real-time portfolio updates
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  // Simulate user authentication
  socket.emit('authenticate', { userId: 'test_user_123' });
  
  // Subscribe to price updates
  socket.emit('subscribe:prices', { symbols: ['AAPL', 'MSFT', 'GOOGL'] });
});

socket.on('portfolio:update', (data) => {
  console.log('📊 Portfolio Update Received:');
  console.log('- Total Value:', data.summary.totalCurrentValue);
  console.log('- Total P&L:', data.summary.totalPL);
  console.log('- Unrealized P&L:', data.summary.totalUnrealizedPL);
  console.log('- Holdings:', data.portfolio.holdings.length);
  console.log('---');
});

socket.on('price:update', (data) => {
  console.log('💰 Price Update:', data.symbol, '$' + data.price, data.changePercent + '%');
});

socket.on('portfolio:transaction', (data) => {
  console.log('🔄 Transaction:', data.type, data.symbol, data.quantity || '', data.price || '');
});

socket.on('subscription:confirmed', (data) => {
  console.log('✅ Subscription confirmed:', data.symbols);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

console.log('🚀 Testing real-time portfolio updates...');
console.log('📡 Connecting to http://localhost:3001');
console.log('⏳ Waiting for updates...\n');