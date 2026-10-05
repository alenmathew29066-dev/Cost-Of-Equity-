/**
 * RITHIN FINANCE — UI Controller & Interaction Layer
 * Manages calculators, live updates, animations, step-by-step rendering, and comparison mode.
 */

import { CalculatorEngine } from './calculator.js';
import { ChartRenderer } from './chart.js';

export const UIController = {
  currencySymbol: '₹',

  init() {
    this.bindMethod1();
    this.bindMethod2();
    this.bindMethod3();
    this.bindMethod4();
    this.bindCompare();
    this.initToast();

    // Run initial default calculations so user sees live results immediately
    this.runMethod1();
    this.runMethod2();
    this.runMethod3();
    this.runMethod4();
    this.runCompare();
  },

  setCurrency(symbol) {
    this.currencySymbol = symbol;
    document.querySelectorAll('.curr-sym').forEach(el => el.textContent = symbol);
    // Re-run active calculations with new currency symbol
    this.runMethod1();
    this.runMethod2();
    this.runMethod3();
    this.runMethod4();
    this.runCompare();
  },

  showToast(message) {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  },

  initToast() {
    if (!document.getElementById('toast-notice')) {
      const toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
  },

  animateCounter(element, targetVal, duration = 600) {
    if (!element) return;
    element.classList.remove('popping');
    void element.offsetWidth;
    element.classList.add('popping');

    const startVal = parseFloat(element.getAttribute('data-current-val') || '0');
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;
      element.textContent = `${current.toFixed(2)}%`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `${targetVal.toFixed(2)}%`;
        element.setAttribute('data-current-val', targetVal.toString());
      }
    };

    requestAnimationFrame(update);
  },

  renderResultCard(containerId, result) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!result.success) {
      container.innerHTML = `
        <div class="calc-error-box visible">
          <span>⚠️</span>
          <span>${result.error}</span>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="result-header">
        <div>
          <div class="result-tag">Calculated Result</div>
          <div class="result-method-name">${result.methodName}</div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="${containerId}-copy-btn" title="Copy calculation summary">
          📋 Copy Summary
        </button>
      </div>

      <div class="result-hero-box">
        <div class="result-hero-label">COST OF EQUITY (Ke)</div>
        <div class="result-hero-value" id="${containerId}-hero-val" data-current-val="0">${result.keFormatted}</div>
        <div class="result-hero-sublabel">Expected rate of return required by equity shareholders</div>
      </div>

      <div class="breakdown-section-title">
        <span>🔢</span> Given Parameters
      </div>
      <div class="variables-grid">
        ${result.variables.map(v => `
          <div class="var-pill">
            <div class="var-symbol">${v.symbol}</div>
            <div class="var-name">${v.name}</div>
            <div class="var-val">${v.value}</div>
          </div>
        `).join('')}
      </div>

      <div class="breakdown-section-title">
        <span>📐</span> Step-by-Step Mathematical Substitution
      </div>
      <div class="steps-list">
        ${result.steps.map(s => `
          <div class="step-item">
            <div class="step-label">${s.label}</div>
            <div class="step-expr">${s.expression}</div>
          </div>
        `).join('')}
      </div>

      <div style="font-size: 0.825rem; color: var(--text-secondary); background: var(--bg-dark-900); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); margin-bottom: 1.5rem;">
        💡 <strong>Interpretation:</strong> ${result.summary}
      </div>

      <div class="result-actions">
        <button type="button" class="btn btn-secondary btn-sm" id="${containerId}-recalc-btn">
          ↺ Calculate Again
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="${containerId}-reset-btn">
          ✕ Reset
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="${containerId}-compare-btn">
          📊 Compare All 4 Methods →
        </button>
      </div>
    `;

    // Animate large counter
    const heroValEl = container.querySelector(`#${containerId}-hero-val`);
    this.animateCounter(heroValEl, result.ke);

    // Copy Summary button
    const copyBtn = container.querySelector(`#${containerId}-copy-btn`);
    copyBtn.addEventListener('click', () => {
      const summaryText = `[RITHIN FINANCE] ${result.methodName}\nResult: Ke = ${result.keFormatted}\nFormula: ${result.formula}\n\n` +
        result.steps.map(s => `${s.label}:\n  ${s.expression}`).join('\n') + `\n\nSummary: ${result.summary}`;
      navigator.clipboard.writeText(summaryText).then(() => {
        this.showToast('Calculation summary copied to clipboard!');
      }).catch(() => {
        this.showToast('Summary ready to copy!');
      });
    });

    // Recalculate focus
    const recalcBtn = container.querySelector(`#${containerId}-recalc-btn`);
    recalcBtn.addEventListener('click', () => {
      const firstInput = container.closest('.calculator-layout')?.querySelector('input');
      if (firstInput) firstInput.focus();
    });

    // Navigate to Compare tab
    const compareBtn = container.querySelector(`#${containerId}-compare-btn`);
    compareBtn.addEventListener('click', () => {
      window.navigateToTab('compare');
    });
  },

  /* ========================================================================
     Method 1: Dividend Price Method
     ======================================================================== */
  bindMethod1() {
    const dInput = document.getElementById('m1-dividend');
    const pInput = document.getElementById('m1-price');
    const calcBtn = document.getElementById('m1-calc-btn');
    const resetBtn = document.getElementById('m1-reset-btn');
    const exampleBtn = document.getElementById('m1-example-btn');

    const update = () => this.runMethod1();

    [dInput, pInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', update);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
      }
    });

    if (calcBtn) calcBtn.addEventListener('click', update);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (dInput) dInput.value = '';
        if (pInput) pInput.value = '';
        update();
        if (dInput) dInput.focus();
      });
    }

    if (exampleBtn) {
      exampleBtn.addEventListener('click', () => {
        if (dInput) dInput.value = '8';
        if (pInput) pInput.value = '100';
        update();
        this.showToast('Loaded textbook example: D = ₹8, P = ₹100');
      });
    }
  },

  runMethod1() {
    const d = document.getElementById('m1-dividend')?.value;
    const p = document.getElementById('m1-price')?.value;
    const errorBox = document.getElementById('m1-error-box');

    if (!d || !p) {
      if (errorBox) {
        errorBox.textContent = 'Please enter both Dividend per Share and Market Price.';
        errorBox.classList.add('visible');
      }
      return;
    }

    const result = CalculatorEngine.calculateDividendPrice(d, p, this.currencySymbol);
    if (!result.success) {
      if (errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.add('visible');
      }
      return;
    }

    if (errorBox) errorBox.classList.remove('visible');
    this.renderResultCard('m1-result-container', result);

    const cardResetBtn = document.getElementById('m1-result-container-reset-btn');
    if (cardResetBtn) {
      cardResetBtn.addEventListener('click', () => {
        document.getElementById('m1-reset-btn')?.click();
      });
    }
  },

  /* ========================================================================
     Method 2: Dividend Yield + Growth Method
     ======================================================================== */
  bindMethod2() {
    const dInput = document.getElementById('m2-dividend');
    const gInput = document.getElementById('m2-growth');
    const pInput = document.getElementById('m2-price');
    const dToggle = document.getElementById('m2-is-d1-toggle');
    const dLabel = document.getElementById('m2-div-label');
    const calcBtn = document.getElementById('m2-calc-btn');
    const resetBtn = document.getElementById('m2-reset-btn');
    const exampleBtn = document.getElementById('m2-example-btn');

    const update = () => this.runMethod2();

    [dInput, gInput, pInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', update);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
      }
    });

    if (dToggle) {
      dToggle.addEventListener('change', () => {
        if (dLabel) {
          dLabel.textContent = dToggle.checked ? 'Expected Next Year Dividend (D1)' : 'Current Dividend per Share (D0)';
        }
        update();
      });
    }

    if (calcBtn) calcBtn.addEventListener('click', update);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (dInput) dInput.value = '';
        if (gInput) gInput.value = '';
        if (pInput) pInput.value = '';
        if (dToggle) dToggle.checked = false;
        if (dLabel) dLabel.textContent = 'Current Dividend per Share (D0)';
        update();
        if (dInput) dInput.focus();
      });
    }

    if (exampleBtn) {
      exampleBtn.addEventListener('click', () => {
        if (dInput) dInput.value = '8';
        if (gInput) gInput.value = '5';
        if (pInput) pInput.value = '100';
        if (dToggle) dToggle.checked = false;
        if (dLabel) dLabel.textContent = 'Current Dividend per Share (D0)';
        update();
        this.showToast('Loaded textbook example: D0 = ₹8, g = 5%, P0 = ₹100');
      });
    }
  },

  runMethod2() {
    const d = document.getElementById('m2-dividend')?.value;
    const g = document.getElementById('m2-growth')?.value;
    const p = document.getElementById('m2-price')?.value;
    const isD1 = document.getElementById('m2-is-d1-toggle')?.checked || false;
    const errorBox = document.getElementById('m2-error-box');

    if (!d || !g || !p) {
      if (errorBox) {
        errorBox.textContent = 'Please enter Dividend, Growth Rate, and Market Price.';
        errorBox.classList.add('visible');
      }
      return;
    }

    const result = CalculatorEngine.calculateDividendGrowth(d, g, p, isD1, this.currencySymbol);
    if (!result.success) {
      if (errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.add('visible');
      }
      return;
    }

    if (errorBox) errorBox.classList.remove('visible');
    this.renderResultCard('m2-result-container', result);

    const cardResetBtn = document.getElementById('m2-result-container-reset-btn');
    if (cardResetBtn) {
      cardResetBtn.addEventListener('click', () => {
        document.getElementById('m2-reset-btn')?.click();
      });
    }
  },

  /* ========================================================================
     Method 3: Earnings Price Method
     ======================================================================== */
  bindMethod3() {
    const epsInput = document.getElementById('m3-eps');
    const pInput = document.getElementById('m3-price');
    const calcBtn = document.getElementById('m3-calc-btn');
    const resetBtn = document.getElementById('m3-reset-btn');
    const exampleBtn = document.getElementById('m3-example-btn');

    const update = () => this.runMethod3();

    [epsInput, pInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', update);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
      }
    });

    if (calcBtn) calcBtn.addEventListener('click', update);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (epsInput) epsInput.value = '';
        if (pInput) pInput.value = '';
        update();
        if (epsInput) epsInput.focus();
      });
    }

    if (exampleBtn) {
      exampleBtn.addEventListener('click', () => {
        if (epsInput) epsInput.value = '12';
        if (pInput) pInput.value = '120';
        update();
        this.showToast('Loaded textbook example: EPS = ₹12, P = ₹120');
      });
    }
  },

  runMethod3() {
    const eps = document.getElementById('m3-eps')?.value;
    const p = document.getElementById('m3-price')?.value;
    const errorBox = document.getElementById('m3-error-box');

    if (!eps || !p) {
      if (errorBox) {
        errorBox.textContent = 'Please enter Earnings per Share (EPS) and Market Price.';
        errorBox.classList.add('visible');
      }
      return;
    }

    const result = CalculatorEngine.calculateEarningsPrice(eps, p, this.currencySymbol);
    if (!result.success) {
      if (errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.add('visible');
      }
      return;
    }

    if (errorBox) errorBox.classList.remove('visible');
    this.renderResultCard('m3-result-container', result);

    const cardResetBtn = document.getElementById('m3-result-container-reset-btn');
    if (cardResetBtn) {
      cardResetBtn.addEventListener('click', () => {
        document.getElementById('m3-reset-btn')?.click();
      });
    }
  },

  /* ========================================================================
     Method 4: Realised Yield Method
     ======================================================================== */
  bindMethod4() {
    const p0Input = document.getElementById('m4-p0');
    const p1Input = document.getElementById('m4-p1');
    const dInput = document.getElementById('m4-dividend');
    const calcBtn = document.getElementById('m4-calc-btn');
    const resetBtn = document.getElementById('m4-reset-btn');
    const exampleBtn = document.getElementById('m4-example-btn');

    const update = () => this.runMethod4();

    [p0Input, p1Input, dInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', update);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
      }
    });

    if (calcBtn) calcBtn.addEventListener('click', update);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (p0Input) p0Input.value = '';
        if (p1Input) p1Input.value = '';
        if (dInput) dInput.value = '';
        update();
        if (p0Input) p0Input.focus();
      });
    }

    if (exampleBtn) {
      exampleBtn.addEventListener('click', () => {
        if (p0Input) p0Input.value = '100';
        if (p1Input) p1Input.value = '110';
        if (dInput) dInput.value = '5';
        update();
        this.showToast('Loaded textbook example: P0 = ₹100, P1 = ₹110, D = ₹5');
      });
    }
  },

  runMethod4() {
    const p0 = document.getElementById('m4-p0')?.value;
    const p1 = document.getElementById('m4-p1')?.value;
    const d = document.getElementById('m4-dividend')?.value;
    const errorBox = document.getElementById('m4-error-box');

    if (!p0 || !p1 || !d) {
      if (errorBox) {
        errorBox.textContent = 'Please enter Beginning Price, Ending Price, and Dividend Received.';
        errorBox.classList.add('visible');
      }
      return;
    }

    const result = CalculatorEngine.calculateRealisedYield(p0, p1, d, this.currencySymbol);
    if (!result.success) {
      if (errorBox) {
        errorBox.textContent = result.error;
        errorBox.classList.add('visible');
      }
      return;
    }

    if (errorBox) errorBox.classList.remove('visible');
    this.renderResultCard('m4-result-container', result);

    const cardResetBtn = document.getElementById('m4-result-container-reset-btn');
    if (cardResetBtn) {
      cardResetBtn.addEventListener('click', () => {
        document.getElementById('m4-reset-btn')?.click();
      });
    }
  },

  /* ========================================================================
     Compare Methods Dashboard
     ======================================================================== */
  bindCompare() {
    const divInp = document.getElementById('cmp-dividend');
    const priceInp = document.getElementById('cmp-price');
    const growthInp = document.getElementById('cmp-growth');
    const epsInp = document.getElementById('cmp-eps');
    const p1Inp = document.getElementById('cmp-p1');
    const calcBtn = document.getElementById('cmp-calc-btn');
    const resetBtn = document.getElementById('cmp-reset-btn');

    const update = () => this.runCompare();

    [divInp, priceInp, growthInp, epsInp, p1Inp].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', update);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') update(); });
      }
    });

    if (calcBtn) calcBtn.addEventListener('click', update);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (divInp) divInp.value = '8';
        if (priceInp) priceInp.value = '100';
        if (growthInp) growthInp.value = '5.4';
        if (epsInp) epsInp.value = '10';
        if (p1Inp) p1Inp.value = '115';
        update();
        this.showToast('Reset comparison scenario to standard benchmark.');
      });
    }

    // Scenario presets
    document.querySelectorAll('.cmp-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenario = btn.getAttribute('data-scenario');
        this.loadCompareScenario(scenario);
      });
    });
  },

  loadCompareScenario(scenario) {
    const divInp = document.getElementById('cmp-dividend');
    const priceInp = document.getElementById('cmp-price');
    const growthInp = document.getElementById('cmp-growth');
    const epsInp = document.getElementById('cmp-eps');
    const p1Inp = document.getElementById('cmp-p1');

    if (scenario === 'fmcg') {
      // High dividend, low growth
      if (divInp) divInp.value = '14';
      if (priceInp) priceInp.value = '200';
      if (growthInp) growthInp.value = '4';
      if (epsInp) epsInp.value = '16';
      if (p1Inp) p1Inp.value = '218';
      this.showToast('Loaded Scenario: Mature FMCG Blue-Chip');
    } else if (scenario === 'tech') {
      // Low dividend, high growth, high EPS reinvested
      if (divInp) divInp.value = '4';
      if (priceInp) priceInp.value = '150';
      if (growthInp) growthInp.value = '9';
      if (epsInp) epsInp.value = '15';
      if (p1Inp) p1Inp.value = '180';
      this.showToast('Loaded Scenario: High-Growth Technology Firm');
    } else {
      // Default prompt textbook figures
      if (divInp) divInp.value = '8';
      if (priceInp) priceInp.value = '100';
      if (growthInp) growthInp.value = '5';
      if (epsInp) epsInp.value = '10';
      if (p1Inp) p1Inp.value = '110';
      this.showToast('Loaded Scenario: Textbook Benchmark');
    }

    this.runCompare();
  },

  runCompare() {
    const div = parseFloat(document.getElementById('cmp-dividend')?.value || '8');
    const price = parseFloat(document.getElementById('cmp-price')?.value || '100');
    const growth = parseFloat(document.getElementById('cmp-growth')?.value || '5');
    const eps = parseFloat(document.getElementById('cmp-eps')?.value || '10');
    const p1 = parseFloat(document.getElementById('cmp-p1')?.value || '110');

    if (isNaN(price) || price <= 0) return;

    const data = {
      dividend: div,
      currentPrice: price,
      growthRate: growth,
      eps: eps,
      beginningPrice: price,
      endingPrice: p1
    };

    const results = CalculatorEngine.calculateAllMethods(data, this.currencySymbol);

    // Update the 4 cards
    const c1Val = document.getElementById('cmp-card-1-val');
    const c2Val = document.getElementById('cmp-card-2-val');
    const c3Val = document.getElementById('cmp-card-3-val');
    const c4Val = document.getElementById('cmp-card-4-val');

    if (c1Val && results.method1.success) {
      c1Val.textContent = `${results.method1.ke.toFixed(2)}%`;
    }
    if (c2Val && results.method2.success) {
      c2Val.textContent = `${results.method2.ke.toFixed(2)}%`;
    }
    if (c3Val && results.method3.success) {
      c3Val.textContent = `${results.method3.ke.toFixed(2)}%`;
    }
    if (c4Val && results.method4.success) {
      c4Val.textContent = `${results.method4.ke.toFixed(2)}%`;
    }

    // Chart dataset
    const chartData = [
      { name: 'Dividend Price', value: results.method1.success ? results.method1.ke : 0, color: '#38BDF8' },
      { name: 'Dividend + Growth', value: results.method2.success ? results.method2.ke : 0, color: '#10B981' },
      { name: 'Earnings Price', value: results.method3.success ? results.method3.ke : 0, color: '#F59E0B' },
      { name: 'Realised Yield', value: results.method4.success ? results.method4.ke : 0, color: '#A855F7' }
    ];

    ChartRenderer.render('compare-chart-canvas', 'compare-chart-fallback', chartData);
  }
};
