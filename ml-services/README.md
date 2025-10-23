# StockInsight ML Services

AI-powered stock prediction and sentiment analysis service using FastAPI.

## Features

- **Stock Price Prediction**: AI-based price forecasting for next 7 days
- **Sentiment Analysis**: Financial text sentiment analysis
- **Market Insights**: AI-generated insights and recommendations

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python app.py
```

The service will be available at `http://localhost:5001`

## API Endpoints

### GET /
Health check endpoint

### POST /predict
Predict stock prices
```json
{
  "symbol": "AAPL",
  "days": 7
}
```

### POST /sentiment
Analyze text sentiment
```json
{
  "text": "Apple stock shows strong growth potential"
}
```

### POST /insights
Generate AI insights
```json
{
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
```

## Integration

This service integrates with the main StockInsight application to provide:
- Real-time price predictions
- News sentiment analysis
- Market correlation insights
- AI-powered recommendations