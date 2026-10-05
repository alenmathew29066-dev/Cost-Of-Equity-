/**
 * RITHIN FINANCE - Cost of Equity Calculator Engine
 * Standard mathematical implementation of the four Cost of Equity methods.
 * Formats results strictly to 2 decimal places with zero-division protection and friendly error reporting.
 */

export const CalculatorEngine = {
  /**
   * Helper: formats numbers cleanly to 2 decimal places with comma separation.
   */
  formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Helper: rounds number to 2 decimal places safely.
   */
  round2(val) {
    return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
  },

  /**
   * Method 1: Dividend Price Method
   * Formula: Ke = (D / P) * 100
   * @param {number} d - Dividend per share
   * @param {number} p - Market price per share
   */
  calculateDividendPrice(d, p, currencySymbol = '₹') {
    const div = parseFloat(d);
    const price = parseFloat(p);

    if (isNaN(div) || isNaN(price)) {
      return { success: false, error: 'Please enter valid numbers for both Dividend and Market Price.' };
    }
    if (price <= 0) {
      return { success: false, error: 'Market Price per Share (P) must be greater than zero.' };
    }
    if (div < 0) {
      return { success: false, error: 'Dividend per Share (D) cannot be negative.' };
    }

    const ke = (div / price) * 100;
    const keRounded = this.round2(ke);

    return {
      success: true,
      methodName: 'Dividend Price Method',
      ke: keRounded,
      keFormatted: `${this.formatNumber(keRounded, 2)}%`,
      inputs: {
        dividend: div,
        price: price,
        currencySymbol
      },
      formula: 'Ke = (D / P) × 100',
      variables: [
        { symbol: 'D', name: 'Dividend per Share', value: `${currencySymbol}${this.formatNumber(div)}` },
        { symbol: 'P', name: 'Market Price per Share', value: `${currencySymbol}${this.formatNumber(price)}` }
      ],
      steps: [
        {
          label: 'Step 1: Identify Formula',
          expression: 'Ke = (Dividend per Share / Market Price per Share) × 100'
        },
        {
          label: 'Step 2: Numerical Substitution',
          expression: `Ke = (${currencySymbol}${this.formatNumber(div)} / ${currencySymbol}${this.formatNumber(price)}) × 100`
        },
        {
          label: 'Step 3: Calculate Dividend Ratio',
          expression: `${div} / ${price} = ${(div / price).toFixed(6)}`
        },
        {
          label: 'Step 4: Multiply by 100 for Percentage',
          expression: `${(div / price).toFixed(6)} × 100 = ${this.formatNumber(keRounded, 2)}%`
        }
      ],
      summary: `At a dividend of ${currencySymbol}${this.formatNumber(div)} on a market price of ${currencySymbol}${this.formatNumber(price)}, the Cost of Equity (Ke) is ${this.formatNumber(keRounded, 2)}%.`
    };
  },

  /**
   * Method 2: Dividend Yield + Growth Method (Gordon Growth Model)
   * Formula: Ke = (D1 / P0) + g
   * Where D1 = D0 * (1 + g)
   * @param {number} d - Current Dividend (D0) or Expected Dividend (D1)
   * @param {number} gPct - Expected growth rate in percent (e.g. 5 for 5%)
   * @param {number} p0 - Current market price (P0)
   * @param {boolean} isD1Provided - Whether d is already expected dividend D1
   */
  calculateDividendGrowth(d, gPct, p0, isD1Provided = false, currencySymbol = '₹') {
    const divInput = parseFloat(d);
    const growth = parseFloat(gPct);
    const price = parseFloat(p0);

    if (isNaN(divInput) || isNaN(growth) || isNaN(price)) {
      return { success: false, error: 'Please enter valid numbers for Dividend, Growth Rate, and Market Price.' };
    }
    if (price <= 0) {
      return { success: false, error: 'Current Market Price (P0) must be greater than zero.' };
    }
    if (divInput < 0) {
      return { success: false, error: 'Dividend cannot be negative.' };
    }

    const gDec = growth / 100;
    const d1 = isD1Provided ? divInput : divInput * (1 + gDec);
    const divYieldPct = (d1 / price) * 100;
    const ke = divYieldPct + growth;
    const keRounded = this.round2(ke);
    const d1Rounded = this.round2(d1);

    const steps = [];

    if (!isD1Provided) {
      steps.push({
        label: 'Step 1: Calculate Expected Dividend (D1)',
        expression: `D1 = D0 × (1 + g) = ${currencySymbol}${this.formatNumber(divInput)} × (1 + ${growth}%) = ${currencySymbol}${this.formatNumber(divInput)} × ${(1 + gDec).toFixed(4)} = ${currencySymbol}${this.formatNumber(d1Rounded, 2)}`
      });
    } else {
      steps.push({
        label: 'Step 1: Expected Dividend (D1) Given',
        expression: `D1 = ${currencySymbol}${this.formatNumber(d1Rounded, 2)}`
      });
    }

    steps.push({
      label: 'Step 2: Calculate Dividend Yield Component (D1 / P0)',
      expression: `Dividend Yield = (${currencySymbol}${this.formatNumber(d1Rounded, 2)} / ${currencySymbol}${this.formatNumber(price)}) × 100 = ${this.formatNumber(divYieldPct, 2)}%`
    });

    steps.push({
      label: 'Step 3: Add Dividend Growth Rate (g)',
      expression: `Ke = Dividend Yield + Growth Rate = ${this.formatNumber(divYieldPct, 2)}% + ${this.formatNumber(growth, 2)}%`
    });

    steps.push({
      label: 'Step 4: Final Cost of Equity (Ke)',
      expression: `Ke = ${this.formatNumber(keRounded, 2)}%`
    });

    return {
      success: true,
      methodName: 'Dividend Yield + Growth Method',
      ke: keRounded,
      keFormatted: `${this.formatNumber(keRounded, 2)}%`,
      inputs: {
        d0: isD1Provided ? null : divInput,
        d1: d1Rounded,
        growthRate: growth,
        price: price,
        isD1Provided,
        currencySymbol
      },
      formula: 'Ke = (D1 / P0) + g',
      subFormula: isD1Provided ? null : 'D1 = D0 × (1 + g)',
      variables: [
        { symbol: isD1Provided ? 'D1' : 'D0', name: isD1Provided ? 'Expected Dividend per Share' : 'Current Dividend per Share', value: `${currencySymbol}${this.formatNumber(divInput)}` },
        { symbol: 'D1', name: 'Expected Next Year Dividend', value: `${currencySymbol}${this.formatNumber(d1Rounded)}` },
        { symbol: 'g', name: 'Annual Dividend Growth Rate', value: `${this.formatNumber(growth)}%` },
        { symbol: 'P0', name: 'Current Market Price per Share', value: `${currencySymbol}${this.formatNumber(price)}` }
      ],
      breakdown: {
        dividendYieldPct: this.round2(divYieldPct),
        growthRatePct: this.round2(growth)
      },
      steps,
      summary: `With an expected dividend of ${currencySymbol}${this.formatNumber(d1Rounded, 2)} and a growth rate of ${this.formatNumber(growth)}%, the Cost of Equity is ${this.formatNumber(keRounded, 2)}% (${this.formatNumber(divYieldPct, 2)}% yield + ${this.formatNumber(growth, 2)}% growth).`
    };
  },

  /**
   * Method 3: Earnings Price Method
   * Formula: Ke = (E / P) * 100
   * @param {number} e - Earnings per share (EPS)
   * @param {number} p - Market price per share
   */
  calculateEarningsPrice(e, p, currencySymbol = '₹') {
    const eps = parseFloat(e);
    const price = parseFloat(p);

    if (isNaN(eps) || isNaN(price)) {
      return { success: false, error: 'Please enter valid numbers for Earnings per Share (EPS) and Market Price.' };
    }
    if (price <= 0) {
      return { success: false, error: 'Market Price per Share (P) must be greater than zero.' };
    }

    const ke = (eps / price) * 100;
    const keRounded = this.round2(ke);
    const peRatio = eps > 0 ? this.round2(price / eps) : null;

    return {
      success: true,
      methodName: 'Earnings Price Method',
      ke: keRounded,
      keFormatted: `${this.formatNumber(keRounded, 2)}%`,
      inputs: {
        eps: eps,
        price: price,
        currencySymbol
      },
      formula: 'Ke = (E / P) × 100',
      variables: [
        { symbol: 'E', name: 'Earnings per Share (EPS)', value: `${currencySymbol}${this.formatNumber(eps)}` },
        { symbol: 'P', name: 'Market Price per Share', value: `${currencySymbol}${this.formatNumber(price)}` }
      ],
      extraMetrics: [
        { label: 'P/E Ratio', value: peRatio ? `${peRatio}x` : 'N/A' },
        { label: 'Earnings Yield', value: `${this.formatNumber(keRounded, 2)}%` }
      ],
      steps: [
        {
          label: 'Step 1: Identify Formula',
          expression: 'Ke = (Earnings per Share / Market Price per Share) × 100'
        },
        {
          label: 'Step 2: Numerical Substitution',
          expression: `Ke = (${currencySymbol}${this.formatNumber(eps)} / ${currencySymbol}${this.formatNumber(price)}) × 100`
        },
        {
          label: 'Step 3: Calculate Earnings Yield Ratio',
          expression: `${eps} / ${price} = ${(eps / price).toFixed(6)}`
        },
        {
          label: 'Step 4: Express as Percentage',
          expression: `${(eps / price).toFixed(6)} × 100 = ${this.formatNumber(keRounded, 2)}%`
        }
      ],
      summary: `With EPS of ${currencySymbol}${this.formatNumber(eps)} and market price of ${currencySymbol}${this.formatNumber(price)}, the earnings yield (Ke) is ${this.formatNumber(keRounded, 2)}% (equivalent to a P/E multiple of ${peRatio ? peRatio + 'x' : 'N/A'}).`
    };
  },

  /**
   * Method 4: Realised Yield Method
   * Formula: Realised Yield = [(D + (P1 - P0)) / P0] * 100
   * @param {number} p0 - Beginning market price
   * @param {number} p1 - Ending market price
   * @param {number} d - Dividend received during period
   */
  calculateRealisedYield(p0, p1, d, currencySymbol = '₹') {
    const startPrice = parseFloat(p0);
    const endPrice = parseFloat(p1);
    const dividend = parseFloat(d);

    if (isNaN(startPrice) || isNaN(endPrice) || isNaN(dividend)) {
      return { success: false, error: 'Please enter valid numbers for Beginning Price, Ending Price, and Dividend.' };
    }
    if (startPrice <= 0) {
      return { success: false, error: 'Beginning Market Price (P0) must be greater than zero.' };
    }
    if (dividend < 0) {
      return { success: false, error: 'Dividend received (D) cannot be negative.' };
    }

    const capitalGain = endPrice - startPrice;
    const totalReturn = dividend + capitalGain;
    const yieldPct = (totalReturn / startPrice) * 100;
    const yieldRounded = this.round2(yieldPct);
    const divYield = this.round2((dividend / startPrice) * 100);
    const capGainYield = this.round2((capitalGain / startPrice) * 100);

    return {
      success: true,
      methodName: 'Realised Yield Method',
      ke: yieldRounded,
      keFormatted: `${this.formatNumber(yieldRounded, 2)}%`,
      inputs: {
        p0: startPrice,
        p1: endPrice,
        dividend: dividend,
        currencySymbol
      },
      formula: 'Realised Yield = [(D + (P1 - P0)) / P0] × 100',
      variables: [
        { symbol: 'D', name: 'Dividend Received During Period', value: `${currencySymbol}${this.formatNumber(dividend)}` },
        { symbol: 'P0', name: 'Beginning Market Price', value: `${currencySymbol}${this.formatNumber(startPrice)}` },
        { symbol: 'P1', name: 'Ending Market Price', value: `${currencySymbol}${this.formatNumber(endPrice)}` },
        { symbol: 'P1 - P0', name: 'Capital Gain / Loss', value: `${currencySymbol}${this.formatNumber(capitalGain)}` }
      ],
      breakdown: {
        capitalGain: this.round2(capitalGain),
        totalReturn: this.round2(totalReturn),
        divYieldPct: divYield,
        capGainYieldPct: capGainYield
      },
      steps: [
        {
          label: 'Step 1: Compute Capital Gain / Loss (P1 - P0)',
          expression: `Capital Gain = ${currencySymbol}${this.formatNumber(endPrice)} - ${currencySymbol}${this.formatNumber(startPrice)} = ${currencySymbol}${this.formatNumber(capitalGain)}`
        },
        {
          label: 'Step 2: Compute Total Investor Cash Return [D + (P1 - P0)]',
          expression: `Total Cash Return = ${currencySymbol}${this.formatNumber(dividend)} + (${currencySymbol}${this.formatNumber(capitalGain)}) = ${currencySymbol}${this.formatNumber(totalReturn)}`
        },
        {
          label: 'Step 3: Divide Total Return by Initial Price (P0)',
          expression: `Return Ratio = ${currencySymbol}${this.formatNumber(totalReturn)} / ${currencySymbol}${this.formatNumber(startPrice)} = ${(totalReturn / startPrice).toFixed(6)}`
        },
        {
          label: 'Step 4: Multiply by 100 for Realised Yield %',
          expression: `Realised Yield = ${(totalReturn / startPrice).toFixed(6)} × 100 = ${this.formatNumber(yieldRounded, 2)}%`
        }
      ],
      summary: `The total historical return is ${currencySymbol}${this.formatNumber(totalReturn)} (${currencySymbol}${this.formatNumber(dividend)} dividend + ${currencySymbol}${this.formatNumber(capitalGain)} capital gain), yielding an effective return of ${this.formatNumber(yieldRounded, 2)}% on beginning investment.`
    };
  },

  /**
   * Run all 4 methods given a unified or flexible financial dataset.
   */
  calculateAllMethods(data, currencySymbol = '₹') {
    const res1 = this.calculateDividendPrice(data.dividend, data.currentPrice, currencySymbol);
    const res2 = this.calculateDividendGrowth(data.dividend, data.growthRate, data.currentPrice, false, currencySymbol);
    const res3 = this.calculateEarningsPrice(data.eps, data.currentPrice, currencySymbol);
    const res4 = this.calculateRealisedYield(data.beginningPrice || data.currentPrice, data.endingPrice, data.dividend, currencySymbol);

    return {
      method1: res1,
      method2: res2,
      method3: res3,
      method4: res4
    };
  }
};
