// components/RiskInsights.jsx
const RiskInsights = ({ holdings, darkMode }) => {
  // Calculate sector exposure
  const sectorExposure = holdings.reduce((acc, holding) => {
    const value = holding.quantity * holding.currentPrice;
    if (!acc[holding.sector]) {
      acc[holding.sector] = 0;
    }
    acc[holding.sector] += value;
    return acc;
  }, {});

  const totalValue = Object.values(sectorExposure).reduce((sum, val) => sum + val, 0);
  
  // Find overexposed sectors (more than 30% of portfolio)
  const overexposedSectors = Object.entries(sectorExposure)
    .filter(([sector, value]) => (value / totalValue) > 0.3)
    .map(([sector]) => sector);

  // Mock risk levels for stocks
  const riskLevels = {
    'AAPL': 'Low',
    'MSFT': 'Low',
    'RELIANCE': 'Medium',
    'TSLA': 'High',
    'INFY': 'Medium'
  };

  // Mock AI insights
  const insights = [
    "Top gainer in your portfolio this week is AAPL +12%",
    "Your portfolio is outperforming the S&P 500 by 5.2%",
    "Consider diversifying into healthcare sector",
    "TSLA is showing high volatility, consider setting a stop-loss"
  ];

  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4">Risk & Insights</h2>
      
      {/* Risk Indicators */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Risk Exposure</h3>
        <div className="space-y-3">
          {Object.entries(sectorExposure).map(([sector, value]) => {
            const percentage = ((value / totalValue) * 100).toFixed(1);
            const isOverexposed = overexposedSectors.includes(sector);
            
            return (
              <div key={sector}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{sector}</span>
                  <span className={isOverexposed ? 'text-yellow-500' : ''}>{percentage}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isOverexposed ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Risk Levels */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Stock Risk Levels</h3>
        <div className="space-y-2">
          {Object.entries(riskLevels).map(([symbol, risk]) => (
            <div key={symbol} className="flex justify-between items-center">
              <span className="font-semibold">{symbol}</span>
              <span className={
                risk === 'Low' ? 'text-green-500' : 
                risk === 'Medium' ? 'text-yellow-500' : 'text-red-500'
              }>
                {risk}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="font-semibold mb-3">AI Insights</h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskInsights;