// utils/dynamicPricing.js

/**
 * Enhanced dynamic pricing utilities for portfolio transactions
 */

// Market hours check (simplified - assumes US Eastern Time)
export const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  // Market closed on weekends
  if (day === 0 || day === 6) return false;
  
  // Market open 9:30 AM to 4:00 PM ET (simplified)
  return hour >= 9 && hour < 16;
};

// Calculate market impact based on order size
export const calculateMarketImpact = (quantity, currentPrice, averageVolume = 1000000) => {
  const orderValue = quantity * currentPrice;
  const volumeRatio = quantity / averageVolume;
  
  // Simple market impact model
  let impactPercent = 0;
  
  if (volumeRatio > 0.1) {
    impactPercent = 0.03; // 3% for very large orders
  } else if (volumeRatio > 0.05) {
    impactPercent = 0.02; // 2% for large orders
  } else if (volumeRatio > 0.01) {
    impactPercent = 0.01; // 1% for medium orders
  } else {
    impactPercent = 0.002; // 0.2% for small orders
  }
  
  return impactPercent;
};

// Calculate bid-ask spread impact
export const calculateSpreadImpact = (orderType, bidPrice, askPrice) => {
  if (!bidPrice || !askPrice) return 0;
  
  const spread = askPrice - bidPrice;
  const midPrice = (bidPrice + askPrice) / 2;
  const spreadPercent = spread / midPrice;
  
  // Market orders typically pay half the spread
  return orderType === 'BUY' ? spreadPercent / 2 : -spreadPercent / 2;
};

// Get estimated execution price with slippage
export const getEstimatedExecutionPrice = (
  currentPrice, 
  quantity, 
  orderType, 
  options = {}
) => {
  const {
    averageVolume = 1000000,
    bidPrice = currentPrice * 0.999,
    askPrice = currentPrice * 1.001,
    volatility = 0.02,
    isMarketHours = isMarketOpen()
  } = options;
  
  let totalImpact = 0;
  
  // 1. Market impact based on order size
  const marketImpact = calculateMarketImpact(quantity, currentPrice, averageVolume);
  totalImpact += orderType === 'BUY' ? marketImpact : -marketImpact;
  
  // 2. Bid-ask spread impact
  const spreadImpact = calculateSpreadImpact(orderType, bidPrice, askPrice);
  totalImpact += spreadImpact;
  
  // 3. Time-of-day impact (higher during market close/open)
  if (!isMarketHours) {
    totalImpact += orderType === 'BUY' ? 0.005 : -0.005; // 0.5% after hours premium
  }
  
  // 4. Volatility impact (higher slippage in volatile markets)
  const volatilityImpact = volatility * 0.1; // 10% of volatility
  totalImpact += orderType === 'BUY' ? volatilityImpact : -volatilityImpact;
  
  const estimatedPrice = currentPrice * (1 + totalImpact);
  
  return {
    estimatedPrice,
    totalImpact,
    breakdown: {
      marketImpact: orderType === 'BUY' ? marketImpact : -marketImpact,
      spreadImpact,
      timeImpact: !isMarketHours ? (orderType === 'BUY' ? 0.005 : -0.005) : 0,
      volatilityImpact: orderType === 'BUY' ? volatilityImpact : -volatilityImpact
    }
  };
};

// Validate execution price against limits
export const validateExecutionPrice = (
  currentPrice, 
  estimatedPrice, 
  orderType, 
  maxSlippagePercent = 0.05
) => {
  const slippage = Math.abs((estimatedPrice - currentPrice) / currentPrice);
  
  if (slippage > maxSlippagePercent) {
    return {
      isValid: false,
      reason: `Estimated slippage of ${(slippage * 100).toFixed(2)}% exceeds maximum allowed ${(maxSlippagePercent * 100).toFixed(2)}%`,
      slippage,
      estimatedPrice,
      currentPrice
    };
  }
  
  // Additional checks for extreme price movements
  const priceChange = (estimatedPrice - currentPrice) / currentPrice;
  const expectedDirection = orderType === 'BUY' ? 1 : -1;
  
  if (Math.sign(priceChange) !== expectedDirection && Math.abs(priceChange) > 0.001) {
    return {
      isValid: false,
      reason: `Price movement direction unexpected for ${orderType} order`,
      slippage,
      estimatedPrice,
      currentPrice
    };
  }
  
  return {
    isValid: true,
    slippage,
    estimatedPrice,
    currentPrice
  };
};

// Format execution summary
export const formatExecutionSummary = (
  symbol, 
  quantity, 
  orderType, 
  currentPrice, 
  executionPrice
) => {
  const totalCost = quantity * executionPrice;
  const slippage = (executionPrice - currentPrice) / currentPrice;
  const slippageCost = quantity * Math.abs(executionPrice - currentPrice);
  
  return {
    summary: `${orderType} ${quantity} shares of ${symbol}`,
    pricing: {
      currentPrice,
      executionPrice,
      slippage: slippage * 100, // as percentage
      slippageCost
    },
    totals: {
      shares: quantity,
      totalValue: totalCost,
      estimatedFees: totalCost * 0.001, // 0.1% estimated fees
      netAmount: totalCost * (orderType === 'BUY' ? 1.001 : 0.999)
    },
    timestamp: new Date().toISOString(),
    executionNote: `Executed at ${executionPrice.toFixed(4)} with ${Math.abs(slippage * 100).toFixed(3)}% slippage`
  };
};

// Real-time price monitoring utilities
export const createPriceMonitor = (callback) => {
  const priceCache = new Map();
  const subscribers = new Set();
  
  const subscribe = (symbol, handler) => {
    subscribers.add({ symbol, handler });
  };
  
  const unsubscribe = (symbol, handler) => {
    subscribers.delete({ symbol, handler });
  };
  
  const updatePrice = (symbol, priceData) => {
    priceCache.set(symbol, {
      ...priceData,
      timestamp: Date.now()
    });
    
    // Notify subscribers
    subscribers.forEach(({ symbol: subSymbol, handler }) => {
      if (subSymbol === symbol || subSymbol === '*') {
        handler(priceData);
      }
    });
  };
  
  const getPrice = (symbol) => {
    return priceCache.get(symbol);
  };
  
  const getPriceAge = (symbol) => {
    const data = priceCache.get(symbol);
    return data ? Date.now() - data.timestamp : Infinity;
  };
  
  return {
    subscribe,
    unsubscribe,
    updatePrice,
    getPrice,
    getPriceAge,
    isStale: (symbol, maxAge = 5000) => getPriceAge(symbol) > maxAge
  };
};

export default {
  isMarketOpen,
  calculateMarketImpact,
  calculateSpreadImpact,
  getEstimatedExecutionPrice,
  validateExecutionPrice,
  formatExecutionSummary,
  createPriceMonitor
};