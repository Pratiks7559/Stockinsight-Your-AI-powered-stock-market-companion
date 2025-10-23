import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Brain } from 'lucide-react';

const RecommendationPanel = ({ userId }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/recommendations/portfolio/${userId}`);
      const data = await response.json();
      setRecommendations(data.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'SELL': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'SELL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-gray-400">Unable to load recommendations</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <div className="text-sm text-gray-400">
          Portfolio P&L: <span className={recommendations.plPercent >= 0 ? 'text-green-400' : 'text-red-400'}>
            {recommendations.plPercent >= 0 ? '+' : ''}{recommendations.plPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Individual Stock Recommendations */}
      <div className="space-y-4 mb-6">
        {recommendations.recommendations.map((rec) => (
          <div key={rec.symbol} className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getActionColor(rec.action)}`}>
                  {getActionIcon(rec.action)}
                  <span className="font-semibold">{rec.action}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{rec.symbol}</h4>
                  <p className="text-sm text-gray-400">
                    Confidence: <span className={getConfidenceColor(rec.confidence)}>{rec.confidence}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Target: ${rec.targetPrice.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Current: ${rec.currentPrice.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {rec.reasoning.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Summary */}
      <div className="border-t border-slate-600 pt-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Portfolio Insights
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">Risk Assessment</div>
            <div className={`font-semibold ${
              recommendations.portfolioInsights.riskAssessment === 'High' ? 'text-red-400' :
              recommendations.portfolioInsights.riskAssessment === 'Medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {recommendations.portfolioInsights.riskAssessment}
            </div>
          </div>
          
          <div className="bg-slate-700 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">Total Value</div>
            <div className="font-semibold text-white">
              ${recommendations.totalValue.toLocaleString()}
            </div>
          </div>
        </div>

        {recommendations.portfolioInsights.diversificationIssues.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-red-400 mb-2">Diversification Issues:</div>
            {recommendations.portfolioInsights.diversificationIssues.map((issue, idx) => (
              <div key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-red-400 mt-1">⚠</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-medium text-blue-400 mb-2">Suggested Actions:</div>
          {recommendations.portfolioInsights.suggestedActions.map((action, idx) => (
            <div key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-blue-400 mt-1">→</span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;