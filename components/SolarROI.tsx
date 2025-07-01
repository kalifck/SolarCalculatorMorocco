import React, { useMemo } from 'react';
import Card from './Card';
import Tooltip from './Tooltip';
import { USD_TO_MAD_EXCHANGE_RATE } from '../constants';
import ConfigurableInputRow from './ConfigurableInputRow';
import ConfigurableSliderRow from './ConfigurableSliderRow';

interface SolarROIProps {
  numberOfPanels: number;
  onPanelChange: (value: number) => void;
  optimalPanels: number;
  annualGeneration: number;
  annualSavings: number;
  installationCostUSD: number;
  roiYears: number;
  isAdvancedMode: boolean;
  onAdvancedModeToggle: () => void;
  panelGenerationKwh: number;
  onPanelGenerationChange: (value: number) => void;
  panelInstallCost: number;
  onPanelInstallCostChange: (value: number) => void;
}

const formatCurrency = (value: number, currency: 'USD' | 'MAD') => {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const SolarROI: React.FC<SolarROIProps> = ({
  numberOfPanels,
  onPanelChange,
  optimalPanels,
  annualGeneration,
  annualSavings,
  installationCostUSD,
  roiYears,
  isAdvancedMode,
  onAdvancedModeToggle,
  panelGenerationKwh,
  onPanelGenerationChange,
  panelInstallCost,
  onPanelInstallCostChange,
}) => {
  
  const panelOptions = useMemo(() => {
    const options = new Set([1, 2, 3]);
    if (optimalPanels > 0) {
      options.add(optimalPanels);
    }
    return Array.from(options).sort((a,b) => a-b);
  }, [optimalPanels]);

  const panelLabel = (
    <>
      <span>Number of Solar Panels</span>
      <Tooltip text="The 'Optimal' preset is calculated to give you the fastest Return on Investment (ROI) while ensuring solar generation does not exceed your consumption." />
    </>
  );

  const roiLabel = (
    <>
      <span>Payback Period (ROI)</span>
      <Tooltip text="The time it takes for your investment in solar panels to be paid back by the electricity savings." />
    </>
  );
  
  const advancedModeToggle = (
    <label htmlFor="advanced-toggle" className="flex items-center cursor-pointer">
        <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Advanced</span>
        <div className="relative">
            <input type="checkbox" id="advanced-toggle" className="sr-only" checked={isAdvancedMode} onChange={onAdvancedModeToggle} />
            <div className="block bg-gray-300 dark:bg-gray-600 w-10 h-5 rounded-full"></div>
            <div className={`dot absolute left-1 top-0.5 bg-white dark:bg-gray-400 w-4 h-4 rounded-full transition-transform ${isAdvancedMode ? 'translate-x-5 bg-brand-accent' : ''}`}></div>
        </div>
    </label>
  );

  return (
    <Card 
        title="Solar Panel ROI Simulation" 
        icon={<StarIcon />} 
        className="h-full"
        headerAccessory={advancedModeToggle}
    >
      <div className="space-y-6">
        
        {isAdvancedMode ? (
             <div className="space-y-4 p-4 -mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <ConfigurableSliderRow 
                  label="Number of Panels"
                  value={numberOfPanels}
                  onChange={onPanelChange}
                  min={1}
                  max={20}
                  step={1}
                  unit={numberOfPanels > 1 ? 'panels' : 'panel'}
                />
                <ConfigurableInputRow label="kWh Generated per Panel/Year" value={panelGenerationKwh} onChange={onPanelGenerationChange} unit="kWh" />
                <ConfigurableInputRow label="Installation Cost per Panel" value={panelInstallCost} onChange={onPanelInstallCostChange} unit="USD" />
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">Exchange Rate Assumption: 1 USD = {USD_TO_MAD_EXCHANGE_RATE} MAD</p>
             </div>
        ) : (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        {panelLabel}
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panelOptions.map((num) => (
                    <button
                        key={num}
                        onClick={() => onPanelChange(num)}
                        className={`flex items-center justify-center w-full py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
                        numberOfPanels === num
                            ? 'bg-brand-accent text-brand-dark border-brand-accent'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-transparent'
                        } ${
                        num === optimalPanels 
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-brand-secondary dark:ring-brand-light' 
                            : ''
                        }`}
                    >
                        {num} Panel{num > 1 ? 's' : ''}
                        {num === optimalPanels && <StarIcon />}
                    </button>
                    ))}
                </div>
            </div>
        )}

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <InfoRow label="Total Installation Cost" value={formatCurrency(installationCostUSD, 'USD')} />
          <InfoRow label="Annual Solar Generation" value={`${annualGeneration.toLocaleString()} kWh/year`} />
          <InfoRow label="Annual Monetary Savings" value={formatCurrency(annualSavings, 'MAD')} isHighlight={true} />
          <InfoRow label={roiLabel} value={isFinite(roiYears) ? `${roiYears.toFixed(1)} years` : 'N/A'} isHighlight={true} />
        </div>
      </div>
    </Card>
  );
};

const InfoRow: React.FC<{ label: string | React.ReactNode; value: string; isHighlight?: boolean }> = ({ label, value, isHighlight }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 dark:text-gray-400 flex items-center">{label}</span>
    <span className={`font-bold ${isHighlight ? 'text-xl text-brand-secondary dark:text-brand-accent' : 'text-md text-gray-800 dark:text-gray-100'}`}>
      {value}
    </span>
  </div>
);


export default SolarROI;