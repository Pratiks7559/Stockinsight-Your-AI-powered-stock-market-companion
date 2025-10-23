// // components/IndicatorsPanel.jsx
// const IndicatorsPanel = ({ indicators, setIndicators }) => {
//   const toggleIndicator = (indicator) => {
//     setIndicators(prev => ({
//       ...prev,
//       [indicator]: !prev[indicator]
//     }));
//   };

//   const indicatorOptions = [
//     { key: 'ma20', label: 'MA 20', color: 'bg-amber-500' },
//     { key: 'ma50', label: 'MA 50', color: 'bg-purple-500' },
//     { key: 'ma200', label: 'MA 200', color: 'bg-pink-500' },
//     { key: 'rsi', label: 'RSI', color: 'bg-blue-500' },
//     { key: 'macd', label: 'MACD', color: 'bg-green-500' },
//     { key: 'bollinger', label: 'Bollinger Bands', color: 'bg-cyan-500' }
//   ];

//   return (
//     <div className="bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
//       <h2 className="text-xl font-semibold mb-4">Technical Indicators</h2>
      
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//         {indicatorOptions.map((indicator) => (
//           <button
//             key={indicator.key}
//             onClick={() => toggleIndicator(indicator.key)}
//             className={`flex items-center p-3 rounded-lg transition-all ${
//               indicators[indicator.key] 
//                 ? 'bg-slate-700 ring-2 ring-blue-500' 
//                 : 'bg-slate-700 hover:bg-slate-600'
//             }`}
//           >
//             <div className={`w-3 h-3 rounded-full ${indicator.color} mr-2`}></div>
//             <span className="text-sm">{indicator.label}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default IndicatorsPanel;
// frontend/components/IndicatorsPanel.jsx
import { useMemo, useState, useEffect } from 'react';

const IndicatorsPanel = ({ data }) => {
  const [updateKey, setUpdateKey] = useState(0);
  
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [data]);
  
  const indicators = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Calculate RSI
    const calculateRSI = () => {
      const period = 14;
      if (data.length < period + 1) return null;

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
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };

    // Calculate MACD
    const calculateMACD = () => {
      if (data.length < 26) return null;

      const ema12 = data.slice(-12).reduce((sum, item) => sum + item.c, 0) / 12;
      const ema26 = data.slice(-26).reduce((sum, item) => sum + item.c, 0) / 26;
      return ema12 - ema26;
    };

    return {
      rsi: calculateRSI(),
      macd: calculateMACD(),
      currentPrice: data[data.length - 1]?.c,
      priceChange: data[data.length - 1]?.c - data[0]?.c,
      priceChangePercent: ((data[data.length - 1]?.c - data[0]?.c) / data[0]?.c) * 100
    };
  }, [data]);

  if (!indicators) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
        <p className="text-slate-400">Loading indicators...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6" key={updateKey}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Technical Indicators</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Price</span>
            <span className="font-semibold">${indicators.currentPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Change</span>
            <span className={indicators.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
              {indicators.priceChange >= 0 ? '+' : ''}{indicators.priceChange?.toFixed(2)} (
              {indicators.priceChange >= 0 ? '+' : ''}{indicators.priceChangePercent?.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">RSI (14)</span>
            <span className={
              indicators.rsi > 70 ? 'text-red-400' : 
              indicators.rsi < 30 ? 'text-green-400' : 'text-white'
            }>
              {indicators.rsi?.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(Math.max(indicators.rsi, 0), 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">MACD</span>
            <span className={indicators.macd >= 0 ? 'text-green-400' : 'text-red-400'}>
              {indicators.macd?.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorsPanel;