// backend/routes/aiRoutes.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get AI insights for watchlist
router.post('/insights', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ message: 'Symbols array is required' });
    }

    // In a real implementation, this would call your Python AI service
    // For now, we'll generate mock insights
    const insights = generateMockInsights(symbols);
    
    res.json(insights);
  } catch (error) {
    console.error('Error getting AI insights:', error);
    res.status(500).json({ message: 'Error getting AI insights' });
  }
});

// Generate mock AI insights
const generateMockInsights = (symbols) => {
  const insights = [];
  
  // Price prediction insights
  symbols.forEach(symbol => {
    const trend = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    insights.push({
      type: trend === 'bullish' ? 'positive' : 'negative',
      title: `${symbol} Price Prediction`,
      message: `Our AI model predicts a ${trend} trend for ${symbol} with ${confidence}% confidence.`,
      confidence,
    });
  });
  
  // Sentiment analysis insights
  if (symbols.length > 1) {
    const positiveSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const negativeSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    insights.push({
      type: 'positive',
      title: 'Positive News Sentiment',
      message: `Recent news shows positive sentiment for ${positiveSymbol}.`,
      confidence: Math.floor(Math.random() * 20) + 75,
    });
    
    insights.push({
      type: 'negative',
      title: 'Negative News Alert',
      message: `Negative news detected for ${negativeSymbol}. Consider monitoring this position.`,
      confidence: Math.floor(Math.random() * 20) + 75,
    });
  }
  
  // Correlation recommendation
  if (symbols.length > 0) {
    const mainSymbol = symbols[0];
    const correlatedSymbol = getCorrelatedStock(mainSymbol);
    
    if (correlatedSymbol && !symbols.includes(correlatedSymbol)) {
      insights.push({
        type: 'info',
        title: 'Stock Correlation',
        message: `${mainSymbol} is highly correlated with ${correlatedSymbol}. You might want to add it to your watchlist.`,
        confidence: Math.floor(Math.random() * 20) + 70,
      });
    }
  }
  
  return insights;
};

// Helper function to get correlated stocks
const getCorrelatedStock = (symbol) => {
  const correlations = {
    'AAPL': 'MSFT',
    'MSFT': 'AAPL',
    'GOOGL': 'AMZN',
    'AMZN': 'GOOGL',
    'TSLA': 'NIO',
    'NIO': 'TSLA',
    'JPM': 'BAC',
    'BAC': 'JPM',
  };
  
  return correlations[symbol];
};

export default router;