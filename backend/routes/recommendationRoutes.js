import express from 'express';
import RecommendationEngine from '../services/recommendationEngine.js';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();
const recommendationEngine = new RecommendationEngine();

router.get('/portfolio/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const enrichedHoldings = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const currentPrice = 150 + Math.random() * 100;
        const marketValue = currentPrice * holding.quantity;
        const plPercent = ((currentPrice - holding.averageCost) / holding.averageCost) * 100;

        return {
          ...holding.toObject(),
          currentPrice,
          marketValue,
          plPercent,
          aiTargetPrice: 150 + Math.random() * 100,
          sentiment: { score: (Math.random() - 0.5) * 2, label: 'neutral' }
        };
      })
    );

    const totalValue = enrichedHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    const analysis = recommendationEngine.analyzePortfolio(enrichedHoldings, totalValue);

    res.json({
      success: true,
      data: {
        totalValue,
        totalPL: analysis.portfolioSummary.totalPL,
        plPercent: analysis.portfolioSummary.plPercent,
        recommendations: analysis.recommendations,
        portfolioInsights: analysis.portfolioSummary
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

export default router;