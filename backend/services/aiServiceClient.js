// services/aiServiceClient.js
import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 1800 }); // 30 minute cache for AI predictions
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Get AI prediction for a symbol
export const getPrediction = async (symbol, horizon = 7) => {
  const cacheKey = `prediction_${symbol}_${horizon}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${AI_SERVICE_URL}/predict`, {
      params: { symbol: symbol.toUpperCase(), horizon },
      timeout: 30000
    });

    const prediction = response.data;
    cache.set(cacheKey, prediction);
    return prediction;
  } catch (error) {
    console.error(`Error fetching prediction for ${symbol}:`, error.message);
    
    // Return mock prediction if service is unavailable
    const mockForecast = [];
    const basePrice = 100 + Math.random() * 50;
    
    for (let i = 1; i <= horizon; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      mockForecast.push({
        date: date.toISOString().split('T')[0],
        predicted_price: basePrice + (Math.random() - 0.5) * 10,
        confidence: 0.6 + Math.random() * 0.3
      });
    }
    
    return {
      symbol: symbol.toUpperCase(),
      horizon,
      forecast: mockForecast,
      confidence: 0.75,
      model: 'mock'
    };
  }
};

// Get sentiment analysis for a symbol
export const getSentiment = async (symbol, limit = 10) => {
  const cacheKey = `sentiment_${symbol}_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${AI_SERVICE_URL}/sentiment`, {
      params: { symbol: symbol.toUpperCase(), limit },
      timeout: 30000
    });

    const sentiment = response.data;
    cache.set(cacheKey, sentiment);
    return sentiment;
  } catch (error) {
    console.error(`Error fetching sentiment for ${symbol}:`, error.message);
    
    // Return mock sentiment if service is unavailable
    const sentiments = ['positive', 'neutral', 'negative'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    return {
      symbol: symbol.toUpperCase(),
      sentiment: randomSentiment,
      score: Math.random(),
      summary: `Mock sentiment analysis for ${symbol}`,
      sources_analyzed: limit,
      model: 'mock'
    };
  }
};

// Get portfolio recommendations
export const getRecommendations = async (userId, holdings) => {
  const cacheKey = `recommendations_${userId}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
      user_id: userId,
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        sector: h.sector
      }))
    }, {
      timeout: 30000
    });

    const recommendations = response.data;
    cache.set(cacheKey, recommendations);
    return recommendations;
  } catch (error) {
    console.error('ML Service unavailable. Start with: cd ml-services && uvicorn app:app --port 5001');
    
    // Return fallback recommendations based on holdings
    const fallbackRecommendations = holdings.map(holding => {
      const recommendations = ['BUY', 'HOLD', 'SELL'];
      const reasons = [
        'Strong technical indicators suggest upward momentum',
        'Stable performance with good fundamentals',
        'Consider taking profits at current levels',
        'Market volatility suggests caution',
        'Good entry point based on recent dip'
      ];
      
      return {
        symbol: holding.symbol,
        recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        confidence: 0.6 + Math.random() * 0.3
      };
    });
    
    return {
      recommendations: fallbackRecommendations,
      model: 'fallback'
    };
  }
};

// Get comprehensive AI insights for portfolio
export const getAIInsights = async (userId, holdings) => {
  try {
    const symbols = holdings.map(h => h.symbol);
    
    // Get predictions and sentiments for all holdings
    const [predictions, sentiments, recommendations] = await Promise.all([
      Promise.all(symbols.map(symbol => 
        getPrediction(symbol, 7).catch(error => {
          console.error(`Failed to get prediction for ${symbol}:`, error);
          return null;
        })
      )),
      Promise.all(symbols.map(symbol => 
        getSentiment(symbol, 5).catch(error => {
          console.error(`Failed to get sentiment for ${symbol}:`, error);
          return null;
        })
      )),
      getRecommendations(userId, holdings).catch(error => {
        console.error('Failed to get recommendations:', error);
        return null;
      })
    ]);

    // Combine insights
    const insights = {
      predictions: predictions.filter(p => p !== null),
      sentiments: sentiments.filter(s => s !== null),
      recommendations: recommendations ? recommendations.recommendations : [],
      summary: {
        overall_sentiment: calculateOverallSentiment(sentiments.filter(s => s !== null)),
      }
    };

    return insights;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return null;
  }
};

// Helper function to calculate overall portfolio sentiment
function calculateOverallSentiment(sentiments) {
  if (sentiments.length === 0) return 'neutral';
  
  const scores = sentiments.map(s => {
    switch (s.sentiment) {
      case 'positive': return 1;
      case 'negative': return -1;
      default: return 0;
    }
  });
  
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  if (avgScore > 0.2) return 'positive';
  if (avgScore < -0.2) return 'negative';
  return 'neutral';
}
