// routes/transactionsRoutes.js
import express from 'express';
import { buyStock, sellStock, getTransactions } from '../controllers/transactionsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Transaction routes
router.post('/buy', validateRequest(['symbol', 'quantity']), buyStock);
router.post('/sell', validateRequest(['symbol', 'quantity']), sellStock);
router.get('/', getTransactions);

export default router;