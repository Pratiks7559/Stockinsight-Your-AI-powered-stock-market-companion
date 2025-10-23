import express from 'express';
import axios from 'axios';

const router = express.Router();

async function cachedApiRequest(url, cache, cacheKey, ttl = 30) {
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(url);
    cache.set(cacheKey, response.data, ttl);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.message);
    throw new Error('Failed to fetch data from external API');
  }
}

router.get('/', async (req, res) => {
  try {
    const { cache, API_CONFIG } = req.app.locals;
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.indices}?apikey=${API_CONFIG.apiKey}`;
    
    try {
      const data = await cachedApiRequest(url, cache, 'indices', 30);
      const indices = data.data.map(index => ({
        name: index.name,
        value: parseFloat(index.close),
        changePercent: parseFloat(index.percent_change)
      }));
      res.json(indices);
    } catch (apiError) {
      // Fallback dummy indices data
      const fallbackIndices = [
        { name: 'NIFTY 50', value: 22475.50, changePercent: 1.2 },
        { name: 'SENSEX', value: 74005.94, changePercent: 0.8 },
        { name: 'NASDAQ', value: 16349.25, changePercent: -0.3 },
        { name: 'DOW JONES', value: 39512.84, changePercent: 0.5 }
      ];
      res.json(fallbackIndices);
    }
  } catch (error) {
    console.error('Indices error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;