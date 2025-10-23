// components/Testimonials.jsx
const Testimonials = () => {
  const testimonials = [
    {
      quote: "StockInsight has completely transformed how I manage my investments. The analytics are incredibly accurate and easy to understand.",
      author: "Sarah Johnson",
      role: "Portfolio Manager"
    },
    {
      quote: "As a beginner, I found the educational resources invaluable. I've increased my portfolio by 35% in just 6 months using their insights.",
      author: "Michael Chen",
      role: "Retail Investor"
    },
    {
      quote: "The real-time data and alerts have helped me make timely decisions that significantly improved my trading performance.",
      author: "David Wilson",
      role: "Day Trader"
    }
  ]

  const stats = [
    { value: "10,000+", label: "Active Users" },
    { value: "$2.5B+", label: "Portfolio Value" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Market Monitoring" }
  ]

  return (
    <section className="py-16 bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Traders Trust Us</h2>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-900 p-6 rounded-xl text-center shadow-lg">
              <div className="text-3xl font-bold text-green-500 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-900 p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-gray-400 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials