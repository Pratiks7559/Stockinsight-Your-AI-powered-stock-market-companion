// components/PortfolioNews.jsx
const PortfolioNews = ({ holdings, darkMode }) => {
  // Mock news data related to holdings
  const news = [
    {
      title: 'Apple Announces Record Quarterly Earnings',
      source: 'Bloomberg',
      time: '2 hours ago',
      symbol: 'AAPL'
    },
    {
      title: 'Microsoft Cloud Services Grow 25% YoY',
      source: 'CNBC',
      time: '5 hours ago',
      symbol: 'MSFT'
    },
    {
      title: 'Reliance Jio Announces 5G Rollout Plan',
      source: 'Economic Times',
      time: '1 day ago',
      symbol: 'RELIANCE'
    },
    {
      title: 'Tesla Recalls 100,000 Vehicles Over Software Issue',
      source: 'Reuters',
      time: '2 days ago',
      symbol: 'TSLA'
    },
    {
      title: 'Infosys Signs $1.5B Digital Transformation Deal',
      source: 'Business Standard',
      time: '3 days ago',
      symbol: 'INFY'
    }
  ];

  return (
    <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4">Portfolio News</h2>
      
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
            <div className="flex justify-between items-start mb-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{item.symbol}</span>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
            <h3 className="font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.source}</p>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg transition-colors">
        View All News
      </button>
    </div>
  );
};

export default PortfolioNews;