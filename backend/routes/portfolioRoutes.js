import express from 'express';
import Portfolio from '../models/Portfolio.js';
import { getQuote } from '../services/marketDataService.js';
import { getAIInsights } from '../services/aiServiceClient.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user portfolio
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      portfolio = new Portfolio({ user: userId, holdings: [], realizedPL: 0, cashBalance: 0 });
      await portfolio.save();
    }

    // Get current prices for all holdings
    const holdingsWithCurrentData = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        try {
          const quote = await getQuote(holding.symbol);
          const currentPrice = parseFloat(quote.price);
          const unrealizedPL = (currentPrice - holding.avgPrice) * holding.quantity;
          const unrealizedPLPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

          return {
            ...holding.toObject(),
            currentPrice,
            unrealizedPL,
            unrealizedPLPercent,
            marketValue: currentPrice * holding.quantity,
            change: quote.change || 0,
            changePercent: quote.percent_change || 0
          };
        } catch (error) {
          return {
            ...holding.toObject(),
            currentPrice: holding.avgPrice,
            unrealizedPL: 0,
            unrealizedPLPercent: 0,
            marketValue: holding.avgPrice * holding.quantity,
            change: 0,
            changePercent: 0
          };
        }
      })
    );

    const totalInvested = holdingsWithCurrentData.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
    const totalCurrentValue = holdingsWithCurrentData.reduce((sum, h) => sum + h.marketValue, 0);
    const totalUnrealizedPL = totalCurrentValue - totalInvested;
    const totalUnrealizedPLPercent = totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

    res.json({
      portfolio: {
        ...portfolio.toObject(),
        holdings: holdingsWithCurrentData
      },
      summary: {
        totalInvested,
        totalCurrentValue,
        totalUnrealizedPL,
        totalUnrealizedPLPercent,
        realizedPL: portfolio.realizedPL || 0,
        totalPL: totalUnrealizedPL + (portfolio.realizedPL || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get AI insights for portfolio
router.get('/ai-insights', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await Portfolio.findOne({ user: userId });

    if (!portfolio || portfolio.holdings.length === 0) {
      return res.json({
        predictions: [],
        sentiments: [],
        recommendations: null,
        summary: {
          overall_sentiment: 'neutral',
          risk_level: 0,
          diversification: 0
        }
      });
    }

    const insights = await getAIInsights(userId, portfolio.holdings);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

export default router;