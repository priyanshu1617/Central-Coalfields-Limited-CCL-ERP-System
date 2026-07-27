import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, glass = false }) => {
  return (
    <div className={`p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 transition-all duration-200 ${
      glass ? 'glass-panel' : 'bg-white dark:bg-ccl-navyLight shadow-sm'
    } ${hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
