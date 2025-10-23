// backend/routes/stockRoutes.js
import express from 'express';
import { searchStocks, getHistoricalData } from '../services/twelveDataService.js';

const router = express.Router();

// Search stocks
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const results = await searchStocks(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    
    // Return specific error message from service
    const message = error.message || 'Error searching stocks';
    res.status(500).json({ message });
  }
});

// Get chart data for a stock
router.get('/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1D' } = req.query;

    const historicalData = await getHistoricalData(symbol, timeframe);
    res.json({
      symbol,
      timeframe,
      values: historicalData,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Error fetching chart data' });
  }
});

export default router;