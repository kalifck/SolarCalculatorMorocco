
import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';

interface SavingsInsightProps {
  annualSavings: number;
}

const INSIGHTS: { [key: string]: string[] } = {
  '0-3000': [
    "Hadi 💸 flous dyal qahwa w 3sir f Ain Diab kul nhar.",
    "Bla solar? 🥲 safi, msemen b Nutella ma3 sbah raho mcha.",
    "T9dar t9ahwa 🥐 f café zwin kul weekend b had l’flous.",
    "Bro 😅 hadi shawarma w juice m3a drari kul nhar.",
    "No panels? 🤦‍♂️ smoothies dyal bordj wla ghir 7olm.",
  ],
  '3001-7000': [
    "Hadi 📺 Netflix, Spotify, w PlayStation kolha sana.",
    "Solar 🌞 kan ykhlass lik l’abonnements kolhom.",
    "Hadi 💻 upgrade dyal l’internet w gadgets jdod.",
    "Bro 🎮 FIFA jdida w joystick jdida. Solar sponsor!",
    "Bla solar? 😜 b9iti katsouf séries l9dima bark.",
  ],
  '7001-12000': [
    "Hadi 📱 flous dyal iPhone jdida. Daba b9a m3 dak screen mkser.",
    "Solar 🌞 kan yjib lik Samsung Galaxy jdida.",
    "Bro 🤳 hadi TikTok w selfies quality jdida.",
    "Bla panels? 🥲 b9iti katsawer b camera dyal zin9a.",
    "Safi, solar kont tshri bih phone o t9ra stories b raha.",
  ],
  '12001-18000': [
    "🚗 hadi roadtrip l Chefchaouen m3a drari.",
    "B solair 🌞 tmchi Marrakech w t3oume f la piscine.",
    "Bro 🏖️ ziyaras f Agadir w music tal3a.",
    "Bla panels? 🙃 safart ghir f Google Maps.",
    "Hadi flous dyal tsafira o tayara l'Dakhla.",
  ],
  '18001-25000': [
    "💰 Hadi t9dam dyal tonobil jdida. Solar broker dyalk.",
    "Bro 🏠 kont tdir rooftop zwina b sofas w lights.",
    "Safi bla solar 🥲 b9iti katsalam 3la tonobil l9dima.",
    "Hadi flous dyal Salon raba3 f dar.",
  ],
  '25000+': [
    "Bro 😎 solar ykhlass lik riad jdida w nta darba fik chamch.",
    "💸 hadi flous dyal tour VIP f Maghrib b hotels 5 stars.",
    "Solar 🌞 kont tdir bih home cinema f dar.",
    "Bla panels? 🤯 b9iti katshouf Netflix f portable l9dim. f3awte LG OLED 75\"",
    "Hadi 💵 budget dyal tbddl cuisine kamla.",
    " 10 ans et hanta jma3ti l sakane i9tissadi FABOR 3la 7sab Solair ! ",
  ]
};

const getInsightCategory = (savings: number): string[] => {
  if (savings <= 3000) return INSIGHTS['0-3000'];
  if (savings <= 7000) return INSIGHTS['3001-7000'];
  if (savings <= 12000) return INSIGHTS['7001-12000'];
  if (savings <= 18000) return INSIGHTS['12001-18000'];
  if (savings <= 25000) return INSIGHTS['18001-25000'];
  return INSIGHTS['25000+'];
};

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);


const SavingsInsight: React.FC<SavingsInsightProps> = ({ annualSavings }) => {
  const insightOptions = useMemo(() => getInsightCategory(annualSavings), [annualSavings]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  // Reset index when the category of insights changes
  useEffect(() => {
    setCurrentInsightIndex(0);
  }, [insightOptions]);

  const cycleInsight = () => {
    setCurrentInsightIndex((prevIndex) => (prevIndex + 1) % insightOptions.length);
  };

  return (
    <Card title="Savings Insight" icon={<LightbulbIcon />}>
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">By not installing solar panels, you could be missing out on annual savings of</p>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400 my-2">
            {annualSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
        </p>
        <div 
            className="mt-4 p-4 bg-brand-light/20 dark:bg-brand-dark/30 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
            onMouseEnter={cycleInsight}
        >
            <p className="font-semibold text-brand-primary dark:text-brand-light">What could you do with the savings?</p>
            <p className="text-lg italic text-gray-700 dark:text-gray-300 mt-2 min-h-[4rem] flex items-center justify-center">
               "{insightOptions[currentInsightIndex]}"
            </p>
        </div>
      </div>
    </Card>
  );
};

export default SavingsInsight;
