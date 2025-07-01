import React, { useMemo, useState } from 'react';
import Card from './Card';
import { calculateTieredCost } from '../utils/calculator';
import { ELECTRICITY_TIERS } from '../constants';

interface CostChartProps {
  currentConsumption: number;
  numberOfPanels: number;
  panelGenerationKwh: number;
}

const ChartLineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center">
        <div className={`w-4 h-1 mr-2 ${color}`}></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
);


const CostChart: React.FC<CostChartProps> = ({ currentConsumption, numberOfPanels, panelGenerationKwh }) => {
  const [showSolarImpact, setShowSolarImpact] = useState(false);

  const monthlySolarGeneration = (numberOfPanels * panelGenerationKwh) / 12;

  const chartData = useMemo(() => {
    const maxKwh = Math.max(350, Math.ceil((currentConsumption * 1.5) / 50) * 50);
    const points = [];
    
    for (let kwh = 0; kwh <= maxKwh; kwh += 1) {
      points.push({ kwh, cost: calculateTieredCost(kwh) });
    }
    
    const tierLimits = ELECTRICITY_TIERS.map(t => t.limit).filter(l => isFinite(l));
    for (const limit of tierLimits) {
      if (limit < maxKwh) {
        points.push({ kwh: limit, cost: calculateTieredCost(limit) });
        points.push({ kwh: limit + 0.01, cost: calculateTieredCost(limit + 0.01) });
      }
    }

    points.sort((a, b) => a.kwh - b.kwh);

    const maxCost = points.reduce((max, p) => Math.max(max, p.cost), 0);

    return { points, maxKwh, maxCost };
  }, [currentConsumption]);

  const { points, maxKwh, maxCost } = chartData;
  const currentCost = calculateTieredCost(currentConsumption);
  const currentCostWithSolar = calculateTieredCost(Math.max(0, currentConsumption - monthlySolarGeneration));

  const width = 500;
  const height = 300;
  const padding = 50; // Increased padding for labels

  const toSvgX = (kwh: number) => padding + (kwh / maxKwh) * (width - padding * 2);
  const toSvgY = (cost: number) => height - padding - (cost / (maxCost > 0 ? maxCost : 1)) * (height - padding * 2);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.kwh).toFixed(2)} ${toSvgY(p.cost).toFixed(2)}`)
    .join(' ');

  const solarPathD = points
    .map((p, i) => {
        const netKwh = Math.max(0, p.kwh - monthlySolarGeneration);
        const cost = calculateTieredCost(netKwh);
        return `${i === 0 ? 'M' : 'L'} ${toSvgX(p.kwh).toFixed(2)} ${toSvgY(cost).toFixed(2)}`;
    })
    .join(' ');

  return (
    <Card title="Cost vs. Consumption Graph" icon={<ChartLineIcon />}>
        <div className="flex justify-end items-center mb-4">
            <label htmlFor="solar-toggle" className="flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">Show Solar Savings</span>
                <div className="relative">
                    <input type="checkbox" id="solar-toggle" className="sr-only" checked={showSolarImpact} onChange={() => setShowSolarImpact(!showSolarImpact)} />
                    <div className="block bg-gray-300 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white dark:bg-gray-400 w-4 h-4 rounded-full transition-transform ${showSolarImpact ? 'translate-x-6 bg-brand-accent' : ''}`}></div>
                </div>
            </label>
        </div>
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="Cost versus consumption chart">
                {/* Axes Lines */}
                <line x1={padding} y1={padding/2} x2={padding} y2={height - padding} stroke="currentColor" className="text-gray-300 dark:text-gray-600" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-gray-300 dark:text-gray-600" />

                {/* Y-Axis Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map(percentage => {
                  const yValue = maxCost * percentage;
                  return (
                      <text
                          key={`y-label-${percentage}`}
                          x={padding - 8}
                          y={toSvgY(yValue)}
                          textAnchor="end"
                          alignmentBaseline="middle"
                          className="text-xs fill-current text-gray-500 dark:text-gray-400"
                      >
                          {yValue.toFixed(0)}
                      </text>
                  );
                })}
                <text x={padding - 8} y={padding - 12} textAnchor="end" className="text-xs fill-current font-semibold text-gray-500 dark:text-gray-400">MAD</text>
                
                {/* X-Axis Labels */}
                <text x={padding} y={height - padding + 15} textAnchor="start" className="text-xs fill-current text-gray-500 dark:text-gray-400">0 kWh</text>
                <text x={width - padding} y={height - padding + 15} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">{maxKwh} kWh</text>

                {/* Tier markers */}
                {ELECTRICITY_TIERS.filter(tier => isFinite(tier.limit)).map(tier => {
                    const x = toSvgX(tier.limit);
                    if (x > padding && x < width - padding) {
                      return (
                          <g key={tier.limit}>
                              <line x1={x} y1={padding/2} x2={x} y2={height-padding} strokeDasharray="4" className="text-gray-300 dark:text-gray-600" />
                              <text x={x} y={height-padding+15} textAnchor="middle" className="text-xs fill-current text-gray-500 dark:text-gray-400">{tier.limit}</text>
                          </g>
                      )
                    }
                    return null;
                })}

                {/* Data Paths */}
                <path d={pathD} fill="none" strokeWidth="2" className="stroke-brand-secondary" />
                {showSolarImpact && <path d={solarPathD} fill="none" strokeWidth="2" strokeDasharray="5" className="stroke-green-500" />}

                {/* Current Point */}
                {showSolarImpact && (
                  <circle cx={toSvgX(currentConsumption)} cy={toSvgY(currentCostWithSolar)} r="5" className="fill-green-500 stroke-white dark:stroke-gray-800" strokeWidth="2">
                    <title>{`With Solar: ${currentCostWithSolar.toFixed(2)} MAD`}</title>
                  </circle>
                )}
                <circle cx={toSvgX(currentConsumption)} cy={toSvgY(currentCost)} r="5" className="fill-brand-accent stroke-white dark:stroke-gray-800" strokeWidth="2">
                   <title>{`Current: ${currentConsumption} kWh, ${currentCost.toFixed(2)} MAD`}</title>
                </circle>
            </svg>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                <LegendItem color="bg-brand-secondary" label="Original Cost" />
                {showSolarImpact && <LegendItem color="bg-green-500" label="Cost with Solar" />}
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-brand-accent ring-1 ring-white"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Your Consumption</span>
                </div>
            </div>
        </div>
    </Card>
  );
};

export default CostChart;