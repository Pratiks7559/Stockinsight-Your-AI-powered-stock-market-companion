import express from 'express';
import axios from 'axios';

const router = express.Router();

// SSE: stream live prices for one or more symbols (comma-separated)
// Client connects to: /api/stream/prices?symbols=AAPL,MSFT
router.get('/prices', async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) {
    return res.status(400).json({ error: 'symbols query param is required (e.g., ?symbols=AAPL,MSFT)' });
  }

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Optional explicit CORS headers for some browsers/hosts
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Send initial comment to establish the stream
  res.write(': connected\n\n');

  const POLL_INTERVAL_MS = 5000; // poll every 5s
  const HEARTBEAT_MS = 15000;    // keep-alive ping every 15s

  let isClosed = false;
  let lastPayload = null;

  // Helper to safely write to stream
  const sendEvent = (eventName, data) => {
    try {
      if (eventName) {
        res.write(`event: ${eventName}\n`);
      }
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // Client likely disconnected
      cleanup();
    }
  };

  // Heartbeat ping so proxies don't close the connection
  const heartbeat = setInterval(() => {
    sendEvent('ping', {});
  }, HEARTBEAT_MS);

  // Fetch quotes from our own REST endpoint (reuses caching/fallback logic)
  const fetchAndPush = async () => {
    try {
      const port = process.env.PORT || 3001;
      const url = `http://localhost:${port}/api/quotes?symbols=${encodeURIComponent(symbols)}`;
      const response = await axios.get(url);
      const quotes = response.data; // expected array of { symbol, name, price, change, changePercent, timestamp }

      // Only push if payload changed to avoid unnecessary traffic
      const payload = { type: 'quotes', quotes, ts: Date.now() };
      const serialized = JSON.stringify(payload);
      if (serialized !== lastPayload) {
        lastPayload = serialized;
        sendEvent(null, payload);
      }
    } catch (err) {
      sendEvent('error', { message: 'Failed to fetch quotes', detail: err.message });
    }
  };

  const poller = setInterval(fetchAndPush, POLL_INTERVAL_MS);
  // Push immediately on connect
  fetchAndPush();

  const cleanup = () => {
    if (isClosed) return;
    isClosed = true;
    clearInterval(poller);
    clearInterval(heartbeat);
    try { res.end(); } catch (_) {}
  };

  req.on('close', cleanup);
  req.on('end', cleanup);
});

export default router;
