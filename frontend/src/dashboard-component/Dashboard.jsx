// src/dashboard-component/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Overview from './Overview'
import WatchlistPage from './watchlist-component/WatchlistPage'
import Compare from './Compare'
import PortfolioPage from './portfolio/PortfolioPage'
import { portfolioAPI } from '../utils/api'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [portfolio, setPortfolio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await portfolioAPI.getPortfolio();
        setPortfolio(response.portfolio);
        setSummary(response.summary);
        setError(null);
      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error('Portfolio fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 fixed inset-0 z-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-slate-800 shadow-sm border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stocks..."
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <a href="/" className="flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </a>
              
              <button className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-6">
          <Routes>
            <Route index element={<Overview summary={summary} />} />
            <Route path="overview" element={<Overview summary={summary} />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="compare" element={<Compare />} />
            <Route path="portfolio" element={<PortfolioPage portfolio={portfolio} summary={summary} loading={loading} error={error} />} />
            <Route path="insights" element={<div className="text-white">Insights Page Coming Soon</div>} />
            <Route path="alerts" element={<div className="text-white">Alerts Page Coming Soon</div>} />
            <Route path="settings" element={<div className="text-white">Settings Page Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default Dashboard