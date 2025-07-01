import React from 'react';

interface ConfigurableInputRowProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    unit: string;
}

const ConfigurableInputRow: React.FC<ConfigurableInputRowProps> = ({ label, value, onChange, unit }) => (
    <div className="flex justify-between items-center">
        <label htmlFor={label} className="text-gray-600 dark:text-gray-400 text-sm">{label}</label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
             <input
                id={label}
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
                className="w-24 text-center font-semibold bg-transparent text-brand-dark dark:text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-secondary rounded-lg p-1"
            />
            <span className="pr-2 text-xs text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
    </div>
);

export default ConfigurableInputRow;