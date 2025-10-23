
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Portfolio from '../models/Portfolio.js';
import axios from 'axios';

const router = express.Router();

// @route   GET /api/risk-analysis
// @desc    Get portfolio risk analysis
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const holdings = portfolio.holdings.map(h => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgPrice: h.avgPrice,
      sector: h.sector,
      industry: h.industry,
      beta: h.beta || 1.0, // Default beta to 1.0 if not available
    }));

    // Call Python service for risk analysis
    const riskResponse = await axios.post('http://127.0.0.1:5001/risk-analyzer', { holdings });

    res.json(riskResponse.data);
  } catch (error) {
    console.error('Error in risk analysis:', error.message);
    res.status(500).send('Server error');
  }
});

export default router;
