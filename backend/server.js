// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { initWebSocket } from './websocket.js';
import { clearCache, getCacheStats } from './services/twelveDataService.js';

// Connect to MongoDB
connectDB();

// Import routes
import quotesRouter from './routes/quotes.js';
import historyRouter from './routes/history.js';
import indicesRouter from './routes/indices.js';
import newsRouter from './routes/news.js';
import authRoutes from './routes/authRoutes.js';
import compareRouter from './routes/compare.js';
import streamRouter from './routes/stream.js';
import marketDataRoutes from './routes/marketData.js';
import technicalIndicatorsRoutes from './routes/technicalIndicators.js';
import marketInsightsRoutes from './routes/marketInsights.js';
import realTimeQuotesRoutes from './routes/realTimeQuotes.js';
import marketOverviewRoutes from './routes/marketOverview.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import brokerRoutes from './routes/brokerRoutes.js';
import symbolSearchRoutes from './routes/marketDataRoutes.js';
import quotesApiRoutes from './routes/marketDataRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import riskAnalysisRoutes from './routes/riskAnalysisRoutes.js';
import { protect as authenticateToken } from './middleware/authMiddleware.js';

const app = express();
const cache = new NodeCache({ stdTTL: 30 }); // Default 30 second cache

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

const API_CONFIG = {
  provider: 'twelvedata',
  baseURL: 'https://api.twelvedata.com',
  apiKey: process.env.STOCK_API_KEY || 'demo',
  endpoints: {
    quotes: '/quote',
    history: '/time_series',
    indices: '/indices',
    news: '/news'
  }
};

app.locals.cache = cache;
app.locals.API_CONFIG = API_CONFIG;

app.use('/api/quotes', quotesRouter);
app.use('/api/history', historyRouter);
app.use('/api/indices', indicesRouter);
app.use('/api/news', newsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/compare', compareRouter);
app.use('/api/stream', streamRouter);
app.use('/api/portfolio', authenticateToken, portfolioRoutes);
app.use('/api/market', marketDataRoutes);
app.use('/api/indicators', technicalIndicatorsRoutes);
app.use('/api/insights', marketInsightsRoutes);
app.use('/api/realtime', realTimeQuotesRoutes);
app.use('/api/market-overview', marketOverviewRoutes);
app.use('/api/watchlist', authenticateToken, watchlistRoutes);
app.use('/api/stocks', authenticateToken, stockRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/broker', brokerRoutes);
app.use('/api/market-data', symbolSearchRoutes);
app.use('/api/recommendations', authenticateToken, recommendationRoutes);
app.use('/api/risk-analysis', authenticateToken, riskAnalysisRoutes);

app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    message: 'StockInsight API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: connectedClients.size,
    services: {
      database: 'connected',
      marketData: 'available',
      socketIO: 'running'
    }
  };
  res.json(health);
});

app.post('/api/cache/clear', (req, res) => {
  clearCache();
  res.json({ message: 'Cache cleared successfully' });
});

app.get('/api/cache/stats', (req, res) => {
  const stats = getCacheStats();
  res.json(stats);
});

const PORT = process.env.PORT || 3001;
const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const connectedClients = new Map();

io.on('connection', (socket) => {
  connectedClients.set(socket.id, {
    connectedAt: new Date(),
    subscribedSymbols: [],
    userId: null,
    authenticated: false
  });

  socket.on('authenticate', (data) => {
    const { userId } = data;
    const clientInfo = connectedClients.get(socket.id);
    if (userId && clientInfo && !clientInfo.authenticated) {
      clientInfo.userId = userId;
      clientInfo.authenticated = true;
    }
  });

  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
  });

  socket.on('subscribe:prices', (data) => {
    const { symbols } = data;
    const clientInfo = connectedClients.get(socket.id);
    if (symbols && clientInfo && JSON.stringify(clientInfo.subscribedSymbols) !== JSON.stringify(symbols)) {
      socket.join('price_updates');
      clientInfo.subscribedSymbols = symbols;
      socket.emit('subscription:confirmed', { symbols });
    }
  });
});

app.locals.io = io;

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

initWebSocket();

setInterval(async () => {
  if (connectedClients.size === 0) return;
  
  const subscribedSymbols = new Set();
  connectedClients.forEach(client => {
    client.subscribedSymbols.forEach(symbol => subscribedSymbols.add(symbol));
  });
  
  if (subscribedSymbols.size === 0) return;
  
  try {
    const { getStockData } = await import('./services/twelveDataService.js');
    const symbolsArray = Array.from(subscribedSymbols);
    const stockData = await getStockData(symbolsArray);
    
    stockData.forEach(stock => {
      const variation = (Math.random() - 0.5) * 0.02;
      const adjustedPrice = stock.price * (1 + variation);
      const adjustedChange = stock.change + (variation * stock.price);
      const adjustedChangePercent = (adjustedChange / (adjustedPrice - adjustedChange)) * 100;
      
      io.to('price_updates').emit('price:update', {
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
      });
    });
  } catch (error) {
    console.error('Error fetching real-time prices:', error);
  }
}, 10000);