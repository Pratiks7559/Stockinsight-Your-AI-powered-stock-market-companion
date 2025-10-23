# app.py - FastAPI ML Microservice
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import asyncio
from prediction import StockPredictor
from sentiment import SentimentAnalyzer
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress plotly warning
import warnings
warnings.filterwarnings('ignore', message='Importing plotly failed')

app = FastAPI(title="StockInsight ML Service", version="1.0.0")

# Initialize ML components
predictor = StockPredictor()
sentiment_analyzer = SentimentAnalyzer()

# Pydantic models
class PredictionRequest(BaseModel):
    symbol: str
    horizon: int = 7

class SentimentRequest(BaseModel):
    symbol: str
    limit: int = 10

class RecommendationRequest(BaseModel):
    user_id: str
    holdings: List[Dict[str, Any]]

class RiskAnalysisRequest(BaseModel):
    holdings: List[Dict[str, Any]]

class TrainingRequest(BaseModel):
    symbols: Optional[List[str]] = None
    retrain_all: bool = False

@app.get("/")
async def root():
    return {"message": "StockInsight ML Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/risk-analyzer")
async def analyze_risk(request: RiskAnalysisRequest):
    """Analyze portfolio risk"""
    try:
        logger.info(f"Analyzing risk for portfolio")
        
        # Analyze portfolio composition
        portfolio_analysis = await analyze_portfolio(request.holdings)
        
        return {
            "risk_score": portfolio_analysis["risk_score"],
            "diversification_score": portfolio_analysis["diversification_score"],
            "sector_allocation": portfolio_analysis["sector_allocation"],
            "generated_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error analyzing risk: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")

@app.get("/predict")
async def predict_stock(symbol: str, horizon: int = 7):
    """Get stock price predictions using Prophet and LSTM models"""
    try:
        symbol = symbol.upper()
        logger.info(f"Generating prediction for {symbol} with horizon {horizon}")
        
        # Get prediction from our model
        prediction_result = await predictor.predict(symbol, horizon)
        
        return {
            "symbol": symbol,
            "horizon": horizon,
            "forecast": prediction_result["forecast"],
            "confidence": prediction_result["confidence"],
            "model": prediction_result["model"],
            "generated_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error predicting {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/sentiment")
async def analyze_sentiment(symbol: str, limit: int = 10):
    """Analyze news sentiment for a stock using FinBERT"""
    try:
        symbol = symbol.upper()
        logger.info(f"Analyzing sentiment for {symbol}")
        
        # Get sentiment analysis
        sentiment_result = await sentiment_analyzer.analyze(symbol, limit)
        
        return {
            "symbol": symbol,
            "sentiment": sentiment_result["sentiment"],
            "score": sentiment_result["score"],
            "summary": sentiment_result["summary"],
            "sources_analyzed": sentiment_result["sources_count"],
            "articles": sentiment_result.get("articles", []),
            "model": sentiment_result["model"],
            "analyzed_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error analyzing sentiment for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    """Generate portfolio recommendations and rebalancing suggestions"""
    try:
        logger.info(f"Generating recommendations for user {request.user_id}")
        
        # Generate recommendations
        recommendations = await generate_strong_recommendations(request.holdings)
        
        return {
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@app.post("/train")
async def train_models(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Retrain ML models with latest data"""
    try:
        logger.info("Starting model training")
        
        if request.retrain_all:
            background_tasks.add_task(predictor.retrain_all_models)
        elif request.symbols:
            background_tasks.add_task(predictor.retrain_symbols, request.symbols)
        else:
            background_tasks.add_task(predictor.retrain_popular_symbols)
        
        return {
            "message": "Training started",
            "status": "in_progress",
            "started_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error starting training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# Helper functions
async def analyze_portfolio(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze portfolio composition and risk"""
    if not holdings:
        return {
            "risk_score": 0,
            "diversification_score": 100,
            "sector_allocation": {}
        }
    
    # Calculate sector allocation
    sector_values = {}
    total_value = 0
    
    for holding in holdings:
        sector = holding.get("sector", "Unknown")
        value = holding["quantity"] * holding.get("avg_price", holding.get("avgPrice", 0))
        sector_values[sector] = sector_values.get(sector, 0) + value
        total_value += value
    
    sector_allocation = {
        sector: (value / total_value) * 100 
        for sector, value in sector_values.items()
    }
    
    # Calculate diversification score (higher is better)
    num_sectors = len(sector_allocation)
    max_sector_weight = max(sector_allocation.values()) if sector_allocation else 0
    diversification_score = min(100, (num_sectors * 20) - max_sector_weight)
    
    # Calculate risk score (0-100, higher is riskier)
    tech_weight = sector_allocation.get("Technology", 0)
    risk_score = min(100, tech_weight + (100 - diversification_score))
    
    return {
        "risk_score": round(risk_score, 2),
        "diversification_score": round(diversification_score, 2),
        "sector_allocation": {k: round(v, 2) for k, v in sector_allocation.items()}
    }

async def generate_strong_recommendations(holdings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate intelligent recommendations with multi-factor analysis"""
    recommendations = []
    
    for holding in holdings:
        symbol = holding["symbol"]
        avg_price = holding.get("avgPrice", holding.get("avg_price", 0))
        quantity = holding.get("quantity", 0)
        current_value = avg_price * quantity
        
        # Get prediction and sentiment
        try:
            prediction_result = await predictor.predict(symbol, 7)
            sentiment_result = await sentiment_analyzer.analyze(symbol, 10)
        except Exception as e:
            logger.error(f"Could not get prediction or sentiment for {symbol}: {e}")
            recommendations.append({
                "symbol": symbol,
                "recommendation": "HOLD",
                "reason": "Insufficient data for analysis. Monitor for updates.",
                "confidence": 0.4
            })
            continue

        # Multi-factor decision engine
        recommendation, reason, confidence = await _analyze_holding(
            symbol, avg_price, current_value, prediction_result, sentiment_result
        )

        recommendations.append({
            "symbol": symbol,
            "recommendation": recommendation,
            "reason": reason,
            "confidence": round(confidence, 2)
        })
        
    return recommendations

async def _analyze_holding(symbol: str, avg_price: float, position_value: float, 
                          prediction: Dict, sentiment: Dict) -> tuple:
    """Comprehensive holding analysis with multiple factors"""
    
    # Extract key metrics
    if prediction and prediction.get("forecast"):
        predicted_price = prediction["forecast"][-1]["predicted_price"]
        pred_confidence = prediction.get("confidence", 0.5)
        price_change_pct = ((predicted_price - avg_price) / avg_price) * 100
    else:
        predicted_price = avg_price
        pred_confidence = 0.3
        price_change_pct = 0
    
    sentiment_label = sentiment.get("sentiment", "neutral")
    sentiment_score = sentiment.get("score", 0.5)
    
    # Decision matrix with multiple thresholds
    strong_buy_threshold = 8.0   # 8%+ expected gain
    buy_threshold = 4.0          # 4%+ expected gain
    sell_threshold = -5.0        # 5%+ expected loss
    strong_sell_threshold = -10.0 # 10%+ expected loss
    
    # Base recommendation logic
    if price_change_pct >= strong_buy_threshold and sentiment_label == 'positive':
        recommendation = "BUY"
        reason = f"Strong upside potential (+{price_change_pct:.1f}%) with bullish sentiment"
        confidence = min(0.95, pred_confidence * 1.2)
        
    elif price_change_pct >= buy_threshold and sentiment_label in ['positive', 'neutral']:
        recommendation = "BUY"
        reason = f"Moderate upside expected (+{price_change_pct:.1f}%) with favorable outlook"
        confidence = min(0.85, pred_confidence * 1.1)
        
    elif price_change_pct <= strong_sell_threshold and sentiment_label == 'negative':
        recommendation = "SELL"
        reason = f"Significant downside risk ({price_change_pct:.1f}%) with bearish sentiment"
        confidence = min(0.90, pred_confidence * 1.15)
        
    elif price_change_pct <= sell_threshold and sentiment_label in ['negative', 'neutral']:
        recommendation = "SELL"
        reason = f"Downside risk detected ({price_change_pct:.1f}%) - consider reducing exposure"
        confidence = min(0.80, pred_confidence * 1.05)
        
    elif abs(price_change_pct) < 3.0:  # Low volatility expected
        if sentiment_label == 'positive':
            recommendation = "HOLD"
            reason = f"Stable price expected with positive sentiment - maintain position"
        elif sentiment_label == 'negative':
            recommendation = "HOLD"
            reason = f"Limited price movement expected despite negative sentiment"
        else:
            recommendation = "HOLD"
            reason = f"Neutral outlook - monitor for trend changes"
        confidence = pred_confidence * 0.9
        
    else:
        # Default HOLD with context
        recommendation = "HOLD"
        if price_change_pct > 0:
            reason = f"Modest upside (+{price_change_pct:.1f}%) but mixed signals - wait for clarity"
        else:
            reason = f"Some downside risk ({price_change_pct:.1f}%) but not significant - monitor closely"
        confidence = pred_confidence * 0.8
    
    # Adjust confidence based on sentiment strength
    if sentiment_score > 0.8 or sentiment_score < 0.2:
        confidence *= 1.1  # High sentiment conviction
    elif 0.4 <= sentiment_score <= 0.6:
        confidence *= 0.9  # Neutral sentiment reduces confidence
    
    # Position size consideration
    if position_value > 10000:  # Large position
        if recommendation == "SELL":
            reason += " (Large position - consider gradual exit)"
        elif recommendation == "BUY":
            reason += " (Large position - consider position sizing)"
    
    return recommendation, reason, max(0.3, min(0.95, confidence))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
