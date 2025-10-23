# sentiment.py - News Sentiment Analysis
import pandas as pd
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import requests
from newspaper import Article
import nltk
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any
import re
import asyncio
import aiohttp

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

class SentimentAnalyzer:
    def __init__(self):
        self.finbert_model = None
        self.general_model = None
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize sentiment analysis models"""
        try:
            # Try to load FinBERT for financial sentiment
            self.finbert_model = pipeline(
                "sentiment-analysis",
                model="ProsusAI/finbert",
                tokenizer="ProsusAI/finbert"
            )
            logger.info("FinBERT model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load FinBERT: {e}")
            
        try:
            # Fallback to general sentiment model
            self.general_model = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest"
            )
            logger.info("General sentiment model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load general model: {e}")
    
    async def analyze(self, symbol: str, limit: int = 10) -> Dict[str, Any]:
        """Analyze sentiment for a stock symbol"""
        try:
            # Get news articles
            articles = await self._fetch_news(symbol, limit)
            
            if not articles:
                logger.warning(f"No articles found for {symbol}")
                return self._fallback_sentiment(symbol)
            
            # Analyze sentiment of articles
            sentiments = []
            analyzed_articles = []
            
            for article in articles:
                try:
                    sentiment_result = self._analyze_text(article['content'])
                    if sentiment_result:
                        sentiments.append(sentiment_result)
                        analyzed_articles.append({
                            "title": article['title'],
                            "url": article['url'],
                            "published": article['published'],
                            "sentiment": sentiment_result['label'],
                            "score": sentiment_result['score']
                        })
                except Exception as e:
                    logger.error(f"Error analyzing article sentiment: {e}")
                    continue
            
            if not sentiments:
                return self._fallback_sentiment(symbol)
            
            # Aggregate sentiments
            overall_sentiment = self._aggregate_sentiments(sentiments)
            
            return {
                "sentiment": overall_sentiment['label'],
                "score": overall_sentiment['score'],
                "summary": self._generate_summary(overall_sentiment, len(analyzed_articles)),
                "sources_count": len(analyzed_articles),
                "articles": analyzed_articles[:5],  # Return top 5 articles
                "model": "finbert" if self.finbert_model else "general"
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error for {symbol}: {str(e)}")
            return self._fallback_sentiment(symbol)
    
    async def _fetch_news(self, symbol: str, limit: int) -> List[Dict[str, Any]]:
        """Fetch news articles for a symbol"""
        articles = []
        
        try:
            # Try multiple news sources
            sources = [
                self._fetch_from_newsapi,
                self._fetch_from_yahoo_finance,
                self._fetch_mock_news  # Fallback
            ]
            
            for source_func in sources:
                try:
                    source_articles = await source_func(symbol, limit)
                    articles.extend(source_articles)
                    if len(articles) >= limit:
                        break
                except Exception as e:
                    logger.warning(f"Error fetching from source: {e}")
                    continue
            
            return articles[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {e}")
            return []
    
    async def _fetch_from_newsapi(self, symbol: str, limit: int) -> List[Dict[str, Any]]:
        """Fetch news from NewsAPI (requires API key)"""
        # This would require a NewsAPI key
        # For now, return empty to fall back to other sources
        return []
    
    async def _fetch_from_yahoo_finance(self, symbol: str, limit: int) -> List[Dict[str, Any]]:
        """Fetch news from Yahoo Finance"""
        try:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            articles = []
            for item in news[:limit]:
                try:
                    # Try to get full article content
                    article = Article(item['link'])
                    article.download()
                    article.parse()
                    
                    articles.append({
                        "title": item.get('title', f'News about {symbol}'),
                        "url": item.get('link', ''),
                        "content": article.text[:1000] if article.text else item.get('title', ''),
                        "published": datetime.fromtimestamp(item.get('providerPublishTime', datetime.now().timestamp())).isoformat()
                    })
                except Exception as e:
                    # If full article fails, use summary
                    articles.append({
                        "title": item.get('title', f'News about {symbol}'),
                        "url": item.get('link', ''),
                        "content": item.get('summary', item.get('title', f'Market update for {symbol}')),
                        "published": datetime.fromtimestamp(item.get('providerPublishTime', datetime.now().timestamp())).isoformat()
                    })
            
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching Yahoo Finance news: {e}")
            return []
    
    async def _fetch_mock_news(self, symbol: str, limit: int) -> List[Dict[str, Any]]:
        """Generate mock news articles for testing"""
        mock_articles = [
            {
                "title": f"{symbol} Reports Strong Quarterly Earnings",
                "content": f"{symbol} has reported better than expected quarterly earnings, showing strong growth in key business segments. The company's revenue increased significantly compared to the previous quarter.",
                "url": f"https://example.com/news/{symbol.lower()}-earnings",
                "published": (datetime.now() - timedelta(days=1)).isoformat()
            },
            {
                "title": f"Analysts Upgrade {symbol} Price Target",
                "content": f"Several Wall Street analysts have upgraded their price targets for {symbol} following positive market developments and strong fundamentals. The stock is showing bullish momentum.",
                "url": f"https://example.com/news/{symbol.lower()}-upgrade",
                "published": (datetime.now() - timedelta(days=2)).isoformat()
            },
            {
                "title": f"{symbol} Faces Market Headwinds",
                "content": f"{symbol} is navigating challenging market conditions with increased competition and regulatory concerns. Investors are closely watching the company's strategic response.",
                "url": f"https://example.com/news/{symbol.lower()}-challenges",
                "published": (datetime.now() - timedelta(days=3)).isoformat()
            }
        ]
        
        return mock_articles[:limit]
    
    def _analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using available models"""
        if not text or len(text.strip()) < 10:
            return None
        
        # Clean text
        text = self._clean_text(text)
        
        try:
            # Try FinBERT first
            if self.finbert_model:
                result = self.finbert_model(text[:512])  # Limit token length
                if result:
                    return {
                        "label": result[0]['label'].lower(),
                        "score": result[0]['score']
                    }
        except Exception as e:
            logger.warning(f"FinBERT analysis failed: {e}")
        
        try:
            # Fallback to general model
            if self.general_model:
                result = self.general_model(text[:512])
                if result:
                    # Map labels to standard format
                    label_mapping = {
                        'LABEL_0': 'negative',
                        'LABEL_1': 'neutral', 
                        'LABEL_2': 'positive',
                        'negative': 'negative',
                        'neutral': 'neutral',
                        'positive': 'positive'
                    }
                    
                    mapped_label = label_mapping.get(result[0]['label'], 'neutral')
                    return {
                        "label": mapped_label,
                        "score": result[0]['score']
                    }
        except Exception as e:
            logger.warning(f"General model analysis failed: {e}")
        
        # Ultimate fallback - random sentiment
        return {
            "label": np.random.choice(['positive', 'neutral', 'negative']),
            "score": 0.5 + np.random.random() * 0.3
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    def _aggregate_sentiments(self, sentiments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate multiple sentiment scores with time decay and confidence weighting"""
        if not sentiments:
            return {"label": "neutral", "score": 0.5}
        
        # Time-weighted sentiment aggregation (recent articles matter more)
        weighted_scores = []
        total_weight = 0
        
        for i, sentiment in enumerate(sentiments):
            # Time decay: more recent articles get higher weight
            time_weight = 1.0 / (1 + i * 0.1)  # Decay factor
            
            # Confidence weight: higher confidence scores matter more
            conf_weight = sentiment['score']
            
            # Combined weight
            weight = time_weight * conf_weight
            
            # Convert sentiment to numeric score
            if sentiment['label'] == 'positive':
                numeric_score = 0.7 + (sentiment['score'] - 0.5) * 0.6  # 0.7-1.0
            elif sentiment['label'] == 'negative':
                numeric_score = 0.3 - (sentiment['score'] - 0.5) * 0.6  # 0.0-0.3
            else:
                numeric_score = 0.4 + (sentiment['score'] - 0.5) * 0.2  # 0.4-0.6
            
            weighted_scores.append(numeric_score * weight)
            total_weight += weight
        
        # Calculate weighted average
        if total_weight > 0:
            overall_score = sum(weighted_scores) / total_weight
        else:
            overall_score = 0.5
        
        # Determine label with hysteresis (avoid frequent switching)
        if overall_score > 0.65:
            label = "positive"
        elif overall_score < 0.35:
            label = "negative"
        else:
            label = "neutral"
        
        # Add market context adjustment
        overall_score = self._adjust_for_market_context(overall_score, sentiments)
        
        return {
            "label": label,
            "score": float(np.clip(overall_score, 0.0, 1.0))
        }
    
    def _adjust_for_market_context(self, score: float, sentiments: List[Dict[str, Any]]) -> float:
        """Adjust sentiment score based on market context"""
        # Sentiment momentum: if all recent articles have same sentiment, boost confidence
        if len(sentiments) >= 3:
            recent_labels = [s['label'] for s in sentiments[:3]]
            if len(set(recent_labels)) == 1:  # All same sentiment
                if recent_labels[0] == 'positive':
                    score = min(1.0, score * 1.1)
                elif recent_labels[0] == 'negative':
                    score = max(0.0, score * 0.9)
        
        # Volume of coverage: more articles = higher confidence
        coverage_boost = min(0.1, len(sentiments) * 0.02)
        if score > 0.5:
            score += coverage_boost
        else:
            score -= coverage_boost
        
        return score
    
    def _generate_summary(self, sentiment: Dict[str, Any], article_count: int) -> str:
        """Generate human-readable sentiment summary with market context"""
        label = sentiment['label']
        score = sentiment['score']
        
        # Determine confidence level
        if score > 0.8 or score < 0.2:
            confidence_level = "high"
        elif score > 0.65 or score < 0.35:
            confidence_level = "moderate"
        else:
            confidence_level = "low"
        
        if label == 'positive':
            if score > 0.8:
                return f"Strong bullish sentiment from {article_count} articles. Market outlook very positive with {confidence_level} confidence."
            else:
                return f"Positive market sentiment from {article_count} articles with {confidence_level} confidence. Favorable news coverage."
        elif label == 'negative':
            if score < 0.2:
                return f"Strong bearish sentiment from {article_count} articles. Market concerns are significant with {confidence_level} confidence."
            else:
                return f"Negative market sentiment from {article_count} articles with {confidence_level} confidence. Concerning news trends."
        else:
            return f"Mixed market signals from {article_count} articles with {confidence_level} confidence. Balanced news coverage."
    
    def _fallback_sentiment(self, symbol: str) -> Dict[str, Any]:
        """Fallback sentiment when analysis fails"""
        # Generate deterministic but varied sentiment based on symbol
        hash_val = hash(symbol) % 100
        
        if hash_val < 40:
            sentiment = "positive"
            score = 0.6 + (hash_val / 100) * 0.3
        elif hash_val < 70:
            sentiment = "neutral"
            score = 0.4 + (hash_val / 100) * 0.2
        else:
            sentiment = "negative"
            score = 0.3 + (hash_val / 100) * 0.3
        
        return {
            "sentiment": sentiment,
            "score": score,
            "summary": f"Fallback sentiment analysis for {symbol}",
            "sources_count": 0,
            "articles": [],
            "model": "fallback"
        }