// components/MarketAnalysis.jsx
const MarketAnalysis = () => {
  const indicators = [
    { name: 'RSI', value: '62.5', level: 'Neutral', color: 'bg-yellow-500' },
    { name: 'MACD', value: '0.25', level: 'Bullish', color: 'bg-green-500' },
    { name: 'Moving Avg', value: '175.10', level: 'Bullish', color: 'bg-green-500' },
  ]

  const sectors = [
    { name: 'Technology', performance: '+3.2%', color: 'bg-green-600' },
    { name: 'Healthcare', performance: '+1.8%', color: 'bg-green-500' },
    { name: 'Financials', performance: '+0.5%', color: 'bg-green-400' },
    { name: 'Energy', performance: '-0.3%', color: 'bg-yellow-500' },
    { name: 'Consumer', performance: '-1.2%', color: 'bg-red-400' },
    { name: 'Utilities', performance: '-2.5%', color: 'bg-red-600' },
  ]

  return (
    <section className="py-16 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Market Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Technical Indicators */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Technical Indicators</h3>
            <div className="space-y-6">
              {indicators.map((indicator, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{indicator.name}</span>
                    <div className="flex items-center">
                      <span className="mr-2">{indicator.value}</span>
                      <span className={`px-2 py-1 rounded text-xs ${indicator.level === 'Bullish' ? 'bg-green-900 text-green-400' : indicator.level === 'Bearish' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'}`}>
                        {indicator.level}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${indicator.color}`} 
                      style={{ width: indicator.name === 'RSI' ? '62.5%' : indicator.name === 'MACD' ? '75%' : '80%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sector Performance */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Sector Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              {sectors.map((sector, index) => (
                <div key={index} className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{sector.name}</span>
                    <span className={sector.performance.includes('+') ? 'text-green-500' : 'text-red-500'}>
                      {sector.performance}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${sector.color}`}
                      style={{ width: Math.abs(parseFloat(sector.performance)) * 20 + '%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MarketAnalysis