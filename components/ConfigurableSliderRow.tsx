import React from 'react';

interface ConfigurableSliderRowProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const ConfigurableSliderRow: React.FC<ConfigurableSliderRowProps> = ({ label, value, onChange, min, max, step, unit }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
        onChange(min);
        return;
    }
    const numValue = parseInt(e.target.value, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-gray-600 dark:text-gray-400 text-sm">{label}</label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
             <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={handleInputChange}
                className="w-20 text-center font-semibold bg-transparent text-brand-dark dark:text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-secondary rounded-lg p-1"
            />
            <span className="pr-2 text-xs text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
      />
    </div>
  );
};

export default ConfigurableSliderRow;