# StockInsight Portfolio Platform

A production-ready portfolio management platform with paper trading, real-time market data, and AI-powered insights.

## Features

- **Portfolio Management**: Track holdings, P&L, and performance metrics
- **Paper Trading**: Simulate buy/sell transactions without real money
- **Real-time Updates**: Live price feeds via Socket.IO
- **AI Insights**: ML-powered predictions, sentiment analysis, and recommendations
- **Brokerage Ready**: Pluggable connector for live trading (mock implementation included)
- **Responsive UI**: Dark/light mode support with TailwindCSS

## Architecture

- **Frontend**: React (Vite) + TailwindCSS + Socket.IO
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **ML Service**: Python FastAPI with Prophet/LSTM models
- **Market Data**: TwelveData API integration
- **Real-time**: Socket.IO for live updates

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB
- TwelveData API key

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/stockinsight
JWT_SECRET=your_jwt_secret_here
TWELVEDATA_API_KEY=your_twelvedata_api_key
AI_SERVICE_URL=http://localhost:5001
BROKER_TYPE=mock
PORT=3001
```

Start backend:
```bash
npm run dev
```

### 2. ML Service Setup

```bash
cd ml-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Start ML service:
```bash
uvicorn app:app --reload --port 5001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001
```

Start frontend:
```bash
npm run dev
```

## API Endpoints

### Portfolio
- `GET /api/portfolio` - Get portfolio with current values and AI insights
- `POST /api/portfolio/add` - Add holding to portfolio
- `PUT /api/portfolio/update` - Update existing holding
- `DELETE /api/portfolio/:symbol` - Remove holding

### Transactions
- `POST /api/transactions/buy` - Execute buy order
- `POST /api/transactions/sell` - Execute sell order
- `GET /api/transactions` - Get transaction history

### Market Data
- `GET /api/quotes?symbol=AAPL` - Get real-time quote
- `GET /api/history?symbol=AAPL&interval=1day` - Get historical data

### AI Services
- `GET /api/ai/predict?symbol=AAPL&horizon=7` - Get price predictions
- `GET /api/ai/sentiment?symbol=AAPL` - Get sentiment analysis
- `GET /api/ai/recommend?userId=123` - Get portfolio recommendations

### Broker Integration
- `POST /api/broker/connect` - Connect to broker (OAuth)
- `POST /api/broker/place-order` - Place order with broker
- `POST /api/broker/webhook` - Handle broker webhooks

## Real-time Events

### Client → Server
- `subscribe:prices` - Subscribe to price updates for symbols
- `place:order` - Place order via socket (optional)

### Server → Client
- `price:update` - Real-time price updates
- `portfolio:update` - Portfolio value changes
- `order:update` - Order status updates

## ML Models

### Stock Prediction
- **Prophet**: Robust baseline forecasting with seasonality
- **LSTM**: Neural network for short-term predictions
- **Ensemble**: Weighted combination of both models

### Sentiment Analysis
- **FinBERT**: Financial news sentiment analysis
- **News Sources**: Yahoo Finance, NewsAPI integration
- **Real-time**: Cached results with configurable TTL

### Portfolio Analytics
- **Risk Scoring**: Sector concentration and volatility analysis
- **Diversification**: Portfolio balance recommendations
- **Rebalancing**: AI-suggested position adjustments

## Trading Modes

### Simulation Mode (Default)
- Paper trading with virtual money
- Instant execution at market prices
- Full portfolio tracking and P&L calculation
- No real financial risk

### Broker Mode
- Integration with real brokers (Zerodha, Alpaca, etc.)
- OAuth authentication flow
- Webhook-based order status updates
- Idempotency keys for order safety

## Security Features

- JWT authentication with secure cookies
- Request validation and sanitization
- Rate limiting on expensive endpoints
- Broker webhook signature validation
- No API keys exposed to frontend

## Deployment

### Production Environment Variables

Backend:
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-mongo-cluster
JWT_SECRET=secure_random_string
TWELVEDATA_API_KEY=your_production_key
AI_SERVICE_URL=https://your-ml-service.com
REDIS_URL=redis://your-redis-instance
BROKER_WEBHOOK_SECRET=secure_webhook_secret
```

ML Service:
```env
ENVIRONMENT=production
MODEL_CACHE_TTL=1800
NEWS_API_KEY=your_news_api_key
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment

1. **Backend**: Deploy to AWS ECS, Google Cloud Run, or similar
2. **ML Service**: Deploy to AWS Lambda, Google Cloud Functions
3. **Database**: MongoDB Atlas or AWS DocumentDB
4. **Cache**: Redis Cloud or AWS ElastiCache
5. **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### ML Service Tests
```bash
cd ml-services
python -m pytest tests/
```

### Integration Tests
```bash
node test-complete-system.js
```

## Broker Integration

### Adding New Brokers

1. Implement broker adapter in `services/brokerConnector.js`
2. Add OAuth flow in `routes/brokerRoutes.js`
3. Configure webhook endpoints
4. Update environment variables

### Example: Zerodha Integration

```javascript
class ZerodhaBroker {
  constructor() {
    this.kite = new KiteConnect({
      api_key: process.env.ZERODHA_API_KEY
    });
  }

  async placeOrder(params) {
    return await this.kite.placeOrder('regular', params);
  }
}
```

## Performance Optimization

- **Caching**: Redis for market data and ML predictions
- **Rate Limiting**: Protect against API abuse
- **Connection Pooling**: MongoDB connection optimization
- **CDN**: Static asset delivery
- **Compression**: Gzip response compression

## Monitoring

- **Health Checks**: `/health` endpoints for all services
- **Logging**: Structured logging with Winston
- **Metrics**: Custom metrics for trading activity
- **Alerts**: Portfolio performance notifications

## Legal & Compliance

⚠️ **Important**: This platform is for educational and simulation purposes. For live trading:

1. Obtain required financial licenses
2. Implement proper compliance measures
3. Add risk management controls
4. Ensure regulatory compliance
5. Implement audit trails

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review API examples