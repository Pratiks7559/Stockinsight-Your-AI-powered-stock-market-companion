export default class RecommendationEngine {
  constructor() {
    this.riskTolerance = 0.20;
    // Prevent overexposure: do not exceed 40% of portfolio in one stock
    this.maxSingleStockExposure = 0.40;
    this.maxSectorExposure = 0.40;
    this.cashReserveTarget = 0.10;
  }

  analyzePortfolio(portfolio, totalValue) {
    const recommendations = [];
    const portfolioSummary = this.getPortfolioSummary(portfolio, totalValue);

    for (const holding of portfolio) {
      const recommendation = this.analyzeHolding(holding, portfolioSummary);
      recommendations.push(recommendation);
    }

    return {
      recommendations,
      portfolioSummary: this.generatePortfolioInsights(portfolioSummary, portfolio)
    };
  }

  analyzeHolding(holding, portfolioSummary) {
    // Normalize input fields to expected names
    const symbol = holding.symbol;
    const quantity = holding.quantity ?? holding.qty ?? 0;
    const averageCost = holding.averageCost ?? holding.avgCost ?? holding.avg_price ?? 0;
    const currentPrice = holding.currentPrice ?? holding.price ?? 0;
    const targetPrice = holding.targetPrice ?? holding.aiTargetPrice ?? holding.target_price ?? null;
    const stopLoss = holding.stopLoss ?? holding.stop_loss ?? null;
    const sentiment = holding.sentiment; // { score: -1..1 }
    const marketValue = holding.marketValue ?? (currentPrice * quantity);
    const plPercent = holding.plPercent ?? (
      averageCost > 0 ? ((currentPrice - averageCost) / averageCost) * 100 : 0
    );

    const exposure = portfolioSummary.totalValue > 0 ? (marketValue / portfolioSummary.totalValue) : 0;

    let action = 'HOLD';
    let confidence = 'Medium';
    const reasoning = [];

    // SELL Logic
    if (targetPrice != null && currentPrice >= targetPrice) {
      action = 'SELL';
      confidence = 'High';
      reasoning.push('Reached or exceeded target price: book profits');
    }
    if (stopLoss != null && currentPrice <= stopLoss) {
      action = 'SELL';
      confidence = 'High';
      reasoning.push('Stop-loss breached: protect downside risk');
    }
    if (exposure > this.maxSingleStockExposure) {
      action = 'SELL';
      confidence = confidence === 'High' ? 'High' : 'Medium';
      reasoning.push(`Overweight position: ${(exposure * 100).toFixed(1)}% > ${(this.maxSingleStockExposure * 100).toFixed(0)}%, trim position`);
    }

    // BUY Logic (only if not already SELL)
    if (action !== 'SELL') {
      if (
        averageCost > 0 &&
        currentPrice < averageCost &&
        (targetPrice != null ? currentPrice < targetPrice : true)
      ) {
        action = 'BUY';
        confidence = 'Medium';
        reasoning.push('Price below your average cost: potential averaging opportunity');
        if (targetPrice != null) reasoning.push('Below target price: favorable risk/reward');
      }
      if (sentiment?.score != null && sentiment.score > 0.2) {
        if (action === 'BUY') {
          confidence = 'High';
          reasoning.push('Positive sentiment supports increasing position');
        } else {
          // Consider light accumulation on positive backdrop if underexposed
          if (exposure < this.maxSingleStockExposure * 0.5) {
            action = 'BUY';
            confidence = 'Low';
            reasoning.push('Positive sentiment and low exposure: consider small add');
          }
        }
      }
      // Prevent overexposure
      if (exposure >= this.maxSingleStockExposure) {
        if (action === 'BUY') {
          action = 'HOLD';
          confidence = 'Low';
          reasoning.push('Exposure near limit: avoid increasing beyond 40%');
        }
      }
    }

    // HOLD Logic (if neither strong BUY nor SELL)
    if (action !== 'SELL' && action !== 'BUY') {
      if (stopLoss != null && targetPrice != null) {
        if (currentPrice > stopLoss && currentPrice < targetPrice) {
          action = 'HOLD';
          confidence = 'Medium';
          reasoning.push('Trading between stop-loss and target: maintain position');
        }
      }
      if (reasoning.length === 0) {
        reasoning.push('No strong signals: maintain current position');
      }
    }

    return {
      symbol,
      action,
      confidence,
      targetPrice: targetPrice ?? undefined,
      currentPrice,
      reasoning,
      exposure: Number((exposure * 100).toFixed(2)),
      plPercent: Number(plPercent.toFixed(2))
    };
  }

  getPortfolioSummary(portfolio, totalValue) {
    const sectors = {};
    let totalPL = 0;
    let totalCost = 0;

    portfolio.forEach(holding => {
      const sector = this.getSector(holding.symbol);
      const quantity = holding.quantity ?? 0;
      const averageCost = holding.averageCost ?? holding.avgCost ?? holding.avg_price ?? 0;
      const currentPrice = holding.currentPrice ?? holding.price ?? 0;
      const marketValue = holding.marketValue ?? (currentPrice * quantity);
      sectors[sector] = (sectors[sector] || 0) + marketValue;
      totalPL += (currentPrice - averageCost) * quantity;
      totalCost += averageCost * quantity;
    });

    return {
      totalValue,
      totalPL,
      plPercent: totalCost > 0 ? (totalPL / totalCost) * 100 : 0,
      sectors,
      holdingCount: portfolio.length
    };
  }

  generatePortfolioInsights(summary, portfolio) {
    const insights = {
      riskAssessment: 'Medium',
      diversificationIssues: [],
      suggestedActions: []
    };

    if (Math.abs(summary.plPercent) > 15) {
      insights.riskAssessment = 'High';
    } else if (Math.abs(summary.plPercent) < 5) {
      insights.riskAssessment = 'Low';
    }

    const sectorExposures = Object.entries(summary.sectors).map(([sector, value]) => ({
      sector,
      exposure: (value / summary.totalValue) * 100
    }));

    sectorExposures.forEach(({ sector, exposure }) => {
      if (exposure > this.maxSectorExposure * 100) {
        insights.diversificationIssues.push(
          `Overexposed to ${sector}: ${exposure.toFixed(1)}% (reduce to <40%)`
        );
      }
    });

    if (summary.holdingCount < 5) {
      insights.suggestedActions.push('Consider diversifying into 8-12 holdings for better risk distribution');
    }

    if (sectorExposures.length < 3) {
      insights.suggestedActions.push('Diversify across more sectors (healthcare, utilities, consumer goods)');
    }

    if (summary.plPercent < -10) {
      insights.suggestedActions.push('Portfolio down significantly, consider defensive stocks or cash position');
    }

    insights.suggestedActions.push(`Maintain ${this.cashReserveTarget * 100}% cash reserve for opportunities`);

    // Portfolio-level summary fields aligned with requested output
    insights.summary = {
      totalPL: Number(summary.totalPL.toFixed(2)),
      plPercent: Number(summary.plPercent.toFixed(2)),
      sectorExposures: sectorExposures.map(s => ({
        sector: s.sector,
        exposure: Number(s.exposure.toFixed(2))
      }))
    };

    return insights;
  }

  getSector(symbol) {
    const sectorMap = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'TSLA': 'Technology',
      'AMZN': 'Consumer Discretionary', 'NFLX': 'Communication Services',
      'JPM': 'Financial Services', 'BAC': 'Financial Services',
      'JNJ': 'Healthcare', 'PFE': 'Healthcare',
      'XOM': 'Energy', 'CVX': 'Energy'
    };
    return sectorMap[symbol] || 'Other';
  }
}