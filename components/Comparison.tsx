import React from 'react';
import Card from './Card';

interface ComparisonProps {
    yearlyCost: number;
    yearlyCostWithSolar: number;
    annualSavings: number;
    installationCost: number;
    projectedSavings: { [key: string]: number };
}

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
};

const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M12 8h.01M15 8h.01M9 5h.01M12 5h.01M15 5h.01M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
);


const Comparison: React.FC<ComparisonProps> = ({ yearlyCost, yearlyCostWithSolar, annualSavings, projectedSavings, installationCost }) => {
  return (
    <Card title="Financial Summary" icon={<CalculatorIcon />}>
      <div className="space-y-4">
        <InfoRow label="Yearly Cost (Without Solar)" value={formatCurrency(yearlyCost)} />
        <InfoRow label="Yearly Cost (With Solar)" value={formatCurrency(yearlyCostWithSolar)} />
        <InfoRow label="Annual Net Savings" value={formatCurrency(annualSavings)} isHighlight={true} highlightColor="text-green-600 dark:text-green-400" />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Projected Net Savings</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 -mt-2">(Savings after subtracting installation cost of {formatCurrency(installationCost)})</p>
          <div className="space-y-2">
            {Object.entries(projectedSavings).map(([years, savings]) => (
                 <div key={years} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="font-medium">After {years} Years</span>
                    <span className={`font-bold text-lg ${savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(savings)}
                    </span>
                 </div>
            ))}
          </div>
        </div>
    </Card>
  );
};

const InfoRow: React.FC<{ label: string, value: string, isHighlight?: boolean, highlightColor?: string }> = ({ label, value, isHighlight, highlightColor = 'text-brand-secondary dark:text-brand-accent' }) => (
    <div className="flex justify-between items-baseline">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`font-bold ${isHighlight ? `text-xl ${highlightColor}` : 'text-md text-gray-800 dark:text-gray-100'}`}>
        {value}
      </span>
    </div>
  );

export default Comparison;