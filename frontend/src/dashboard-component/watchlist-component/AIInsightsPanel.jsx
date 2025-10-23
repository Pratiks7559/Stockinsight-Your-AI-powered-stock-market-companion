// frontend/src/components/AIInsightsPanel.jsx
import { useState, useEffect } from 'react';
import { getAIInsights } from './api';

const AIInsightsPanel = ({ watchlist }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (watchlist.length === 0) {
        setInsights([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getAIInsights(watchlist.map(stock => stock.symbol));
        setInsights(data);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [watchlist]);

  if (watchlist.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          AI Insights
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Add stocks to your watchlist to get AI-powered insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        AI Insights
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                insight.type === 'positive'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : insight.type === 'negative'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start">
                <div className={`mr-3 mt-1 p-2 rounded-full ${
                  insight.type === 'positive'
                    ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                    : insight.type === 'negative'
                    ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'
                    : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                }`}>
                  {insight.type === 'positive' ? '📈' : insight.type === 'negative' ? '📉' : '💡'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{insight.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{insight.message}</p>
                  {insight.confidence && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              insight.type === 'positive'
                                ? 'bg-green-500'
                                : insight.type === 'negative'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${insight.confidence}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;