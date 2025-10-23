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
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="40%" stopColor="#0080FF" />
            <stop offset="100%" stopColor="#1A1A2E" />
          </radialGradient>
          
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="50%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#45B7D1" />
          </linearGradient>
          
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
          
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="innerShadow">
            <feOffset dx="0" dy="2"/>
            <feGaussianBlur stdDeviation="2" result="offset-blur"/>
            <feFlood floodColor="#000000" floodOpacity="0.3"/>
            <feComposite in2="offset-blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="3"
          opacity="0.8"
          filter="url(#glow)"
        />
        
        {/* Main Core Circle */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="url(#coreGradient)"
          filter="url(#innerShadow)"
        />
        
        {/* Dynamic S Shape */}
        <path
          d="M 35 35 Q 50 25 65 35 Q 50 45 35 35 M 35 65 Q 50 55 65 65 Q 50 75 35 65"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        
        {/* Central Pulse */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="#FFFFFF"
          opacity="0.9"
        >
          <animate
            attributeName="r"
            values="6;10;6"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;0.5;0.9"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Orbiting Elements */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 50 50;360 50 50"
            dur="8s"
            repeatCount="indefinite"
          />
          <circle cx="50" cy="25" r="3" fill="#FFD93D" opacity="0.8" />
          <circle cx="75" cy="50" r="2" fill="#FF6B6B" opacity="0.8" />
          <circle cx="50" cy="75" r="2.5" fill="#4ECDC4" opacity="0.8" />
          <circle cx="25" cy="50" r="2" fill="#45B7D1" opacity="0.8" />
        </g>
        
        {/* Inner Geometric Pattern */}
        <g opacity="0.3">
          <path
            d="M 40 40 L 60 40 L 60 60 L 40 60 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <path
            d="M 45 45 L 55 45 L 55 55 L 45 55 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.5"
          />
        </g>
        
        {/* Corner Accents */}
        <path
          d="M 20 20 L 25 20 L 20 25 Z"
          fill="url(#accentGradient)"
          opacity="0.6"
        />
        <path
          d="M 80 20 L 75 20 L 80 25 Z"
          fill="url(#accentGradient)"
          opacity="0.6"
        />
        <path
          d="M 20 80 L 25 80 L 20 75 Z"
          fill="url(#accentGradient)"
          opacity="0.6"
        />
        <path
          d="M 80 80 L 75 80 L 80 75 Z"
          fill="url(#accentGradient)"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

export default Logo;