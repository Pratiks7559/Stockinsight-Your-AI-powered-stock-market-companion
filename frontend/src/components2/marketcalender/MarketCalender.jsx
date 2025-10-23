// components/markets/MarketCalendar.jsx
const MarketCalendar = () => {
  const events = [
    { date: '2023-10-15', type: 'ipo', title: 'Paytm IPO', description: 'Initial public offering' },
    { date: '2023-10-18', type: 'earning', title: 'Reliance Earnings', description: 'Q2 results announcement' },
    { date: '2023-10-22', type: 'dividend', title: 'Infosys Dividend', description: '₹16 per share' },
    { date: '2023-10-25', type: 'ipo', title: 'Zomato IPO', description: 'Initial public offering' },
    { date: '2023-10-28', type: 'earning', title: 'TCS Earnings', description: 'Q2 results announcement' }
  ];

  const getEventColor = (type) => {
    switch(type) {
      case 'ipo': return 'bg-purple-600';
      case 'earning': return 'bg-blue-600';
      case 'dividend': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'ipo': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'earning': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'dividend': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Market Calendar</h2>
      
      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="flex items-start">
            <div className={`${getEventColor(event.type)} p-2 rounded-lg mr-4`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-gray-400">{event.description}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-gray-300 py-2 rounded-lg transition-colors">
        View Full Calendar
      </button>
    </div>
  );
};

export default MarketCalendar;