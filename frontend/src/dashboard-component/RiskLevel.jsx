
import { useState, useEffect } from 'react';
import { portfolioAPI } from '../utils/api';
import Card from './UI/Card';

const RiskLevel = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        const response = await portfolioAPI.getRiskAnalysis();
        setRiskData(response);
        setError(null);
      } catch (err) {
        setError('Failed to fetch risk data');
        console.error('Risk analysis fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  const getRiskColor = (score) => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-slate-800 p-6">
      <h2 className="text-gray-400 text-sm">Risk Level</h2>
      {loading ? (
        <div className="animate-pulse h-8 w-32 bg-slate-700 rounded mt-1"></div>
      ) : error ? (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      ) : riskData ? (
        <div className="flex items-center mt-2">
          <div className={`h-3 w-24 rounded-full ${getRiskColor(riskData.risk_score)}`}></div>
          <span className="ml-2 font-semibold">{riskData.risk_score.toFixed(2)}%</span>
        </div>
      ) : null}
      <p className="text-sm text-gray-400 mt-3">Based on your portfolio diversification</p>
    </Card>
  );
};

export default RiskLevel;
