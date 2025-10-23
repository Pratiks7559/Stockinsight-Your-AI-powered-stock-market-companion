import { WebSocketServer } from 'ws';
import { getStockData } from './services/twelveDataService.js';

let wss;
const clients = new Map(); // Use Map to store client subscriptions
const stockPrices = new Map();
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

export const initWebSocket = () => {
  // Create standalone WebSocket server on port 8080
  wss = new WebSocketServer({ 
    port: 8080,
    verifyClient: (info) => {
      const origin = info.origin;
      return ALLOWED_ORIGINS.includes(origin);
    }
  });
  
  console.log('WebSocket server running on port 8080');

  wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    clients.set(clientId, { ws, subscriptions: new Set() });
    // console.log(`Client ${clientId} connected. Total clients:`, clients.size);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const client = clients.get(clientId);
        
        if (data.type === 'subscribe' && data.symbols && Array.isArray(data.symbols)) {
          data.symbols.forEach(symbol => client.subscriptions.add(symbol));
          // console.log(`Client ${clientId} subscribed to:`, data.symbols);
        } else if (data.type === 'unsubscribe' && data.symbols) {
          data.symbols.forEach(symbol => client.subscriptions.delete(symbol));
          // console.log(`Client ${clientId} unsubscribed from:`, data.symbols);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      // console.log(`Client ${clientId} disconnected. Total clients:`, clients.size);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });
  });

  // Real-time price updates using TwelveData API
  setInterval(() => {
    broadcastPriceUpdates();
  }, 3000); // Every 3 seconds for real-time feel
  
  return wss;
};

export const getConnectedClientsCount = () => clients.size;
export const getSubscribedSymbols = () => {
  const symbols = new Set();
  clients.forEach(client => {
    client.subscriptions.forEach(symbol => symbols.add(symbol));
  });
  return Array.from(symbols);
};

const generateClientId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Graceful shutdown
export const closeWebSocket = () => {
  if (wss) {
    wss.close();
    clients.clear();
  }
};

const broadcastPriceUpdates = async () => {
  if (clients.size === 0) return;

  const subscribedSymbols = new Set();
  clients.forEach(client => {
    client.subscriptions.forEach(symbol => subscribedSymbols.add(symbol));
  });

  if (subscribedSymbols.size === 0) return;

  try {
    const symbolsArray = Array.from(subscribedSymbols);
    const stockData = await getStockData(symbolsArray);
    
    clients.forEach((client, clientId) => {
      if (client.ws.readyState === 1) {
        try {
          stockData.forEach(stock => {
            if (client.subscriptions.has(stock.symbol)) {
              // Add small random variation to simulate real market movement
              const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
              const adjustedPrice = stock.price * (1 + variation);
              const adjustedChange = stock.change + (variation * stock.price);
              const adjustedChangePercent = (adjustedChange / (adjustedPrice - adjustedChange)) * 100;
              
              client.ws.send(JSON.stringify({
                type: 'price_update',
                symbol: stock.symbol,
                name: stock.name,
                price: Number(adjustedPrice.toFixed(2)),
                change: Number(adjustedChange.toFixed(2)),
                changePercent: Number(adjustedChangePercent.toFixed(2)),
                open: stock.open,
                high: stock.high,
                low: stock.low,
                volume: stock.volume,
                sentiment: stock.sentiment,
                timestamp: Date.now()
              }));
            }
          });
        } catch (sendError) {
          console.error(`WebSocket send error:`, sendError.message);
          clients.delete(clientId);
        }
      } else {
        clients.delete(clientId);
      }
    });
  } catch (error) {
    console.error('TwelveData API error - no fallback data:', error.message);
  }
};