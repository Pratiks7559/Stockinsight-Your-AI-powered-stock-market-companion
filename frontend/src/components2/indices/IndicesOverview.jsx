// components/markets/IndicesOverview.jsx
const IndicesOverview = () => {
  const indices = [
    { name: 'Nifty 50', value: 22475.50, change: 1.2, isUp: true },
    { name: 'Sensex', value: 74005.94, change: 0.8, isUp: true },
    { name: 'Nasdaq', value: 16349.25, change: -0.3, isUp: false },
    { name: 'Dow Jones', value: 39512.84, change: 0.5, isUp: true },
    { name: 'S&P 500', value: 5214.08, change: -0.1, isUp: false },
    { name: 'FTSE 100', value: 8145.02, change: 0.7, isUp: true }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Global Indices</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {indices.map((index, i) => (
          <div key={i} className="bg-slate-700 p-4 rounded-lg text-center transition-transform duration-300 hover:scale-105">
            <h3 className="font-medium text-sm mb-2">{index.name}</h3>
            <div className="text-lg font-bold">{index.value.toLocaleString()}</div>
            <div className={index.isUp ? 'text-green-500' : 'text-red-500'}>
              {index.isUp ? '+' : ''}{index.change}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicesOverview;