// // components/InsightsPanel.jsx
// const InsightsPanel = ({ selectedStock, timeRange }) => {
//   // Generate dummy insights
//   const generateInsights = () => {
//     const insights = [
//       {
//         type: 'bullish',
//         title: 'Bullish Trend',
//         message: `${selectedStock} is in an upward trend, gaining 5.2% over the past week.`,
//         icon: (
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
//           </svg>
//         )
//       },
//       {
//         type: 'rsi',
//         title: 'RSI Indicator',
//         message: 'RSI is at 68, approaching overbought territory (>70).',
//         icon: (
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//           </svg>
//         )
//       },
//       {
//         type: 'volume',
//         title: 'Volume Spike',
//         message: 'Trading volume is 25% above average, indicating strong interest.',
//         icon: (
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0-9.9l4.95 4.95a5 5 0 01-4.95 4.95" />
//           </svg>
//         )
//       }
//     ];
    
//     return insights;
//   };

//   const insights = generateInsights();

//   return (
//     <div className="bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
//       <h2 className="text-xl font-semibold mb-4">Market Insights</h2>
      
//       <div className="space-y-4">
//         {insights.map((insight, index) => (
//           <div key={index} className="bg-slate-700 p-4 rounded-lg">
//             <div className="flex items-start mb-2">
//               <div className="mr-3 mt-1">
//                 {insight.icon}
//               </div>
//               <div>
//                 <h3 className="font-medium">{insight.title}</h3>
//                 <p className="text-sm text-gray-300 mt-1">{insight.message}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       <button className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg transition-colors flex items-center justify-center">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         Show More Analysis
//       </button>
//     </div>
//   );
// };

// export default InsightsPanel;
// frontend/components/InsightsPanel.jsx
import { useState, useEffect } from 'react';

const InsightsPanel = ({ data, symbol }) => {
  const [updateKey, setUpdateKey] = useState(0);
  
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [data]);
  if (!data || data.length === 0) return null;

  const currentPrice = data[data.length - 1]?.c;
  const previousPrice = data[0]?.c;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const weekAgoPrice = data.length > 5 ? data[data.length - 6]?.c : previousPrice;
  const weekChange = currentPrice - weekAgoPrice;
  const weekChangePercent = (weekChange / weekAgoPrice) * 100;

  // Simple RSI calculation (for demonstration)
  const calculateRSI = () => {
    const period = 14;
    if (data.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = data[i].c - data[i - 1].c;
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const rsi = calculateRSI();

  // Calculate volume trend
  const avgVolume = data.reduce((sum, item) => sum + (item.v || 0), 0) / data.length;
  const recentVolume = data.slice(-5).reduce((sum, item) => sum + (item.v || 0), 0) / 5;
  const volumeChange = ((recentVolume - avgVolume) / avgVolume) * 100;

  // Generate comprehensive insights for every stock
  const insights = [
    // Trend Analysis - Always show
    {
      type: priceChangePercent > 2 ? 'positive' : priceChangePercent < -2 ? 'negative' : 'neutral',
      title: priceChangePercent > 5 ? 'Strong Uptrend' : priceChangePercent > 2 ? 'Uptrend' : 
             priceChangePercent < -5 ? 'Strong Downtrend' : priceChangePercent < -2 ? 'Downtrend' : 'Sideways',
      message: `${Math.abs(priceChangePercent).toFixed(2)}% ${priceChangePercent >= 0 ? 'gain' : 'decline'} in period`
    },
    
    // RSI - Always show
    {
      type: rsi > 70 ? 'warning' : rsi < 30 ? 'positive' : rsi > 50 ? 'positive' : 'neutral',
      title: `RSI: ${rsi.toFixed(1)}`,
      message: rsi > 70 ? 'Overbought - Consider selling' : 
               rsi < 30 ? 'Oversold - Potential buying opportunity' : 
               rsi > 50 ? 'Bullish momentum' : 'Bearish momentum'
    },
    
    // Weekly Performance - Always show
    {
      type: weekChangePercent > 1 ? 'positive' : weekChangePercent < -1 ? 'negative' : 'neutral',
      title: 'Weekly Performance',
      message: `${weekChangePercent >= 0 ? '+' : ''}${weekChangePercent.toFixed(2)}% this week`
    },
    
    // Volume Analysis - Always show
    {
      type: volumeChange > 20 ? 'positive' : volumeChange < -20 ? 'warning' : 'neutral',
      title: volumeChange > 20 ? 'High Volume' : volumeChange < -20 ? 'Low Volume' : 'Normal Volume',
      message: volumeChange > 20 ? `${volumeChange.toFixed(0)}% above average volume` :
               volumeChange < -20 ? `${Math.abs(volumeChange).toFixed(0)}% below average volume` :
               'Trading at normal volume levels'
    },
    
    // Support/Resistance Levels
    {
      type: 'neutral',
      title: 'Technical Levels',
      message: `Support: $${(currentPrice * 0.95).toFixed(2)} | Resistance: $${(currentPrice * 1.05).toFixed(2)}`
    },
    
    // Market Sentiment
    {
      type: (priceChangePercent > 0 && rsi < 70 && volumeChange > 0) ? 'positive' : 
            (priceChangePercent < 0 && rsi > 30 && volumeChange < 0) ? 'negative' : 'neutral',
      title: 'Market Sentiment',
      message: (priceChangePercent > 0 && rsi < 70) ? 'Bullish sentiment with room to grow' :
               (priceChangePercent < 0 && rsi > 30) ? 'Bearish sentiment, watch for reversal' :
               'Mixed signals, wait for clearer direction'
    }
  ];

  const getColorClass = (type) => {
    switch (type) {
      case 'positive': return 'bg-green-500/20 border-green-500';
      case 'negative': return 'bg-red-500/20 border-red-500';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500';
      default: return 'bg-blue-500/20 border-blue-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6" key={updateKey}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Market Insights</h3>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getColorClass(insight.type)}`}
          >
            <h4 className="font-semibold mb-2">{insight.title}</h4>
            <p className="text-sm text-slate-300">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;