document.addEventListener('DOMContentLoaded', () => {
    // --- THEME SWITCHER ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = 'Toggle Light Mode';
    } else {
        if (themeToggle) themeToggle.textContent = 'Toggle Dark Mode';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggle.textContent = 'Toggle Light Mode';
            } else {
                themeToggle.textContent = 'Toggle Dark Mode';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // --- CALCULATOR CONSTANTS (adapted from constants.ts) ---
    const ELECTRICITY_TIERS = [
        { limit: 100, rate: 0.9010 },
        { limit: 150, rate: 1.0732 },
        { limit: 200, rate: 1.0732 },
        { limit: 300, rate: 1.1676 },
        { limit: 500, rate: 1.3817 },
        { limit: Infinity, rate: 1.5958 },
    ];

    const SOLAR_PANEL_GENERATION_YEARLY_KWH_DEFAULT = 670;
    const SOLAR_PANEL_INSTALL_COST_USD_DEFAULT = 300;
    const USD_TO_MAD_EXCHANGE_RATE_DEFAULT = 10;

    // --- CORE CALCULATION FUNCTIONS (adapted from utils/calculator.ts) ---
    function calculateTieredCost(monthlyKwh) {
        if (monthlyKwh <= 0) return 0;

        for (const tier of ELECTRICITY_TIERS) {
            if (monthlyKwh <= tier.limit) {
                return monthlyKwh * tier.rate;
            }
        }
        // Fallback for consumption exceeding the last defined finite tier limit
        return monthlyKwh * ELECTRICITY_TIERS[ELECTRICITY_TIERS.length - 1].rate;
    }

    function calculateOptimalPanels(monthlyKwh, panelGeneration, panelCost, exchangeRate, maxPanels = 10) {
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
        return bestOption.roi === Infinity ? 1 : bestOption.panels;
    }

    // --- MAIN CALCULATOR LOGIC & UI UPDATE ---
    function updateCalculator() {
        // Get input values
        const monthlyConsumptionKwh = parseFloat(document.getElementById('monthly-consumption').value) || 0;
        const numberOfPanels = parseInt(document.getElementById('num-panels').value) || 0;

        const isAdvancedMode = document.getElementById('advanced-mode-toggle').checked;
        const panelGenerationKwh = isAdvancedMode ? (parseFloat(document.getElementById('panel-generation').value) || SOLAR_PANEL_GENERATION_YEARLY_KWH_DEFAULT) : SOLAR_PANEL_GENERATION_YEARLY_KWH_DEFAULT;
        const panelInstallCostUSD = isAdvancedMode ? (parseFloat(document.getElementById('panel-cost').value) || SOLAR_PANEL_INSTALL_COST_USD_DEFAULT) : SOLAR_PANEL_INSTALL_COST_USD_DEFAULT;
        const exchangeRate = USD_TO_MAD_EXCHANGE_RATE_DEFAULT; // Could make this configurable later

        // --- Calculations ---
        const currentMonthlyCost = calculateTieredCost(monthlyConsumptionKwh);
        const currentYearlyCost = currentMonthlyCost * 12;

        const annualSolarGenerationKwh = numberOfPanels * panelGenerationKwh;
        const monthlySolarGenerationKwh = annualSolarGenerationKwh / 12;

        const effectiveMonthlySolarGeneration = Math.min(monthlyConsumptionKwh, monthlySolarGenerationKwh);
        const monthlyConsumptionAfterSolar = Math.max(0, monthlyConsumptionKwh - effectiveMonthlySolarGeneration);

        const monthlyCostWithSolar = calculateTieredCost(monthlyConsumptionAfterSolar);
        const yearlyCostWithSolar = monthlyCostWithSolar * 12;

        const annualSavingsMAD = currentYearlyCost - yearlyCostWithSolar;

        const totalInstallationCostUSD = numberOfPanels * panelInstallCostUSD;
        const totalInstallationCostMAD = totalInstallationCostUSD * exchangeRate;

        let roiYears = Infinity;
        if (annualSavingsMAD > 0) {
            roiYears = totalInstallationCostMAD / annualSavingsMAD;
        }

        // Projected Savings
        const projectedSavings = (years) => (annualSavingsMAD * years) - totalInstallationCostMAD;
        const savings5Years = projectedSavings(5);
        const savings10Years = projectedSavings(10);
        const savings20Years = projectedSavings(20);

        // --- Update UI ---
        const formatCurrency = (value, decimals = 2) => value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        const formatYears = (value) => isFinite(value) ? value.toFixed(1) : "N/A";

        document.getElementById('current-monthly-cost').textContent = formatCurrency(currentMonthlyCost);
        document.getElementById('current-yearly-cost').textContent = formatCurrency(currentYearlyCost);

        document.getElementById('solar-monthly-cost').textContent = formatCurrency(monthlyCostWithSolar);
        document.getElementById('solar-yearly-cost').textContent = formatCurrency(yearlyCostWithSolar);

        document.getElementById('installation-cost-usd').textContent = formatCurrency(totalInstallationCostUSD);
        document.getElementById('installation-cost-mad').textContent = formatCurrency(totalInstallationCostMAD);
        document.getElementById('annual-savings').textContent = formatCurrency(annualSavingsMAD);
        document.getElementById('roi-years').textContent = formatYears(roiYears);

        document.getElementById('savings-5-years').textContent = formatCurrency(savings5Years);
        document.getElementById('savings-10-years').textContent = formatCurrency(savings10Years);
        document.getElementById('savings-20-years').textContent = formatCurrency(savings20Years);

        document.getElementById('exchange-rate-display').textContent = exchangeRate;
    }

    // --- EVENT LISTENERS ---
    // General input listeners
    const inputsToWatch = [
        'monthly-consumption',
        'num-panels',
        'advanced-mode-toggle',
        'panel-generation',
        'panel-cost'
    ];

    inputsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateCalculator);
            if (element.type === 'checkbox') { // For advanced mode toggle to also trigger on change
                 element.addEventListener('change', updateCalculator);
            }
        }
    });

    // Special handling for slider to update number input and vice-versa
    const numPanelsInput = document.getElementById('num-panels');
    const numPanelsSlider = document.getElementById('num-panels-slider');

    if (numPanelsInput && numPanelsSlider) {
        numPanelsInput.addEventListener('input', (e) => {
            numPanelsSlider.value = e.target.value;
            updateCalculator(); // Already handled by generic listener, but explicit for clarity
        });
        numPanelsSlider.addEventListener('input', (e) => {
            numPanelsInput.value = e.target.value;
            updateCalculator(); // Already handled by generic listener
        });
    }

    // Advanced mode visibility
    const advancedToggle = document.getElementById('advanced-mode-toggle');
    const advancedInputsDiv = document.getElementById('advanced-inputs');
    if (advancedToggle && advancedInputsDiv) {
        advancedToggle.addEventListener('change', () => {
            advancedInputsDiv.classList.toggle('hidden', !advancedToggle.checked);
            updateCalculator(); // Recalculate when advanced mode changes
        });
        // Initial state
        advancedInputsDiv.classList.toggle('hidden', !advancedToggle.checked);
    }

    // Tier table visibility
    const tierToggle = document.getElementById('toggle-tier-info');
    const tierTableContainer = document.getElementById('tier-table-container');
    if (tierToggle && tierTableContainer) {
        tierToggle.addEventListener('click', () => {
            const isHidden = tierTableContainer.classList.toggle('hidden');
            tierToggle.textContent = isHidden ? '(Show)' : '(Hide)';
        });
    }

    // Populate Tier Table
    const tierTableBody = document.querySelector('#tier-table tbody');
    if (tierTableBody) { // Check if tierTableBody is not null
        ELECTRICITY_TIERS.forEach((tier, index) => {
            const row = tierTableBody.insertRow();
            row.insertCell().textContent = `Tier ${index + 1}`;

            let rangeText = '';
            if (index === 0) {
                rangeText = `0 - ${tier.limit}`;
            } else {
                const prevLimit = ELECTRICITY_TIERS[index-1].limit;
                rangeText = `${prevLimit + 1} - ${isFinite(tier.limit) ? tier.limit : '+'}`;
            }
            row.insertCell().textContent = rangeText;
            row.insertCell().textContent = tier.rate.toFixed(4);
        });
    }

    // Optimal Panels Button
    const optimalPanelsBtn = document.getElementById('optimal-panels-btn');
    if (optimalPanelsBtn) {
        optimalPanelsBtn.addEventListener('click', () => {
            const monthlyConsumptionKwh = parseFloat(document.getElementById('monthly-consumption').value) || 0;
            const isAdvancedMode = document.getElementById('advanced-mode-toggle').checked;
            const panelGenerationKwh = isAdvancedMode ? (parseFloat(document.getElementById('panel-generation').value) || SOLAR_PANEL_GENERATION_YEARLY_KWH_DEFAULT) : SOLAR_PANEL_GENERATION_YEARLY_KWH_DEFAULT;
            const panelInstallCostUSD = isAdvancedMode ? (parseFloat(document.getElementById('panel-cost').value) || SOLAR_PANEL_INSTALL_COST_USD_DEFAULT) : SOLAR_PANEL_INSTALL_COST_USD_DEFAULT;
            const exchangeRate = USD_TO_MAD_EXCHANGE_RATE_DEFAULT;

            // Determine maxPanels based on advanced mode slider range or a default
            const numPanelsSliderElement = document.getElementById('num-panels-slider');
            const maxPanelsForOptimal = numPanelsSliderElement ? parseInt(numPanelsSliderElement.max) : 20;


            const optimalNum = calculateOptimalPanels(
                monthlyConsumptionKwh,
                panelGenerationKwh,
                panelInstallCostUSD,
                exchangeRate,
                maxPanelsForOptimal
            );

            if (numPanelsInput && numPanelsSlider) {
                numPanelsInput.value = optimalNum;
                numPanelsSlider.value = optimalNum;
                updateCalculator(); // Trigger update with new panel number
            }
        });
    }


    // Initial calculation on page load
    updateCalculator();
});
