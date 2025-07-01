
export interface ElectricityTier {
    limit: number;
    rate: number;
}

export const ELECTRICITY_TIERS: ElectricityTier[] = [
  { limit: 100, rate: 0.9010 },   // Tier 1: 0-100 kWh
  { limit: 150, rate: 1.0732 },   // Tier 2: 101-150 kWh
  { limit: 200, rate: 1.0732 },   // Tier 3: 151-200 kWh
  { limit: 300, rate: 1.1676 },   // Tier 4: 201-300 kWh
  { limit: 500, rate: 1.3817 },   // Tier 5: 301-500 kWh
  { limit: Infinity, rate: 1.5958 }, // Tier 6: 501+ kWh
];

export const SOLAR_PANEL_GENERATION_YEARLY_KWH = 670;
export const SOLAR_PANEL_INSTALL_COST_USD = 300;
export const USD_TO_MAD_EXCHANGE_RATE = 10; // Approximate for calculation

export const CONSUMPTION_PRESETS = {
  small: 225, // Midpoint of 201-300 kWh/month
  medium: 450, // Midpoint of 301-500 kWh/month
  large: 800, // Represents consumption in the 501+ kWh/month tier
};
