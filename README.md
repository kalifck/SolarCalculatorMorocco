# Solar ROI & Electricity Calculator for Morocco: Documentation

This document explains the functionality of the Solar ROI & Electricity Calculator, its utility within the Moroccan context, and details on the specific regulations it models.

## 1. Overview

This calculator is designed to help users in Morocco:
- Estimate their monthly and yearly electricity costs based on their consumption.
- Simulate the potential savings and return on investment (ROI) from installing a solar photovoltaic (PV) system.
- Understand how different consumption levels and solar system sizes impact their electricity bills.

The tool provides inputs for monthly electricity consumption (in kWh) and the number of solar panels. It also features an "Advanced Mode" allowing users to customize assumptions like solar panel generation capacity and installation costs.

Key outputs include:
- Current estimated electricity costs (monthly and yearly).
- Estimated electricity costs with solar (monthly and yearly).
- Annual savings with solar.
- Total installation cost for the solar system (in USD and MAD).
- Return on Investment (ROI) in years.
- Projected net savings over 5, 10, and 20 years.
- A visual comparison of costs with and without solar.

## 2. Core Functionality

The calculator's primary functions are:
- **Electricity Cost Calculation:** Based on a tiered tariff system specific to Morocco.
- **Solar PV System Simulation:** Modeling energy generation from solar panels.
- **Savings and ROI Analysis:** Comparing costs with and without solar to determine financial viability.

## 3. Electricity Cost Calculation

The calculator estimates electricity costs using a tiered tariff structure, as defined in its configuration (see `constants.ts` for specific rates). As of the current version, these tiers are:

| Consumption Range (kWh/month) | Rate (MAD/kWh) |
|-------------------------------|----------------|
| 0 - 100                       | 0.9010         |
| 101 - 150                     | 1.0732         |
| 151 - 200                     | 1.0732         |
| 201 - 300                     | 1.1676         |
| 301 - 500                     | 1.3817         |
| 501+                          | 1.5958         |

**Key Feature: Non-Progressive Billing**

A crucial aspect of the electricity cost calculation modeled by this tool is its **non-progressive nature**. This means:
- If your monthly consumption falls into a particular tier, your *entire* electricity consumption for that month is billed at the rate of that specific tier.
- For example, if you consume 250 kWh in a month, you fall into the "201-300 kWh" tier. Your entire 250 kWh will be billed at the rate of 1.1676 MAD/kWh, not just the portion above 200 kWh.

This is implemented in the `calculateTieredCost` function within `utils/calculator.ts`. Understanding this billing method is vital for managing electricity expenses, as even a small increase in consumption can push you into a higher tier and significantly increase your overall bill.

## 4. Solar ROI Calculation

The calculator helps users assess the financial viability of installing solar panels by estimating energy generation, costs, savings, and the Return on Investment (ROI).

**A. Solar Energy Generation:**
- The user inputs the number of solar panels they are considering.
- Each panel is assumed to generate a certain amount of electricity per year (default: `SOLAR_PANEL_GENERATION_YEARLY_KWH` = 670 kWh, configurable in Advanced Mode).
- The total annual solar generation is simply `(Number of Panels) * (Annual Generation per Panel)`.
- This annual generation is then averaged monthly for comparison with monthly consumption.

**B. Cost of Solar System:**
- The installation cost per panel is assumed (default: `SOLAR_PANEL_INSTALL_COST_USD` = $300, configurable in Advanced Mode).
- The total installation cost is `(Number of Panels) * (Cost per Panel)`.
- This cost is converted from USD to Moroccan Dirhams (MAD) using a defined exchange rate (default: `USD_TO_MAD_EXCHANGE_RATE` = 10 MAD per USD).

**C. Calculating Savings and New Bill:**
- **Auto-Consumption Model:** A critical assumption in this calculator (as per `calculateOptimalPanels` function in `utils/calculator.ts`) is that solar energy generated is primarily for self-consumption. The amount of solar energy that reduces your bill is capped by your actual monthly consumption.
    - `Effective Monthly Solar Generation = min(Your Monthly Consumption, Monthly Solar Generation)`
    - This means if your solar panels produce more electricity than you consume in a month, the excess generation does not provide additional bill reduction or financial credit in this model.
- The monthly electricity consumption from the grid is reduced by this effective monthly solar generation:
    - `Net Consumption = Your Monthly Consumption - Effective Monthly Solar Generation`
- A new, lower electricity bill is calculated based on this `Net Consumption` using the same non-progressive tiered tariff system described earlier.
- **Annual Savings:** The difference between the original annual electricity cost (without solar) and the new annual electricity cost (with solar).
    - `Annual Savings (MAD) = Annual Cost (No Solar) - Annual Cost (With Solar)`

**D. Return on Investment (ROI):**
- The ROI is the time it takes for the accumulated annual savings to cover the total installation cost of the solar system.
    - `ROI (Years) = Total Installation Cost (MAD) / Annual Savings (MAD)`
- If annual savings are zero or negative (e.g., if the system is too small or costs are too high relative to savings), the ROI is considered infinite.

**E. Optimal Panel Calculation:**
- The calculator includes a feature to suggest an "optimal" number of panels (`calculateOptimalPanels` function).
- This is determined by iterating through a range of panel numbers (from 1 up to a maximum, default 10, or 20 in advanced mode). For each number of panels, it calculates the ROI.
- The "optimal" number is the one that results in the shortest ROI period. If no configuration yields a positive saving (and thus a finite ROI), it defaults to suggesting 1 panel.
- This optimization is based purely on minimizing the ROI period under the self-consumption model.

**Assumptions to Note:**
- **Panel Degradation:** The calculator does not currently model panel degradation over time (i.e., the slight decrease in electricity production each year).
- **Maintenance Costs:** Ongoing maintenance costs for the solar system are not included in the ROI calculation.
- **Tariff Changes:** Future changes in electricity tariffs are not factored in.
- **Financing Costs:** Costs associated with loans or financing for the solar system are not included.
- **Net Metering/Feed-in Tariffs:** The current model strictly adheres to self-consumption. It does not account for potential revenue or credits from exporting excess electricity to the grid, which may or may not be available/lucrative under specific Moroccan regulations for residential producers.

## 5. Utility of the Calculator in the Moroccan Context

This calculator is particularly useful for electricity consumers in Morocco due to the way it models specific characteristics of the local energy landscape:

**A. Navigating Non-Progressive Tariffs:**
- The non-progressive billing system means that small changes in consumption can lead to disproportionately large changes in the electricity bill if they cause the consumption to cross into a higher tariff tier.
- **Utility:** Users can simulate different consumption levels to understand these thresholds better. This can help in making informed decisions about energy conservation measures to stay within a lower, more affordable tariff band. For example, a user might see that reducing consumption by just 10-20 kWh could prevent them from moving to a higher tier, saving a significant amount on their bill.

**B. Optimizing Solar Investment under Self-Consumption Rules:**
- The calculator's auto-consumption model (where solar energy produced beyond immediate on-site needs doesn't yield further financial benefits) is a crucial factor for solar investments.
- **Utility:**
    - **Right-Sizing Systems:** It helps users understand that oversizing a solar PV system beyond their actual consumption needs might lead to diminished returns, as the excess energy isn't "sold back" or credited in this model. The `calculateOptimalPanels` function specifically tries to find a balance that maximizes ROI under this constraint.
    - **Maximizing Direct Savings:** The tool encourages users to match their solar system's generation capacity as closely as possible to their consumption profile to maximize the direct offsetting of their electricity bill.
    - **Understanding Payback:** It provides a realistic ROI expectation based on this self-consumption model, which is more conservative and often more accurate than models that might assume generous feed-in tariffs if such tariffs are not readily accessible or applicable for the user's situation in Morocco.

**C. Financial Planning and Awareness:**
- **Utility:** By providing estimates for installation costs, annual savings, and ROI periods, the calculator empowers users to:
    - Make more informed financial decisions about investing in solar energy.
    - Compare the long-term financial benefits of solar against the upfront investment.
    - Understand the impact of varying numbers of panels or different panel efficiencies (via Advanced Mode) on their potential savings.

**D. Encouraging Renewable Energy Adoption:**
- **Utility:** By making the potential benefits of solar energy tangible and quantifiable, the calculator can encourage more Moroccan households and businesses to consider solar PV installations. This aligns with Morocco's national goals for increasing renewable energy usage.

In essence, the calculator serves as a practical decision-making tool, tailored to help users navigate the specific financial implications of electricity consumption and solar energy production within the framework of Morocco's common tariff structures and self-consumption models for solar PV.

## 6. Special Regulations in Morocco (as Reflected in this Calculator)

This calculator models certain energy regulations and common practices prevalent in Morocco. Users should be aware of these as they interpret the results:

**A. Non-Progressive Electricity Tariffs:**
- As detailed in Section 3, the calculator implements a non-progressive tiered billing system. This means your entire monthly electricity consumption is billed at the single rate corresponding to the highest consumption tier you reach. This is a common way tariffs are structured by ONEE (Office National de l'Electricité et de l'Eau Potable) for residential consumers, though specifics can vary and users should always check their actual bills and local utility information.

**B. Solar Self-Consumption (Auto-consommation):**
- The calculator operates on a strict self-consumption model for solar PV systems (see Section 4.C). This implies:
    - Energy produced by your solar panels first serves your own immediate electricity needs.
    - Any excess solar energy generated beyond your instantaneous consumption is assumed to provide no financial credit or compensation from the utility grid in this calculator's model.
- This approach is often relevant for smaller residential systems in Morocco where net-metering (selling excess power back to the grid) might be complex, not available, or not financially attractive due to low feed-in tariffs or regulatory hurdles for small producers. Law No. 13-09 on renewable energies and its implementing decrees provide the framework for connecting renewable energy projects, including those for self-consumption, but the specifics of remuneration for surplus energy can vary.

**C. Optimal Panel Sizing:**
- The "optimal panel" suggestion provided by the calculator is based on maximizing the Return on Investment (ROI) *under the self-consumption model described above*. It prioritizes systems that pay for themselves quickly by offsetting the user's own consumption, rather than potentially larger systems that might rely on selling excess power.

**Disclaimer:**

The information regarding regulations and tariff structures modeled in this calculator is based on the current understanding and implementation within the tool's code (`utils/calculator.ts` and `constants.ts`). While it aims to reflect common scenarios in Morocco, electricity tariffs, solar energy policies, and related regulations can change.

**Users are strongly advised to:**
- **Consult their actual electricity bills** to understand their specific tariff structure.
- **Refer to official sources** such as the Office National de l'Electricité et de l'Eau Potable (ONEE), the Moroccan Agency for Energy Efficiency (AMEE), and the Ministry of Energy Transition and Sustainable Development for the most current, detailed, and legally binding information on electricity pricing, solar self-consumption laws, net-metering possibilities, and any available incentives or support schemes.
- **Consult with qualified solar installers** who are knowledgeable about local regulations and grid connection procedures.

This calculator is an estimation tool and should not be the sole basis for making significant financial or investment decisions.
