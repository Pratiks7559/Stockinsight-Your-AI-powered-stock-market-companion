// components/Header.jsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Logo from '../footer/Logo'

const Header = ({ isAuthenticated, logout, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeNav, setActiveNav] = useState('Home')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [marketIndices, setMarketIndices] = useState([])
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname
    const activeItem = navItems.find(item => item.href === currentPath)
    if (activeItem) {
      setActiveNav(activeItem.name)
    } else if (currentPath === '/') {
      setActiveNav('Home')
    }
  }, [location.pathname])

  
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Markets', href: '/markets' },
    { name: 'Charts', href: '/charts' },
    { name: 'News', href: '/news' },
    { name: 'About', href: '/about' }
  ]

  return (
    <header className="sticky top-0 z-50 bg-slate-800 shadow-lg">
      {/* Top Navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Logo size="lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              StockInsight
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href}
                onClick={() => setActiveNav(item.name)}
                className={`relative px-2 py-2 transition-all duration-300 group ${
                  activeNav === item.name 
                    ? 'text-green-400' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                {item.name}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300 ${
                  activeNav === item.name ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></div>
              </a>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-slate-700 rounded-lg px-3 py-2 w-64">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search stocks..." className="bg-transparent border-none focus:outline-none text-white px-2 w-full" />
          </div>

          {/* Auth Buttons & Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            {/* <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button> */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{user?.username || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    <div className="py-2">
                      <a href="/dashboard" className="block px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Dashboard</span>
                        </div>
                      </a>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('token')
                          localStorage.removeItem('username')
                          setIsAuthenticated(false)
                          setShowUserDropdown(false)
                          window.location.href = '/'
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a 
                href="/login"
                className="relative bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg group overflow-hidden"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            )}
            
            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 px-4 py-2">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href}
                onClick={() => setActiveNav(item.name)}
                className={`relative px-4 py-3 rounded-lg transition-all duration-300 group ${
                  activeNav === item.name 
                    ? 'text-white bg-gradient-to-r from-green-500 to-blue-500 shadow-lg transform scale-105' 
                    : 'text-gray-300 hover:text-white hover:bg-slate-700 hover:transform hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {item.name}
                  {activeNav === item.name && (
                    <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {activeNav !== item.name && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                )}
              </a>
            ))}
            <div className="flex items-center bg-slate-700 rounded-lg px-3 py-2 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search stocks..." className="bg-transparent border-none focus:outline-none text-white px-2 w-full" />
            </div>
          </nav>
        </div>
      )}

      {/* Live Market Ticker */}
      <div className="bg-slate-700 py-2 overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap">
          {marketIndices.map((index, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className="font-semibold">{index.name}</span>
              <span>{index.value}</span>
              <span className={index.change.includes('+') ? 'text-green-500' : 'text-red-500'}>
                {index.change}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless animation */}
          {marketIndices.map((index, i) => (
            <div key={`dup-${i}`} className="flex items-center space-x-2">
              <span className="font-semibold">{index.name}</span>
              <span>{index.value}</span>
              <span className={index.change.includes('+') ? 'text-green-500' : 'text-red-500'}>
                {index.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header