import { ELECTRICITY_TIERS } from '../constants';

export const calculateTieredCost = (monthlyKwh: number): number => {
  if (monthlyKwh <= 0) return 0;

  // Non-progressive calculation: the entire consumption is billed at the rate of the tier it falls into.
  for (const tier of ELECTRICITY_TIERS) {
    if (monthlyKwh <= tier.limit) {
      return monthlyKwh * tier.rate;
    }
  }
  
  // This should not be reached if the last tier has limit: Infinity, but as a fallback:
  return monthlyKwh * ELECTRICITY_TIERS[ELECTRICITY_TIERS.length - 1].rate;
};

export const calculateOptimalPanels = (
    monthlyKwh: number, 
    panelGeneration: number, 
    panelCost: number,
    exchangeRate: number,
    maxPanels: number = 10
): number => {
    const originalYearlyCost = calculateTieredCost(monthlyKwh) * 12;
    if (originalYearlyCost === 0) return 1;

    let bestOption = {
        panels: 1,
        roi: Infinity,
    };

    for (let panelCount = 1; panelCount <= maxPanels; panelCount++) {
        const totalInstallationCostUSD = panelCount * panelCost;
        const totalInstallationCostMAD = totalInstallationCostUSD * exchangeRate;
        
        const annualSolarGenerationKwh = panelCount * panelGeneration;
        const monthlySolarGenerationKwh = annualSolarGenerationKwh / 12;
        
        // Auto-consumption rule: solar generation cannot exceed consumption
        const effectiveMonthlySolarGeneration = Math.min(monthlyKwh, monthlySolarGenerationKwh);
        
        const monthlyConsumptionAfterSolar = monthlyKwh - effectiveMonthlySolarGeneration;
        const yearlyCostWithSolar = calculateTieredCost(monthlyConsumptionAfterSolar) * 12;
        
        const annualSavingsMAD = originalYearlyCost - yearlyCostWithSolar;

        if (annualSavingsMAD > 0) {
            const currentRoi = totalInstallationCostMAD / annualSavingsMAD;
            if (currentRoi < bestOption.roi) {
                bestOption = { panels: panelCount, roi: currentRoi };
            }
        }
    }

    // If no option had a finite ROI (no savings), default to 1
    return bestOption.roi === Infinity ? 1 : bestOption.panels;
};
