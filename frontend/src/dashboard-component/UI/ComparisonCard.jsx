const ComparisonCard = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default ComparisonCard;