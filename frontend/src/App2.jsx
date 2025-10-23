import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import HeroSection from './components/Herosection/HeroSection';
import MarketOverview from './components/marketoverview/MarketOverview';
import StockCharts from './components/Stockcharts/StockCharts';
import NewsInsights from './components/newinsights/NewsInsights';
import MarketAnalysis from './components/marketanalysis/MarketAnalysis';
import EducationSection from './components/educationsection/EducationSection';
import Testimonials from './components/testimonials/Testimonials';
import Footer from './components/footer/Footer';
import Markets from './components2/markets/Markets';
import ChartsPage from './components3/ChartsPage';
import StockNewsPage from './components4/StockNewsPage';
import PortfolioPage from './component5/PortfolioPage';
import Portfolio from './pages/Portfolio';
import About from './component6/About';
import Login from './signup-login-component/Auth/Login';
import Signup from './signup-login-component/Auth/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './dashboard-component/Dashboard';
import { useAuth } from './contexts/AuthContext';

function App2() {
  const { user, loading, login, signup, logout } = useAuth();
  const isAuthenticated = !!user;

  const HomePage = () => (
    <>
      <HeroSection />
      <MarketOverview />
      <StockCharts />
      <NewsInsights />
      <MarketAnalysis />
      <EducationSection />
      <Testimonials />
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          <Route path="/dashboard/*" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <>
              <Header 
                isAuthenticated={isAuthenticated} 
                logout={logout} 
                user={user} 
              />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login login={login} />} />
                <Route path="/signup" element={<Signup signup={signup} />} />
                <Route path="/markets" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Markets />
                  </ProtectedRoute>
                } />
                <Route path="/charts" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <ChartsPage />
                  </ProtectedRoute>
                } />
                <Route path="/news" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <StockNewsPage />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <About />
                  </ProtectedRoute>
                } />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App2;