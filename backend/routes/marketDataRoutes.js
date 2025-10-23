import express from 'express';
import { searchSymbols, getQuote } from '../services/marketDataService.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, query } = req.query;
    const searchQuery = q || query;
    if (!searchQuery) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const results = await searchSymbols(searchQuery);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/quotes', async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }
    
    const quote = await getQuote(symbol);
    res.json(quote);
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

export default router;