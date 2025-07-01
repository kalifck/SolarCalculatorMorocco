import React, { useState, useMemo, useCallback } from 'react';
import ConsumptionInput from './components/ConsumptionInput';
import CostDisplay from './components/CostDisplay';
import ImpactTable from './components/ImpactTable';
import SolarROI from './components/SolarROI';
import CostChart from './components/CostChart';
import SavingsInsight from './components/SavingsInsight';
import Comparison from './components/Comparison';
import { calculateTieredCost, calculateOptimalPanels } from './utils/calculator';
import { 
  SOLAR_PANEL_GENERATION_YEARLY_KWH, 
  SOLAR_PANEL_INSTALL_COST_USD, 
  USD_TO_MAD_EXCHANGE_RATE,
  CONSUMPTION_PRESETS
} from './constants';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

function App() {
  const [monthlyConsumptionKwh, setMonthlyConsumptionKwh] = useState<number>(CONSUMPTION_PRESETS.medium);
  const [numberOfPanels, setNumberOfPanels] = useState<number>(1);
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [panelGenerationKwh, setPanelGenerationKwh] = useState<number>(SOLAR_PANEL_GENERATION_YEARLY_KWH);
  const [panelInstallCost, setPanelInstallCost] = useState<number>(SOLAR_PANEL_INSTALL_COST_USD);

  const handleConsumptionChange = useCallback((value: number) => {
    setMonthlyConsumptionKwh(value);
  }, []);

  const handlePanelChange = useCallback((value: number) => {
    setNumberOfPanels(value);
  }, []);

  const optimalPanels = useMemo(() => {
    return calculateOptimalPanels(
      monthlyConsumptionKwh,
      panelGenerationKwh,
      panelInstallCost,
      USD_TO_MAD_EXCHANGE_RATE,
      20 // Max panels to consider, matching advanced slider
    );
  }, [monthlyConsumptionKwh, panelGenerationKwh, panelInstallCost]);


  const calculations = useMemo(() => {
    const monthlyCost = calculateTieredCost(monthlyConsumptionKwh);
    const yearlyCost = monthlyCost * 12;

    const annualSolarGenerationKwh = numberOfPanels * panelGenerationKwh;
    const monthlySolarGenerationKwh = annualSolarGenerationKwh / 12;
    
    const monthlyConsumptionAfterSolar = Math.max(0, monthlyConsumptionKwh - monthlySolarGenerationKwh);
    const monthlyCostWithSolar = calculateTieredCost(monthlyConsumptionAfterSolar);
    const yearlyCostWithSolar = monthlyCostWithSolar * 12;

    const annualSavingsMAD = yearlyCost - yearlyCostWithSolar;
    const totalInstallationCostUSD = numberOfPanels * panelInstallCost;
    const totalInstallationCostMAD = totalInstallationCostUSD * USD_TO_MAD_EXCHANGE_RATE;

    const roiYears = annualSavingsMAD > 0 ? totalInstallationCostMAD / annualSavingsMAD : Infinity;

    const projectedSavings = (years: number) => (annualSavingsMAD * years) - totalInstallationCostMAD;

    return {
      monthlyCost,
      yearlyCost,
      yearlyCostWithSolar,
      annualSolarGenerationKwh,
      annualSavingsMAD,
      totalInstallationCostUSD,
      totalInstallationCostMAD,
      roiYears,
      projectedSavings5: projectedSavings(5),
      projectedSavings10: projectedSavings(10),
      projectedSavings20: projectedSavings(20),
    };
  }, [monthlyConsumptionKwh, numberOfPanels, panelGenerationKwh, panelInstallCost]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <SunIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-300">
              Solar ROI & Electricity Calculator
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Simulate your electricity costs in Morocco and see your potential solar savings.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="flex flex-col gap-6 lg:gap-8">
            <ConsumptionInput
              consumption={monthlyConsumptionKwh}
              onConsumptionChange={handleConsumptionChange}
            />
            <SolarROI
              numberOfPanels={numberOfPanels}
              onPanelChange={handlePanelChange}
              optimalPanels={optimalPanels}
              annualGeneration={calculations.annualSolarGenerationKwh}
              annualSavings={calculations.annualSavingsMAD}
              installationCostUSD={calculations.totalInstallationCostUSD}
              roiYears={calculations.roiYears}
              isAdvancedMode={isAdvancedMode}
              onAdvancedModeToggle={() => setIsAdvancedMode(prev => !prev)}
              panelGenerationKwh={panelGenerationKwh}
              onPanelGenerationChange={setPanelGenerationKwh}
              panelInstallCost={panelInstallCost}
              onPanelInstallCostChange={setPanelInstallCost}
            />
          </div>
          
          <div className="flex flex-col gap-6 lg:gap-8">
             <CostDisplay
              monthlyCost={calculations.monthlyCost}
              yearlyCost={calculations.yearlyCost}
            />
            <CostChart 
              currentConsumption={monthlyConsumptionKwh}
              numberOfPanels={numberOfPanels}
              panelGenerationKwh={panelGenerationKwh}
            />
             {numberOfPanels > 0 && (
                <Comparison
                    yearlyCost={calculations.yearlyCost}
                    yearlyCostWithSolar={calculations.yearlyCostWithSolar}
                    annualSavings={calculations.annualSavingsMAD}
                    installationCost={calculations.totalInstallationCostMAD}
                    projectedSavings={{
                        '5': calculations.projectedSavings5,
                        '10': calculations.projectedSavings10,
                        '20': calculations.projectedSavings20,
                    }}
                />
            )}
            <ImpactTable />
          </div>
        </main>
        
        {calculations.annualSavingsMAD > 0 && numberOfPanels > 0 && (
          <div className="mt-6 lg:mt-8">
            <SavingsInsight annualSavings={calculations.annualSavingsMAD} />
          </div>
        )}

        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>
                Calculations are based on a non-progressive system. Your entire consumption is billed at the rate of the highest tier you reach.
            </p>
            <p>
                 Tier rates are detailed in the 'Electricity Tier Breakdown' table above.
            </p>
            <p>
                Solar panel cost is an estimate. Assumed exchange rate: 1 USD = {USD_TO_MAD_EXCHANGE_RATE} MAD.
            </p>
        </footer>
      </div>
    </div>
  );
}

export default App;