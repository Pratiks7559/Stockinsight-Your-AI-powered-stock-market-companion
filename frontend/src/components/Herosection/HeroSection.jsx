// components/HeroSection.jsx
const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Gateway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Smart Investing</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Access real-time market data, advanced analytics, and personalized insights to make informed investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                Explore Markets
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-5">
                <div className="w-full h-full max-w-sm mx-auto lg:mx-0 opacity-70 blur-lg bg-gradient-to-r from-green-400 to-blue-500"></div>
              </div>
              <div className="relative bg-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">AAPL - Apple Inc.</h3>
                  <span className="text-green-500">+2.3%</span>
                </div>
                <div className="h-48 bg-slate-900 rounded-lg p-4">
                  {/* Simple chart simulation */}
                  <div className="h-full flex items-end space-x-px">
                    {[40, 60, 75, 55, 80, 35, 70, 65, 90, 75, 82, 78, 85, 70, 75, 80, 85, 82, 88, 92].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-green-400 to-green-600 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-400">
                  <span>9:30 AM</span>
                  <span>12:00 PM</span>
                  <span>4:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection