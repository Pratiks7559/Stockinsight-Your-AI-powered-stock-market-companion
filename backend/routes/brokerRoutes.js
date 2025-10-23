// routes/brokerRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { placeOrder, validateWebhook } from '../services/brokerConnector.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Broker connection endpoint (OAuth flow would start here)
router.post('/connect', protect, async (req, res) => {
  try {
    // In real implementation, this would initiate OAuth flow
    // For now, return success for mock broker
    res.json({ 
      message: 'Broker connection initiated',
      redirectUrl: '/broker/callback',
      status: 'connected'
    });
  } catch (error) {
    console.error('Error connecting to broker:', error);
    res.status(500).json({ error: 'Failed to connect to broker' });
  }
});

// Place order directly with broker (alternative to transaction routes)
router.post('/place-order', protect, async (req, res) => {
  try {
    const { symbol, quantity, side, type, price, idempotencyKey } = req.body;
    
    if (!symbol || !quantity || !side || !type) {
      return res.status(400).json({ error: 'Missing required order parameters' });
    }

    const brokerOrderId = await placeOrder({
      symbol: symbol.toUpperCase(),
      quantity,
      side: side.toUpperCase(),
      type: type.toUpperCase(),
      price,
      idempotencyKey
    });

    res.json({ 
      message: 'Order placed with broker',
      brokerOrderId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error placing broker order:', error);
    res.status(500).json({ error: 'Failed to place order with broker' });
  }
});

// Webhook endpoint for broker order updates
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-broker-signature'];
    const payload = JSON.stringify(req.body);

    // Validate webhook signature
    if (!validateWebhook(payload, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { order_id, status, executed_price, executed_at } = req.body;

    // Find and update the corresponding transaction
    const transaction = await Transaction.findOne({ brokerOrderId: order_id });
    
    if (!transaction) {
      console.warn(`Received webhook for unknown order: ${order_id}`);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update transaction status
    transaction.status = status.toUpperCase();
    
    if (status.toUpperCase() === 'EXECUTED') {
      transaction.price = executed_price || transaction.price;
      transaction.executedAt = new Date(executed_at) || new Date();
      
      // Update portfolio if order was executed
      // This would trigger portfolio recalculation
      console.log(`Order ${order_id} executed for ${transaction.symbol}`);
    }

    await transaction.save();

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing broker webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;