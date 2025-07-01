import React from 'react';

interface CardProps {
  title: string | React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAccessory?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className, headerAccessory }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 ${className || ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-brand-accent">{icon}</div>}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        {headerAccessory && <div>{headerAccessory}</div>}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default Card;
