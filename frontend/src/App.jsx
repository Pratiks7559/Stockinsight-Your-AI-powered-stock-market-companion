// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/header/Header';
// import HeroSection from './components/Herosection/HeroSection';
// import MarketOverview from './components/marketoverview/MarketOverview';
// import StockCharts from './components/Stockcharts/StockCharts';
// import NewsInsights from './components/newinsights/NewsInsights';
// import PortfolioPreview from './components/portfolio/PortfolioPreview';
// import MarketAnalysis from './components/marketanalysis/MarketAnalysis';
// import EducationSection from './components/educationsection/EducationSection';
// import Testimonials from './components/testimonials/Testimonials';
// import Footer from './components/footer/Footer';
// import Markets from './components/Markets/Markets';


// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   const handleLogin = () => {
//     setIsLoggedIn(!isLoggedIn);
//   };

//   return (
//      <div className="min-h-screen bg-slate-900 text-white">
//       <Header />
//       <HeroSection />
//       <MarketOverview />
//       <StockCharts />
//       <NewsInsights />
//       <PortfolioPreview />
//       <MarketAnalysis />
//       <EducationSection />
//       <Testimonials />
//       <Footer />
//     </div>
    
//   );
// }

// export default App;
import React from 'react'
import App2 from './App2'

export default function App() {
  return (
    <div>
      <App2/>
    </div>
  )
}
