// src/components/UI/Card.jsx
const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}>
      {children}
    </div>
  )
}

export default Card