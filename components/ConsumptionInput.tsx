import React, { useMemo } from 'react';
import Card from './Card';
import { CONSUMPTION_PRESETS, ELECTRICITY_TIERS } from '../constants';

interface ConsumptionInputProps {
  consumption: number;
  onConsumptionChange: (value: number) => void;
}

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ConsumptionInput: React.FC<ConsumptionInputProps> = ({ consumption, onConsumptionChange }) => {
  const presets = [
    { name: 'Small Household', value: CONSUMPTION_PRESETS.small },
    { name: 'Medium Household', value: CONSUMPTION_PRESETS.medium },
    { name: 'Large Household', value: CONSUMPTION_PRESETS.large },
  ];
  
  const minRange = 50;
  const maxRange = 1500;
  const rangeSpan = maxRange - minRange;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
        onConsumptionChange(Math.max(minRange, Math.min(maxRange, value)));
    } else if (e.target.value === '') {
        onConsumptionChange(minRange);
    }
  };

  const getPercentage = (value: number) => {
    if (rangeSpan === 0 || value < minRange) return 0;
    return ((value - minRange) / rangeSpan) * 100;
  };

  const tierLabels = useMemo(() => {
    const labels = [];
    let prevLimit = 0;
    for (let i = 0; i < ELECTRICITY_TIERS.length; i++) {
        const tier = ELECTRICITY_TIERS[i];
        // The start of the tier range for labeling purposes
        const start = prevLimit === 0 ? 0 : prevLimit; 
        const end = isFinite(tier.limit) ? tier.limit : maxRange;

        if (end < minRange || start > maxRange) {
            prevLimit = tier.limit;
            continue;
        }

        const boundedStart = Math.max(start, minRange);
        const boundedEnd = Math.min(end, maxRange);
        
        // Only render if the visible portion of the tier is wide enough
        if (boundedEnd > boundedStart) {
            const center = (boundedStart + boundedEnd) / 2;
            const percent = getPercentage(center);
            
            labels.push({
                name: `Tier ${i + 1}`,
                percent,
            });
        }
        prevLimit = tier.limit;
        if (prevLimit >= maxRange) break;
    }
    return labels;
  }, []);

  const markers = useMemo(() => ELECTRICITY_TIERS.map(t => t.limit).filter(l => isFinite(l) && l < maxRange), []);

  return (
    <Card title="Your Electricity Consumption" icon={<BoltIcon />}>
      <div className="space-y-6">
        <div>
           {/* Tier Labels */}
           <div className="relative w-full h-6 mb-2">
            {tierLabels.map(label => (
              <div key={label.name} className="absolute text-xs font-semibold text-gray-500 dark:text-gray-400" style={{ left: `${label.percent}%`, transform: 'translateX(-50%)' }}>
                {label.name}
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              id="consumption-slider"
              type="range"
              min={minRange}
              max={maxRange}
              step="5"
              value={consumption}
              onChange={(e) => onConsumptionChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
            />
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <input
                    type="number"
                    min={minRange}
                    max={maxRange}
                    value={consumption}
                    onChange={handleInputChange}
                    className="w-20 text-center font-bold text-lg bg-transparent text-brand-dark dark:text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-secondary rounded-lg"
                />
                <span className="pr-2 text-sm text-gray-500 dark:text-gray-400">kWh</span>
            </div>
          </div>
          {/* Tier Threshold Markers */}
          <div className="relative w-full h-4 mt-1"> 
            {markers.map((markerValue) => {
              if (markerValue >= minRange && markerValue <= maxRange) {
                const percent = getPercentage(markerValue);
                return (
                  <div key={markerValue} className="absolute text-center text-xs text-gray-500 dark:text-gray-400" style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}>
                      <div className="h-2 w-px bg-gray-400 mx-auto"></div>
                      {markerValue}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or use a preset:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onConsumptionChange(preset.value)}
                className="px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200
                           bg-brand-light/20 dark:bg-brand-dark/50 text-brand-primary dark:text-brand-light
                           hover:bg-brand-secondary hover:text-white dark:hover:bg-brand-secondary"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConsumptionInput;