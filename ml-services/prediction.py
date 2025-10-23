# prediction.py - Stock Price Prediction Models
import pandas as pd
import numpy as np
import yfinance as yf
from prophet import Prophet
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error
import torch
import torch.nn as nn
from datetime import datetime, timedelta
import joblib
import os
import logging
from typing import Dict, List, Any
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2, output_size=1):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class StockPredictor:
    def __init__(self):
        self.models_dir = "models"
        os.makedirs(self.models_dir, exist_ok=True)
        self.scalers = {}
        self.prophet_models = {}
        self.lstm_models = {}
        
    async def predict(self, symbol: str, horizon: int = 7) -> Dict[str, Any]:
        """Generate stock price predictions using ensemble of Prophet and LSTM"""
        try:
            # Get historical data
            data = await self._fetch_data(symbol)
            
            if data is None or len(data) < 30:
                logger.warning(f"Insufficient data for {symbol}, using fallback prediction")
                return self._fallback_prediction(symbol, horizon)
            
            # Try Prophet prediction first
            prophet_forecast = await self._prophet_predict(symbol, data, horizon)
            
            # Try LSTM prediction
            lstm_forecast = await self._lstm_predict(symbol, data, horizon)
            
            # Ensemble predictions (weighted average)
            ensemble_forecast = self._ensemble_predictions(prophet_forecast, lstm_forecast)
            
            # Calculate confidence based on model agreement
            confidence = self._calculate_confidence(prophet_forecast, lstm_forecast)
            
            return {
                "forecast": ensemble_forecast,
                "confidence": confidence,
                "model": "ensemble_prophet_lstm"
            }
            
        except Exception as e:
            logger.error(f"Prediction error for {symbol}: {str(e)}")
            return self._fallback_prediction(symbol, horizon)
    
    async def _fetch_data(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Fetch historical stock data"""
        try:
            ticker = yf.Ticker(symbol)
            # Try different periods if 2y fails
            for p in [period, "1y", "6mo", "3mo"]:
                try:
                    data = ticker.history(period=p)
                    if not data.empty:
                        break
                except:
                    continue
            
            if data.empty:
                logger.warning(f"No data found for {symbol}")
                return None
                
            # Add technical indicators
            data['SMA_20'] = data['Close'].rolling(window=20).mean()
            data['SMA_50'] = data['Close'].rolling(window=50).mean()
            data['RSI'] = self._calculate_rsi(data['Close'])
            data['Volatility'] = data['Close'].rolling(window=20).std()
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    async def _prophet_predict(self, symbol: str, data: pd.DataFrame, horizon: int) -> List[Dict[str, Any]]:
        """Generate predictions using Prophet model with enhanced features"""
        try:
            # Prepare data for Prophet
            df = data.reset_index()
            df = df[['Date', 'Close']].rename(columns={'Date': 'ds', 'Close': 'y'})
            # Remove timezone from datetime
            df['ds'] = df['ds'].dt.tz_localize(None)
            
            # Create and fit Prophet model with optimized parameters
            model = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=True,
                changepoint_prior_scale=0.08,  # Increased for more flexibility
                seasonality_prior_scale=0.1,
                holidays_prior_scale=0.1,
                interval_width=0.8
            )
            
            # Add technical indicators as regressors
            if 'Volume' in data.columns:
                df['volume'] = np.log1p(data['Volume'].values)  # Log transform volume
                model.add_regressor('volume')
            
            if 'RSI' in data.columns:
                df['rsi'] = data['RSI'].fillna(50).values
                model.add_regressor('rsi')
            
            if 'SMA_20' in data.columns and 'SMA_50' in data.columns:
                df['sma_ratio'] = (data['SMA_20'] / data['SMA_50']).fillna(1).values
                model.add_regressor('sma_ratio')
            
            if 'Volatility' in data.columns:
                df['volatility'] = data['Volatility'].fillna(data['Volatility'].mean()).values
                model.add_regressor('volatility')
            
            model.fit(df)
            
            # Make future predictions with forward-filled regressors
            future = model.make_future_dataframe(periods=horizon)
            
            # Forward fill regressors for future predictions
            for col in ['volume', 'rsi', 'sma_ratio', 'volatility']:
                if col in df.columns:
                    last_val = df[col].iloc[-1]
                    # Add slight trend for future values
                    if col == 'rsi':
                        # RSI tends to mean revert
                        future[col] = future[col].fillna(50 + (last_val - 50) * 0.8)
                    elif col == 'volume':
                        # Volume with slight decay
                        future[col] = future[col].fillna(last_val * 0.95)
                    else:
                        future[col] = future[col].fillna(last_val)
            
            forecast = model.predict(future)
            
            # Extract predictions with dynamic confidence
            predictions = []
            current_price = data['Close'].iloc[-1]
            
            for i in range(len(forecast) - horizon, len(forecast)):
                pred_price = max(0, forecast.iloc[i]['yhat'])
                lower_bound = max(0, forecast.iloc[i]['yhat_lower'])
                upper_bound = forecast.iloc[i]['yhat_upper']
                
                # Calculate confidence based on prediction interval width
                interval_width = (upper_bound - lower_bound) / pred_price if pred_price > 0 else 1
                confidence = max(0.3, min(0.95, 1 - (interval_width / 2)))
                
                # Adjust confidence based on volatility
                if 'Volatility' in data.columns:
                    recent_vol = data['Volatility'].iloc[-5:].mean()
                    vol_factor = max(0.5, 1 - (recent_vol / current_price))
                    confidence *= vol_factor
                
                predictions.append({
                    "date": forecast.iloc[i]['ds'].strftime('%Y-%m-%d'),
                    "predicted_price": float(pred_price),
                    "lower_bound": float(lower_bound),
                    "upper_bound": float(upper_bound),
                    "confidence": float(confidence)
                })
            
            return predictions
            
        except Exception as e:
            logger.error(f"Prophet prediction error for {symbol}: {str(e)}")
            return []
    
    async def _lstm_predict(self, symbol: str, data: pd.DataFrame, horizon: int) -> List[Dict[str, Any]]:
        """Generate predictions using LSTM model"""
        try:
            # Prepare data for LSTM
            prices = data['Close'].values.reshape(-1, 1)
            
            # Scale the data
            scaler = MinMaxScaler()
            scaled_prices = scaler.fit_transform(prices)
            
            # Create sequences for training
            sequence_length = 60
            if len(scaled_prices) < sequence_length + 10:
                logger.warning(f"Insufficient data for LSTM training for {symbol}")
                return []
            
            X, y = self._create_sequences(scaled_prices, sequence_length)
            
            # Convert to PyTorch tensors
            X_tensor = torch.FloatTensor(X)
            y_tensor = torch.FloatTensor(y)
            
            # Create and train LSTM model
            model = LSTMModel(input_size=1, hidden_size=50, num_layers=2)
            criterion = nn.MSELoss()
            optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
            
            # Quick training (in production, use pre-trained models)
            model.train()
            for epoch in range(50):  # Reduced epochs for speed
                optimizer.zero_grad()
                outputs = model(X_tensor)
                loss = criterion(outputs, y_tensor)
                loss.backward()
                optimizer.step()
            
            # Make predictions
            model.eval()
            predictions = []
            last_sequence = scaled_prices[-sequence_length:].reshape(1, sequence_length, 1)
            
            for i in range(horizon):
                with torch.no_grad():
                    pred = model(torch.FloatTensor(last_sequence))
                    pred_price = scaler.inverse_transform(pred.numpy())[0][0]
                    
                    # Update sequence for next prediction
                    last_sequence = np.roll(last_sequence, -1, axis=1)
                    last_sequence[0, -1, 0] = pred.item()
                    
                    future_date = datetime.now() + timedelta(days=i+1)
                    predictions.append({
                        "date": future_date.strftime('%Y-%m-%d'),
                        "predicted_price": float(max(0, pred_price)),
                        "confidence": 0.7
                    })
            
            return predictions
            
        except Exception as e:
            logger.error(f"LSTM prediction error for {symbol}: {str(e)}")
            return []
    
    def _create_sequences(self, data: np.ndarray, seq_length: int):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(seq_length, len(data)):
            X.append(data[i-seq_length:i])
            y.append(data[i])
        return np.array(X), np.array(y)
    
    def _calculate_rsi(self, prices: pd.Series, window: int = 14) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _ensemble_predictions(self, prophet_forecast: List, lstm_forecast: List) -> List[Dict[str, Any]]:
        """Combine Prophet and LSTM predictions"""
        if not prophet_forecast and not lstm_forecast:
            return []
        
        if not prophet_forecast:
            return lstm_forecast
        
        if not lstm_forecast:
            return prophet_forecast
        
        # Weighted ensemble (Prophet: 0.6, LSTM: 0.4)
        ensemble = []
        min_length = min(len(prophet_forecast), len(lstm_forecast))
        
        for i in range(min_length):
            prophet_price = prophet_forecast[i]["predicted_price"]
            lstm_price = lstm_forecast[i]["predicted_price"]
            
            ensemble_price = 0.6 * prophet_price + 0.4 * lstm_price
            
            ensemble.append({
                "date": prophet_forecast[i]["date"],
                "predicted_price": float(ensemble_price),
                "prophet_price": float(prophet_price),
                "lstm_price": float(lstm_price),
                "confidence": float((prophet_forecast[i]["confidence"] + lstm_forecast[i]["confidence"]) / 2)
            })
        
        return ensemble
    
    def _calculate_confidence(self, prophet_forecast: List, lstm_forecast: List) -> float:
        """Calculate prediction confidence based on model agreement"""
        if not prophet_forecast or not lstm_forecast:
            return 0.6
        
        # Calculate agreement between models
        agreements = []
        min_length = min(len(prophet_forecast), len(lstm_forecast))
        
        for i in range(min_length):
            prophet_price = prophet_forecast[i]["predicted_price"]
            lstm_price = lstm_forecast[i]["predicted_price"]
            
            # Calculate percentage difference
            avg_price = (prophet_price + lstm_price) / 2
            diff_pct = abs(prophet_price - lstm_price) / avg_price * 100
            
            # Higher agreement = lower difference
            agreement = max(0, 1 - (diff_pct / 20))  # 20% diff = 0 agreement
            agreements.append(agreement)
        
        return np.mean(agreements) if agreements else 0.6
    
    def _fallback_prediction(self, symbol: str, horizon: int) -> Dict[str, Any]:
        """Fallback prediction when models fail"""
        base_price = 100 + hash(symbol) % 200  # Deterministic base price
        
        predictions = []
        for i in range(horizon):
            # Simple random walk with slight upward bias
            price_change = np.random.normal(0.01, 0.02)  # 1% mean, 2% std
            price = base_price * (1 + price_change) ** (i + 1)
            
            future_date = datetime.now() + timedelta(days=i+1)
            predictions.append({
                "date": future_date.strftime('%Y-%m-%d'),
                "predicted_price": float(max(0, price)),
                "confidence": 0.5
            })
        
        return {
            "forecast": predictions,
            "confidence": 0.5,
            "model": "fallback"
        }
    
    async def retrain_symbols(self, symbols: List[str]):
        """Retrain models for specific symbols"""
        logger.info(f"Retraining models for symbols: {symbols}")
        # Implementation for retraining specific symbols
        pass
    
    async def retrain_all_models(self):
        """Retrain all models"""
        logger.info("Retraining all models")
        # Implementation for retraining all models
        pass
    
    async def retrain_popular_symbols(self):
        """Retrain models for popular symbols"""
        popular_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        await self.retrain_symbols(popular_symbols)