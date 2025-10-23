import Portfolio from '../models/Portfolio.js';
import { getQuote } from './marketDataService.js';

class PortfolioUpdateService {
  constructor() {
    this.io = null;
    this.activePortfolios = new Map();
    this.updateInterval = null;
  }

  initialize(io) {
    this.io = io;
    this.startRealTimeUpdates();
  }

  startRealTimeUpdates() {
    // Update portfolios every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateAllPortfolios();
    }, 30000);
  }

  async updateAllPortfolios() {
    try {
      const portfolios = await Portfolio.find({}).populate('user');
      
      for (const portfolio of portfolios) {
        if (portfolio.holdings.length > 0) {
          await this.updatePortfolioRealTime(portfolio);
        }
      }
    } catch (error) {
      console.error('Error updating portfolios:', error);
    }
  }

  async updatePortfolioRealTime(portfolio) {
    try {
      const holdingsWithCurrentData = await Promise.all(
        portfolio.holdings.map(async (holding) => {
          try {
            const quote = await getQuote(holding.symbol);
            const currentPrice = parseFloat(quote.price);
            const unrealizedPL = (currentPrice - holding.avgPrice) * holding.quantity;
            const unrealizedPLPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

            return {
              ...holding.toObject(),
              currentPrice,
              unrealizedPL,
              unrealizedPLPercent,
              marketValue: currentPrice * holding.quantity,
              change: quote.change || 0,
              changePercent: quote.percent_change || 0
            };
          } catch (error) {
            console.error(`Error fetching quote for ${holding.symbol}:`, error);
            return {
              ...holding.toObject(),
              currentPrice: holding.avgPrice,
              unrealizedPL: 0,
              unrealizedPLPercent: 0,
              marketValue: holding.avgPrice * holding.quantity,
              change: 0,
              changePercent: 0
            };
          }
        })
      );

      const totalInvested = holdingsWithCurrentData.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
      const totalCurrentValue = holdingsWithCurrentData.reduce((sum, h) => sum + h.marketValue, 0);
      const totalUnrealizedPL = totalCurrentValue - totalInvested;
      const totalUnrealizedPLPercent = totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

      const summary = {
        totalInvested,
        totalCurrentValue,
        totalUnrealizedPL,
        totalUnrealizedPLPercent,
        realizedPL: portfolio.realizedPL || 0,
        totalPL: totalUnrealizedPL + (portfolio.realizedPL || 0)
      };

      // Emit to user's room
      this.io.to(`user_${portfolio.user._id}`).emit('portfolio:update', {
        portfolio: {
          ...portfolio.toObject(),
          holdings: holdingsWithCurrentData
        },
        summary
      });

    } catch (error) {
      console.error('Error updating portfolio real-time:', error);
    }
  }

  addUserToRoom(userId, socketId) {
    this.io.sockets.sockets.get(socketId)?.join(`user_${userId}`);
  }

  removeUserFromRoom(userId, socketId) {
    this.io.sockets.sockets.get(socketId)?.leave(`user_${userId}`);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export default new PortfolioUpdateService();