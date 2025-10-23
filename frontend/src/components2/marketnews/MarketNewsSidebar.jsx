// components/markets/MarketNewsSidebar.jsx
const MarketNewsSidebar = () => {
  const news = [
    {
      id: 1,
      title: 'Federal Reserve Holds Interest Rates Steady Amid Inflation Concerns',
      source: 'Financial Times',
      time: '2 hours ago',
      image: 'https://via.placeholder.com/300x200/1e293b/64748b?text=Financial+News'
    },
    {
      id: 2,
      title: 'Tech Stocks Rally as Earnings Season Exceeds Expectations',
      source: 'Bloomberg',
      time: '5 hours ago',
      image: 'https://via.placeholder.com/300x200/1e293b/64748b?text=Market+Update'
    },
    {
      id: 3,
      title: 'Oil Prices Surge Amid Middle East Tensions and Supply Constraints',
      source: 'Reuters',
      time: '1 day ago',
      image: 'https://via.placeholder.com/300x200/1e293b/64748b?text=Oil+Market'
    },
    {
      id: 4,
      title: 'New Regulations for Cryptocurrency Exchanges Expected This Quarter',
      source: 'Wall Street Journal',
      time: '1 day ago',
      image: 'https://via.placeholder.com/300x200/1e293b/64748b?text=Crypto+News'
    }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Market News</h2>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {news.map(item => (
          <div key={item.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
            <h3 className="font-medium mb-3 line-clamp-2">{item.title}</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
              Read More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg transition-colors">
        View All News
      </button>
    </div>
  );
};

export default MarketNewsSidebar;