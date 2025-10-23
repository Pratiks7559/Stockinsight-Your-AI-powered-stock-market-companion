// components/About.jsx
import { useState } from 'react';
import pratikImg from '../assets/pratik.jpeg';
import photographImg from '../assets/Photograph.jpg';
import Logo from '../components/header/Logo';

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Dummy data
  const teamMembers = [
    { id: 1, name: 'Pratik Zope', role: 'CEO & Founder', avatar: pratikImg },
    { id: 2, name: 'Vaibhav Patil', role: 'Lead Data Scientist', avatar: photographImg },
    { id: 3, name: 'Yash Bhalerao', role: 'Product Manager', avatar: '/api/placeholder/100/100' },
    { id: 4, name: 'Uday Patil', role: 'Frontend Developer', avatar: '/api/placeholder/100/100' },
  ];

  const coreValues = [
    { id: 1, title: 'Transparency', description: 'Open and honest about our data sources and methodologies.', icon: '🔍' },
    { id: 2, title: 'Innovation', description: 'Continuously improving our AI algorithms and user experience.', icon: '💡' },
    { id: 3, title: 'Growth', description: 'Helping investors grow their portfolios with intelligent insights.', icon: '📈' },
    { id: 4, title: 'Security', description: 'Protecting your data with bank-level encryption protocols.', icon: '🔒' },
  ];

  const milestones = [
    { year: '2023', event: 'Company Launch', description: 'Founded with a vision to democratize stock market analytics' },
    { year: '2024', event: '1M Users', description: 'Crossed 1 million registered users worldwide' },
    { year: '2025', event: 'AI Portfolio Advisor', description: 'Launched AI-powered portfolio recommendations' },
  ];

  const partners = [
    { id: 1, name: 'Partner 1', logo: '/api/placeholder/120/60' },
    { id: 2, name: 'Partner 2', logo: '/api/placeholder/120/60' },
    { id: 3, name: 'Partner 3', logo: '/api/placeholder/120/60' },
    { id: 4, name: 'Partner 4', logo: '/api/placeholder/120/60' },
    { id: 5, name: 'Partner 5', logo: '/api/placeholder/120/60' },
    { id: 6, name: 'Partner 6', logo: '/api/placeholder/120/60' },
  ];

  const faqs = [
    { question: 'Where does your data come from?', answer: 'We aggregate data from multiple reliable financial sources and exchanges to ensure accuracy and completeness.' },
    { question: 'Is StockInsight free to use?', answer: 'We offer a free tier with basic features and premium plans with advanced analytics and insights.' },
    { question: 'How often is the data updated?', answer: 'Our stock data is updated in real-time during market hours, with after-hours pricing updated periodically.' },
    { question: 'Do you offer mobile apps?', answer: 'Yes, we have iOS and Android apps available for download on their respective app stores.' },
    { question: 'How secure is my data?', answer: 'We use industry-standard encryption and security protocols to protect your personal and financial information.' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-blue-900 via-slate-900 to-green-900 animate-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <Logo size="xl" className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Empowering Investors with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Real-Time Insights</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
            Democratizing access to professional-grade stock market analytics and AI-driven investment tools.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Explore Our Tools
          </button>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 lg:py-24 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Who We Are</h2>
              <p className="text-slate-300 mb-8 text-lg">
                Founded in 2025, StockInsight emerged from a simple vision: to make professional-grade stock market analytics accessible to everyone. 
                Our team of data scientists, financial experts, and engineers work tirelessly to deliver cutting-edge tools that help investors make informed decisions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreValues.map((value) => (
                  <div key={value.id} className="bg-slate-700 p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-400">{value.title}</h3>
                    <p className="text-slate-300">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full h-80 bg-slate-700 rounded-xl flex items-center justify-center">
                {/* Placeholder for Lottie animation */}
                <span className="text-slate-400">📊 Illustration / Lottie Animation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-slate-800 rounded-xl p-6 shadow-lg text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full overflow-hidden">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-slate-400 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="text-slate-300 hover:text-blue-400 transition-colors">📱</button>
                  <button className="text-slate-300 hover:text-blue-400 transition-colors">🐦</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-16 lg:py-24 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Journey</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-green-500"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`mb-16 flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-1/2 mb-4 md:mb-0 md:px-8">
                  <div className="bg-slate-700 p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                    <span className="text-blue-400 font-semibold">{milestone.year}</span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">{milestone.event}</h3>
                    <p className="text-slate-300">{milestone.description}</p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 z-10"></div>
                </div>
                <div className="md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 lg:py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center justify-center p-4 bg-slate-800 rounded-xl grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105">
                {/* Placeholder for partner logo */}
                <div className="h-12 w-full flex items-center justify-center text-slate-400">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 lg:py-24 bg-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Security & Compliance</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
            Your data and investments are secured with industry-grade encryption and comply with all financial regulations.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-slate-700 p-6 rounded-xl w-40 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🔐</div>
              <p className="font-semibold">256-bit Encryption</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-xl w-40 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">📋</div>
              <p className="font-semibold">SEBI Compliant</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-xl w-40 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">✅</div>
              <p className="font-semibold">ISO 27001 Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4 border-b border-slate-700">
                <button
                  className="flex justify-between items-center w-full py-5 text-left font-semibold text-lg"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span>{openFaq === index ? '−' : '+'}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 pb-5' : 'max-h-0'}`}
                >
                  <p className="text-slate-300">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-900 to-green-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join 50,000+ traders who trust StockInsight daily</h2>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto">
            Start your investment journey with professional tools and insights.
          </p>
          <button className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto">
            Create Free Account <span className="ml-2">→</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;