import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  icon?: React.ReactNode;
  headerAccessory?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon, headerAccessory }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon && <div className="mr-3 text-brand-secondary dark:text-brand-light">{icon}</div>}
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center">{title}</h2>
          </div>
          {headerAccessory && <div>{headerAccessory}</div>}
        </div>
      )}
      <div className="text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
};

export default Card;