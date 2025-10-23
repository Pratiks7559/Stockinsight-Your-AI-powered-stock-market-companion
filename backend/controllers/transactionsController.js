// // controllers/transactionsController.js
// import Transaction from '../models/Transaction.js';
// import Portfolio from '../models/Portfolio.js';
// import { getQuote } from '../services/marketDataService.js';
// import { placeOrder } from '../services/brokerConnector.js';
// import { v4 as uuidv4 } from 'uuid';

// // Execute buy transaction
// export const buyStock = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { symbol, quantity, mode = 'SIMULATION' } = req.body;
//     const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

//     if (!symbol || !quantity) {
//       return res.status(400).json({ error: 'Symbol and quantity are required' });
//     }

//     // Get live price
//     const quote = await getQuote(symbol.toUpperCase());
//     const currentPrice = quote.price;
    
//     console.log(`Buy order: ${symbol.toUpperCase()} at live price ${currentPrice}`);

//     const existingTransaction = await Transaction.findOne({ idempotencyKey });
//     if (existingTransaction) {
//       return res.json({ message: 'Transaction already processed', transaction: existingTransaction });
//     }

//     const transaction = new Transaction({
//       user: userId,
//       symbol: symbol.toUpperCase(),
//       type: 'BUY',
//       quantity,
//       price: currentPrice,
//       mode,
//       status: 'EXECUTED',
//       idempotencyKey
//     });
//     await transaction.save();

//     await updatePortfolioOnBuy(userId, symbol.toUpperCase(), quantity, currentPrice);

//     res.json({ 
//       message: `Buy order processed for ${symbol.toUpperCase()}`, 
//       transaction, 
//       executedPrice: currentPrice,
//       symbol: symbol.toUpperCase(),
//       totalCost: currentPrice * quantity
//     });
//   } catch (error) {
//     console.error('Error processing buy order:', error);
//     res.status(500).json({ error: 'Failed to process buy order' });
//   }
// };

// // Execute sell transaction
// export const sellStock = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { symbol, quantity, mode = 'SIMULATION' } = req.body;
//     const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

//     if (!symbol || !quantity) {
//       return res.status(400).json({ error: 'Symbol and quantity are required' });
//     }

//     // Get live price
//     const quote = await getQuote(symbol.toUpperCase());
//     const currentPrice = quote.price;
    
//     console.log(`Sell order: ${symbol.toUpperCase()} at market price ${currentPrice}`);

//     const existingTransaction = await Transaction.findOne({ idempotencyKey });
//     if (existingTransaction) {
//       return res.json({ message: 'Transaction already processed', transaction: existingTransaction });
//     }

//     const portfolio = await Portfolio.findOne({ user: userId });
//     const holding = portfolio?.holdings.find(h => h.symbol === symbol.toUpperCase());
    
//     if (!holding || holding.quantity < quantity) {
//       return res.status(400).json({ error: 'Insufficient shares to sell' });
//     }

//     const transaction = new Transaction({
//       user: userId,
//       symbol: symbol.toUpperCase(),
//       type: 'SELL',
//       quantity,
//       price: currentPrice,
//       mode,
//       status: 'EXECUTED',
//       idempotencyKey
//     });
//     await transaction.save();

//     await updatePortfolioOnSell(userId, symbol.toUpperCase(), quantity, currentPrice);

//     res.json({ 
//       message: `Sell order processed for ${symbol.toUpperCase()}`, 
//       transaction, 
//       executedPrice: currentPrice,
//       symbol: symbol.toUpperCase(),
//       marketValue: currentPrice * quantity,
//       totalReceived: currentPrice * quantity
//     });
//   } catch (error) {
//     console.error('Error processing sell order:', error);
//     res.status(500).json({ error: 'Failed to process sell order' });
//   }
// };

// // Get transaction history
// export const getTransactions = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { symbol, type, mode, limit = 50, offset = 0 } = req.query;

//     const filter = { user: userId };
//     if (symbol) filter.symbol = symbol.toUpperCase();
//     if (type) filter.type = type;
//     if (mode) filter.mode = mode;

//     const transactions = await Transaction.find(filter)
//       .sort({ executedAt: -1 })
//       .limit(parseInt(limit))
//       .skip(parseInt(offset));

//     const total = await Transaction.countDocuments(filter);

//     res.json({
//       transactions,
//       pagination: {
//         total,
//         limit: parseInt(limit),
//         offset: parseInt(offset),
//         hasMore: total > parseInt(offset) + parseInt(limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     res.status(500).json({ error: 'Failed to fetch transactions' });
//   }
// };

// // Helper function to update portfolio on buy
// async function updatePortfolioOnBuy(userId, symbol, quantity, price) {
//   let portfolio = await Portfolio.findOne({ user: userId });
//   if (!portfolio) {
//     portfolio = new Portfolio({ user: userId, holdings: [], realizedPL: 0, cashBalance: 0 });
//   }

//   const existingHoldingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
  
//   if (existingHoldingIndex >= 0) {
//     // Update existing holding with weighted average price
//     const existingHolding = portfolio.holdings[existingHoldingIndex];
//     const totalQuantity = existingHolding.quantity + quantity;
//     const totalValue = (existingHolding.avgPrice * existingHolding.quantity) + (price * quantity);
    
//     portfolio.holdings[existingHoldingIndex].quantity = totalQuantity;
//     portfolio.holdings[existingHoldingIndex].avgPrice = totalValue / totalQuantity;
//   } else {
//     // Get sector info
//     try {
//       const quote = await getQuote(symbol);
//       portfolio.holdings.push({
//         symbol,
//         name: quote.name || `${symbol} Inc.`,
//         quantity,
//         avgPrice: price,
//         sector: quote.sector || 'Technology'
//       });
//     } catch (error) {
//       console.error('Error fetching sector info:', error);
//       portfolio.holdings.push({
//         symbol,
//         name: `${symbol} Inc.`,
//         quantity,
//         avgPrice: price,
//         sector: 'Technology'
//       });
//     }
//   }

//   await portfolio.save();
// }

// // Helper function to update portfolio on sell
// async function updatePortfolioOnSell(userId, symbol, quantity, sellPrice) {
//   const portfolio = await Portfolio.findOne({ user: userId });
//   const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
  
//   if (holdingIndex >= 0) {
//     const holding = portfolio.holdings[holdingIndex];
    
//     // Calculate P&L: (current market price - average cost) * quantity sold
//     const avgCost = holding.avgPrice;
//     const realizedPL = (sellPrice - avgCost) * quantity;
//     const saleAmount = sellPrice * quantity;
    
//     portfolio.realizedPL = (portfolio.realizedPL || 0) + realizedPL;
//     portfolio.cashBalance = (portfolio.cashBalance || 0) + saleAmount;
    
//     holding.quantity -= quantity;
    
//     if (holding.quantity <= 0) {
//       portfolio.holdings.splice(holdingIndex, 1);
//     }
    
//     await portfolio.save();
    
//     console.log(`Sold ${quantity} shares of ${symbol} at market price ${sellPrice} (avg cost: ${avgCost}). Market value received: ${saleAmount.toFixed(2)}, P&L: ${realizedPL.toFixed(2)}`);
//   }
// }
// controllers/transactionsController.js
import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';
import { getQuote } from '../services/marketDataService.js';
import { v4 as uuidv4 } from 'uuid';

// Execute buy transaction
export const buyStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, quantity, price, mode = 'SIMULATION' } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: 'Symbol, quantity, and price are required' });
    }

    // Validate quantity
    const parsedQuantity = parseFloat(quantity);
    if (parsedQuantity <= 0 || isNaN(parsedQuantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    const currentPrice = parseFloat(price);
    
    console.log(`Buy order: ${symbol.toUpperCase()} at confirmed price ${currentPrice}, Quantity: ${parsedQuantity}`);

    // Check for duplicate transaction
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if (existingTransaction) {
      return res.json({ message: 'Transaction already processed', transaction: existingTransaction });
    }

    // Create transaction first
    const transaction = new Transaction({
      user: userId,
      symbol: symbol.toUpperCase(),
      type: 'BUY',
      quantity: parsedQuantity,
      price: currentPrice,
      totalAmount: currentPrice * parsedQuantity,
      mode,
      status: 'EXECUTED',
      idempotencyKey,
      executedAt: new Date()
    });
    await transaction.save();

    // Update portfolio with proper average cost calculation
    await updatePortfolioOnBuy(userId, symbol.toUpperCase(), parsedQuantity, currentPrice);

    res.json({ 
      message: `Buy order processed for ${symbol.toUpperCase()}`, 
      transaction, 
      executedPrice: currentPrice,
      symbol: symbol.toUpperCase(),
      totalCost: currentPrice * parsedQuantity
    });
  } catch (error) {
    console.error('Error processing buy order:', error);
    res.status(500).json({ error: 'Failed to process buy order: ' + error.message });
  }
};

// Execute sell transaction
export const sellStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, quantity, price, mode = 'SIMULATION' } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: 'Symbol, quantity, and price are required' });
    }

    // Validate quantity
    const parsedQuantity = parseFloat(quantity);
    if (parsedQuantity <= 0 || isNaN(parsedQuantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    const currentPrice = parseFloat(price);
    
    console.log(`Sell order: ${symbol.toUpperCase()} at confirmed price ${currentPrice}, Quantity: ${parsedQuantity}`);

    // Check portfolio for sufficient shares
    const portfolio = await Portfolio.findOne({ user: userId });
    const holding = portfolio?.holdings.find(h => h.symbol === symbol.toUpperCase());
    
    if (!holding) {
      return res.status(400).json({ error: `No holdings found for ${symbol.toUpperCase()}` });
    }

    if (holding.quantity < parsedQuantity) {
      return res.status(400).json({ 
        error: `Insufficient shares to sell. You have ${holding.quantity} shares, trying to sell ${parsedQuantity}` 
      });
    }

    // Check for duplicate transaction
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if (existingTransaction) {
      return res.json({ message: 'Transaction already processed', transaction: existingTransaction });
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      symbol: symbol.toUpperCase(),
      type: 'SELL',
      quantity: parsedQuantity,
      price: currentPrice,
      totalAmount: currentPrice * parsedQuantity,
      mode,
      status: 'EXECUTED',
      idempotencyKey,
      executedAt: new Date()
    });
    await transaction.save();

    // Update portfolio with proper P&L calculation
    await updatePortfolioOnSell(userId, symbol.toUpperCase(), parsedQuantity, currentPrice, holding.avgPrice);

    res.json({ 
      message: `Sell order processed for ${symbol.toUpperCase()}`, 
      transaction, 
      executedPrice: currentPrice,
      symbol: symbol.toUpperCase(),
      marketValue: currentPrice * parsedQuantity,
      totalReceived: currentPrice * parsedQuantity,
      averageCost: holding.avgPrice,
      realizedPL: (currentPrice - holding.avgPrice) * parsedQuantity
    });
  } catch (error) {
    console.error('Error processing sell order:', error);
    res.status(500).json({ error: 'Failed to process sell order: ' + error.message });
  }
};

// Get transaction history
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, type, mode, limit = 50, offset = 0 } = req.query;

    const filter = { user: userId };
    if (symbol) filter.symbol = symbol.toUpperCase();
    if (type) filter.type = type;
    if (mode) filter.mode = mode;

    const transactions = await Transaction.find(filter)
      .sort({ executedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Helper function to update portfolio on buy - FIXED average cost calculation
async function updatePortfolioOnBuy(userId, symbol, quantity, price) {
  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    portfolio = new Portfolio({ 
      user: userId, 
      holdings: [], 
      realizedPL: 0, 
      cashBalance: 0,
      totalInvested: 0,
      totalCurrentValue: 0
    });
  }

  const existingHoldingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
  
  if (existingHoldingIndex >= 0) {
    // Update existing holding with weighted average price
    const existingHolding = portfolio.holdings[existingHoldingIndex];
    const totalQuantity = existingHolding.quantity + quantity;
    const totalCost = (existingHolding.avgPrice * existingHolding.quantity) + (price * quantity);
    
    portfolio.holdings[existingHoldingIndex].quantity = totalQuantity;
    portfolio.holdings[existingHoldingIndex].avgPrice = totalCost / totalQuantity;
    portfolio.holdings[existingHoldingIndex].currentPrice = price;
    portfolio.holdings[existingHoldingIndex].lastUpdated = new Date();
  } else {
    // Add new holding
    try {
      const quote = await getQuote(symbol);
      portfolio.holdings.push({
        symbol,
        name: quote.name || `${symbol} Inc.`,
        quantity,
        avgPrice: price,
        currentPrice: price,
        sector: quote.sector || 'Technology',
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error fetching sector info:', error);
      portfolio.holdings.push({
        symbol,
        name: `${symbol} Inc.`,
        quantity,
        avgPrice: price,
        currentPrice: price,
        sector: 'Technology',
        lastUpdated: new Date()
      });
    }
  }

  // Update portfolio totals
  portfolio.totalInvested = portfolio.holdings.reduce((total, holding) => {
    return total + (holding.avgPrice * holding.quantity);
  }, 0);

  portfolio.totalCurrentValue = portfolio.holdings.reduce((total, holding) => {
    return total + (holding.currentPrice * holding.quantity);
  }, 0);

  portfolio.lastUpdated = new Date();

  await portfolio.save();
  console.log(`Portfolio updated after BUY: ${quantity} shares of ${symbol} at ${price}`);
}

// Helper function to update portfolio on sell - FIXED P&L calculation
async function updatePortfolioOnSell(userId, symbol, quantity, sellPrice, avgCost) {
  const portfolio = await Portfolio.findOne({ user: userId });
  const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
  
  if (holdingIndex >= 0) {
    const holding = portfolio.holdings[holdingIndex];
    
    // Calculate realized P&L: (sell price - average cost) * quantity sold
    const realizedPL = (sellPrice - avgCost) * quantity;
    const saleAmount = sellPrice * quantity;
    
    // Update portfolio totals
    portfolio.realizedPL = (portfolio.realizedPL || 0) + realizedPL;
    portfolio.cashBalance = (portfolio.cashBalance || 0) + saleAmount;
    
    // Update holding
    holding.quantity -= quantity;
    
    if (holding.quantity <= 0) {
      // Remove holding if quantity is zero
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      // Update current price for remaining shares
      holding.currentPrice = sellPrice;
      holding.lastUpdated = new Date();
    }
    
    // Update portfolio investment totals
    portfolio.totalInvested = portfolio.holdings.reduce((total, holding) => {
      return total + (holding.avgPrice * holding.quantity);
    }, 0);

    portfolio.totalCurrentValue = portfolio.holdings.reduce((total, holding) => {
      return total + (holding.currentPrice * holding.quantity);
    }, 0);

    portfolio.lastUpdated = new Date();
    
    await portfolio.save();
    
    console.log(`Sold ${quantity} shares of ${symbol}. ` +
      `Avg Cost: ${avgCost.toFixed(2)}, Sell Price: ${sellPrice.toFixed(2)}, ` +
      `Market Value: ${saleAmount.toFixed(2)}, Realized P&L: ${realizedPL.toFixed(2)}`);
  }
}

// Get specific transaction
export const getTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// Cancel transaction (if pending)
export const cancelTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      return res.status(44).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending transactions can be cancelled' });
    }

    transaction.status = 'CANCELLED';
    transaction.cancelledAt = new Date();
    await transaction.save();

    res.json({ message: 'Transaction cancelled successfully', transaction });
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    res.status(500).json({ error: 'Failed to cancel transaction' });
  }
};