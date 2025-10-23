// backend/routes/watchlistRoutes.js
import express from 'express';
import Watchlist from '../models/Watchlist.js';
import { getStockData } from '../services/twelveDataService.js';

const router = express.Router();

// Get user's watchlist with current data
router.get('/', async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user.id }).populate('user');
    
    if (!watchlist) {
      return res.json([]);
    }

    // Get current data for all symbols in watchlist
    const symbols = watchlist.symbols.map(item => item.symbol);
    let stockData = [];
    
    try {
      stockData = await getStockData(symbols);
    } catch (error) {
      console.error('TwelveData API error:', error);
      const message = error.message.includes('timeout') 
        ? 'Request timed out. Please refresh to try again.'
        : 'Unable to fetch stock data at this time.';
      return res.status(500).json({ message });
    }
    
    // Combine watchlist items with current data
    const watchlistWithData = watchlist.symbols.map(item => {
      const data = stockData.find(stock => stock.symbol === item.symbol);
      return {
        symbol: item.symbol,
        name: item.name || data?.name || item.symbol,
        price: data?.price || 0,
        change: data?.change || 0,
        changePercent: data?.changePercent || 0,
        open: data?.open || 0,
        high: data?.high || 0,
        low: data?.low || 0,
        volume: data?.volume || 0,
        sentiment: data?.sentiment || 'neutral',
      };
    });

    res.json(watchlistWithData);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Error fetching watchlist' });
  }
});

// Add stock to watchlist
router.post('/', async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    // Validate stock symbol with TwelveData API
    let stockInfo;
    try {
      stockInfo = await getStockData([symbol]);
    } catch (error) {
      console.error('TwelveData API validation failed:', error);
      const message = error.message.includes('timeout')
        ? 'Request timed out. Please try again.'
        : 'Stock not found or API temporarily unavailable.';
      return res.status(404).json({ message });
    }
    
    if (!stockInfo || stockInfo.length === 0) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    let watchlist = await Watchlist.findOne({ user: req.user.id });
    
    if (!watchlist) {
      watchlist = new Watchlist({
        user: req.user.id,
        symbols: [],
      });
    }

    // Check if stock is already in watchlist
    if (watchlist.symbols.some(item => item.symbol === symbol)) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    // Add stock to watchlist
    watchlist.symbols.push({
      symbol,
      name: stockInfo[0].name,
    });

    await watchlist.save();
    res.json({ message: 'Stock added to watchlist' });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: 'Error adding to watchlist' });
  }
});

// Remove stock from watchlist
router.delete('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const watchlist = await Watchlist.findOne({ user: req.user.id });
    
    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    // Remove the stock
    watchlist.symbols = watchlist.symbols.filter(item => item.symbol !== symbol);
    
    await watchlist.save();
    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Error removing from watchlist' });
  }
});

export default router;