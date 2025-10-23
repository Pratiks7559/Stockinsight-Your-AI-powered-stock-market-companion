// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from '../components/footer/Logo'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Overview', href: '/dashboard/overview', icon: '📊' },
    { name: 'Watchlist', href: '/dashboard/watchlist', icon: '👀' },
    { name: 'Compare', href: '/dashboard/compare', icon: '📈' },
    { name: 'Portfolio', href: '/dashboard/portfolio', icon: '💼' },
    { name: 'Insights', href: '/dashboard/insights', icon: '🧠' },
    { name: 'Alerts', href: '/dashboard/alerts', icon: '🔔' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ]

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }, [location])

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 bg-slate-800 transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:inset-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-slate-900">
          <div className="flex items-center overflow-hidden">
            <Logo size="md" className="flex-shrink-0" />
            <span className={`ml-2 text-xl font-bold whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              StockInsights
            </span>
          </div>
          
          <div className="flex items-center">
            {/* Toggle button for desktop */}
            <button 
              className="hidden md:block text-gray-400 hover:text-white ml-2"
              onClick={toggleSidebar}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
            
            {/* Close button for mobile */}
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="mt-8 px-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mx-2
                    ${location.pathname === item.href || (item.href === '/dashboard/overview' && location.pathname === '/dashboard')
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 absolute' : 'opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}

export default Sidebar