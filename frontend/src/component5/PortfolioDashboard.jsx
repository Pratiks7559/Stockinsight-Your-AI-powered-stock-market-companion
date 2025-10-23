// components/PortfolioDashboard.jsx
const PortfolioDashboard = ({
  investedCapital,
  currentValue,
  profitLoss,
  profitLossPercent,
  todayChange,
  todayChangePercent,
  darkMode
}) => {
  const summaryCards = [
    {
      title: 'Current Value',
      value: `$${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: todayChange,
      changePercent: todayChangePercent,
      isPositive: todayChange >= 0
    },
    {
      title: 'Invested',
      value: `$${investedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: null
    },
    {
      title: 'P/L',
      value: `$${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: profitLossPercent,
      isPositive: profitLoss >= 0
    },
    {
      title: "Today's Change",
      value: `$${Math.abs(todayChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: todayChangePercent,
      isPositive: todayChange >= 0
    }
  ];

  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, index) => (
          <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <p className="text-sm text-gray-500 mb-1">{card.title}</p>
            <p className="text-lg font-bold mb-1">{card.value}</p>
            {card.change !== null && (
              <p className={card.isPositive ? 'text-green-500' : 'text-red-500'}>
                {card.isPositive ? '+' : ''}{card.change.toFixed(2)}%
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className={profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
            {profitLoss >= 0 ? '+' : ''}${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
            ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Invested Capital</p>
          <p className="font-semibold">
            ${investedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;