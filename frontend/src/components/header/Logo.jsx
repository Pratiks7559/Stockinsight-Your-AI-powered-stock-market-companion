// components/Logo.jsx
const Logo = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main Circle Background */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#bgGradient)"
          stroke="#1F2937"
          strokeWidth="2"
        />
        
        {/* Inner Circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#374151"
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Stock Chart Line */}
        <path
          d="M 20 65 L 30 55 L 40 60 L 50 45 L 60 35 L 70 40 L 80 25"
          stroke="url(#chartGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Data Points */}
        <circle cx="30" cy="55" r="2" fill="#10B981" />
        <circle cx="50" cy="45" r="2" fill="#10B981" />
        <circle cx="70" cy="40" r="2" fill="#10B981" />
        
        {/* Eye Symbol (Insight) */}
        <ellipse
          cx="50"
          cy="75"
          rx="8"
          ry="5"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <circle
          cx="50"
          cy="75"
          r="3"
          fill="#1E40AF"
        />
        <circle
          cx="51"
          cy="74"
          r="1"
          fill="#FFFFFF"
        />
        
        {/* S Letter Integration */}
        <path
          d="M 25 30 Q 30 25 35 30 Q 30 35 25 30"
          fill="#FFFFFF"
          opacity="0.8"
        />
        
        {/* Trending Arrow */}
        <path
          d="M 75 30 L 80 25 L 80 30 L 75 30 Z"
          fill="#10B981"
        />
        <path
          d="M 70 35 L 80 25"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Logo;