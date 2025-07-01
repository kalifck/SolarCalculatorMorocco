
import React from 'react';
import Card from './Card';

interface CostDisplayProps {
  monthlyCost: number;
  yearlyCost: number;
}

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
};

const CashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a2 2 0 000-4H8a2 2 0 000 4h4v1M12 18V21" />
    </svg>
);


const CostDisplay: React.FC<CostDisplayProps> = ({ monthlyCost, yearlyCost }) => {
  return (
    <Card title="Estimated Electricity Bill" icon={<CashIcon />}>
      <div className="flex justify-around items-center text-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Cost</p>
          <p className="text-3xl font-bold text-brand-primary dark:text-brand-accent">
            {formatCurrency(monthlyCost)}
          </p>
        </div>
        <div className="h-16 w-px bg-gray-200 dark:bg-gray-600"></div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Yearly Cost</p>
          <p className="text-3xl font-bold text-brand-primary dark:text-brand-accent">
            {formatCurrency(yearlyCost)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CostDisplay;
