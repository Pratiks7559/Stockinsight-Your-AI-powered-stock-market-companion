// components/markets/SectorHeatmap.jsx
const SectorHeatmap = () => {
  const sectors = [
    { name: 'Technology', performance: 3.2 },
    { name: 'Healthcare', performance: 1.8 },
    { name: 'Financials', performance: 0.5 },
    { name: 'Energy', performance: -0.3 },
    { name: 'Consumer', performance: -1.2 },
    { name: 'Utilities', performance: -2.5 },
    { name: 'Real Estate', performance: 2.1 },
    { name: 'Materials', performance: -0.7 },
    { name: 'Industrials', performance: 0.9 }
  ];

  // Find max and min for color intensity
  const performances = sectors.map(s => s.performance);
  const maxPerformance = Math.max(...performances);
  const minPerformance = Math.min(...performances);
  const range = maxPerformance - minPerformance;

  const getColorIntensity = (performance) => {
    if (performance >= 0) {
      const intensity = Math.round((performance / maxPerformance) * 500);
      return `bg-green-${500 + intensity} border-green-${400 + intensity}`;
    } else {
      const intensity = Math.round((performance / minPerformance) * 500);
      return `bg-red-${500 + intensity} border-red-${400 + intensity}`;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Sector Performance Heatmap</h2>
      <div className="grid grid-cols-3 gap-4">
        {sectors.map((sector, i) => {
          const colorClass = sector.performance >= 0 ? 
            `bg-green-${500 + Math.round((sector.performance / maxPerformance) * 500)}` : 
            `bg-red-${500 + Math.round((sector.performance / minPerformance) * 500)}`;
          
          return (
            <div 
              key={i} 
              className={`p-4 rounded-lg text-center transition-transform duration-300 hover:scale-105 
                ${sector.performance >= 0 ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}
            >
              <h3 className="font-medium mb-2">{sector.name}</h3>
              <div className={sector.performance >= 0 ? 'text-green-300' : 'text-red-300'}>
                {sector.performance >= 0 ? '+' : ''}{sector.performance}%
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
        <span>Worst</span>
        <span>Neutral</span>
        <span>Best</span>
      </div>
      <div className="w-full bg-gradient-to-r from-red-700 via-slate-700 to-green-700 h-2 rounded-full mt-1"></div>
    </div>
  );
};

export default SectorHeatmap;