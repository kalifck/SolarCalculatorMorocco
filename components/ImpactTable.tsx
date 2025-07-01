import React, { useMemo } from 'react';
import Card from './Card';
import Tooltip from './Tooltip';
import { calculateTieredCost } from '../utils/calculator';
import { ELECTRICITY_TIERS } from '../constants';

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);


const ImpactTable: React.FC = () => {
  const tierData = useMemo(() => {
    const data = ELECTRICITY_TIERS.map((tier, index, allTiers) => {
        const isFirstTier = index === 0;
        const prevTier = isFirstTier ? null : allTiers[index - 1];

        const range = isFirstTier 
        ? `0 - ${tier.limit} kWh`
        : isFinite(tier.limit)
        ? `${(prevTier?.limit ?? 0) + 1} - ${tier.limit} kWh`
        : `${(prevTier?.limit ?? 0) + 1}+ kWh`;

        const billAtEnd = isFinite(tier.limit) ? calculateTieredCost(tier.limit) : null;

        const increaseVsBase = !isFirstTier ? ((tier.rate - allTiers[0].rate) / allTiers[0].rate) * 100 : 0;
        const increaseVsPrev = !isFirstTier && prevTier ? ((tier.rate - prevTier.rate) / prevTier.rate) * 100 : null;

        return {
            name: `Tier ${index + 1}`,
            range,
            billAtEnd,
            rate: tier.rate,
            increaseVsBase,
            increaseVsPrev
        };
    });
    return data;
  }, []);

  const tierJumps = useMemo(() => {
    return ELECTRICITY_TIERS.filter(tier => isFinite(tier.limit))
      .map((tier, index) => {
        const limit = tier.limit;
        const costBefore = calculateTieredCost(limit);
        const costAfter = calculateTieredCost(limit + 1);
        
        if (costBefore === 0 || costAfter <= costBefore) {
            return null;
        }

        const increaseAmount = costAfter - costBefore;
        const increasePercent = (increaseAmount / costBefore) * 100;
        
        return {
          fromTier: index + 1,
          toTier: index + 2,
          limit,
          increaseAmount,
          increasePercent,
        };
      })
      .filter((jump): jump is NonNullable<typeof jump> => jump !== null);
  }, []);


  const titleContent = (
    <>
      <span>Electricity Tier Breakdown</span>
      <Tooltip text="Morocco uses a non-progressive tier system. Your entire monthly consumption is billed at the rate of the highest tier you reach, which can cause sharp cost increases." />
    </>
  );

  return (
    <Card title={titleContent} icon={<ChartBarIcon />}>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-4 py-3">Tier</th>
                        <th scope="col" className="px-4 py-3">Consumption</th>
                        <th scope="col" className="px-4 py-3">Bill at Tier End</th>
                        <th scope="col" className="px-4 py-3">Price / kWh</th>
                        <th scope="col" className="px-4 py-3">% Rate Inc. (vs Base)</th>
                        <th scope="col" className="px-4 py-3">% Rate Inc. (vs Prev)</th>
                    </tr>
                </thead>
                <tbody>
                    {tierData.map((tier, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {tier.name}
                            </th>
                            <td className="px-4 py-4">{tier.range}</td>
                            <td className="px-4 py-4 font-semibold text-gray-800 dark:text-gray-100">
                                {tier.billAtEnd ? `${tier.billAtEnd.toFixed(2)} MAD` : 'N/A'}
                            </td>
                            <td className="px-4 py-4">{tier.rate.toFixed(2)} MAD</td>
                            <td className={`px-4 py-4 ${tier.increaseVsBase > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}`}>
                                {tier.increaseVsBase > 0 ? `+${tier.increaseVsBase.toFixed(1)}%` : 'Base'}
                            </td>
                            <td className={`px-4 py-4 ${tier.increaseVsPrev ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                                {tier.increaseVsPrev !== null ? `+${tier.increaseVsPrev.toFixed(1)}%` : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6 space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 rounded-r-lg">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-300">The "Tier Jump" Effect</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    A small increase in usage crossing a tier threshold makes your <span className="font-semibold">entire bill</span> more expensive.
                </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {tierJumps.map(jump => (
                    <p key={jump.limit}>• Tier {jump.fromTier} → {jump.toTier} ({jump.limit} → {jump.limit + 1} kWh): Bill jumps by <strong className="text-red-600 dark:text-red-400">{jump.increaseAmount.toFixed(2)} MAD (+{jump.increasePercent.toFixed(1)}%)</strong> for 1 extra kWh.</p>
                ))}
            </div>
        </div>
    </Card>
  );
};

export default ImpactTable;