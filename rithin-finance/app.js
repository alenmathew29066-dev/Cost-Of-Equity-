/**
 * RITHIN FINANCE — Bundled Application Script
 * Combines CalculatorEngine, ChartRenderer, QuizEngine, UIController, and RithinFinanceApp
 * Works 100% offline and supports both http:// server and direct file:/// opening in all browsers.
 */

(function() {
  'use strict';

  /* ========================================================================
     1. CALCULATOR ENGINE
     ======================================================================== */
  const CalculatorEngine = {
    formatNumber(val, decimals = 2) {
      if (val === null || val === undefined || isNaN(val)) return '0.00';
      return Number(val).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    },

    round2(val) {
      return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
    },

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
        inputs: { dividend: div, price: price, currencySymbol },
        formula: 'Ke = (D / P) × 100',
        variables: [
          { symbol: 'D', name: 'Dividend per Share', value: `${currencySymbol}${this.formatNumber(div)}` },
          { symbol: 'P', name: 'Market Price per Share', value: `${currencySymbol}${this.formatNumber(price)}` }
        ],
        steps: [
          { label: 'Step 1: Identify Formula', expression: 'Ke = (Dividend per Share / Market Price per Share) × 100' },
          { label: 'Step 2: Numerical Substitution', expression: `Ke = (${currencySymbol}${this.formatNumber(div)} / ${currencySymbol}${this.formatNumber(price)}) × 100` },
          { label: 'Step 3: Calculate Dividend Ratio', expression: `${div} / ${price} = ${(div / price).toFixed(6)}` },
          { label: 'Step 4: Multiply by 100 for Percentage', expression: `${(div / price).toFixed(6)} × 100 = ${this.formatNumber(keRounded, 2)}%` }
        ],
        summary: `At a dividend of ${currencySymbol}${this.formatNumber(div)} on a market price of ${currencySymbol}${this.formatNumber(price)}, the Cost of Equity (Ke) is ${this.formatNumber(keRounded, 2)}%.`
      };
    },

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
        inputs: { d0: isD1Provided ? null : divInput, d1: d1Rounded, growthRate: growth, price: price, isD1Provided, currencySymbol },
        formula: 'Ke = (D1 / P0) + g',
        subFormula: isD1Provided ? null : 'D1 = D0 × (1 + g)',
        variables: [
          { symbol: isD1Provided ? 'D1' : 'D0', name: isD1Provided ? 'Expected Dividend per Share' : 'Current Dividend per Share', value: `${currencySymbol}${this.formatNumber(divInput)}` },
          { symbol: 'D1', name: 'Expected Next Year Dividend', value: `${currencySymbol}${this.formatNumber(d1Rounded)}` },
          { symbol: 'g', name: 'Annual Dividend Growth Rate', value: `${this.formatNumber(growth)}%` },
          { symbol: 'P0', name: 'Current Market Price per Share', value: `${currencySymbol}${this.formatNumber(price)}` }
        ],
        breakdown: { dividendYieldPct: this.round2(divYieldPct), growthRatePct: this.round2(growth) },
        steps,
        summary: `With an expected dividend of ${currencySymbol}${this.formatNumber(d1Rounded, 2)} and a growth rate of ${this.formatNumber(growth)}%, the Cost of Equity is ${this.formatNumber(keRounded, 2)}% (${this.formatNumber(divYieldPct, 2)}% yield + ${this.formatNumber(growth, 2)}% growth).`
      };
    },

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
        inputs: { eps: eps, price: price, currencySymbol },
        formula: 'Ke = (E / P) × 100',
        variables: [
          { symbol: 'E', name: 'Earnings per Share (EPS)', value: `${currencySymbol}${this.formatNumber(eps)}` },
          { symbol: 'P', name: 'Market Price per Share', value: `${currencySymbol}${this.formatNumber(price)}` }
        ],
        steps: [
          { label: 'Step 1: Identify Formula', expression: 'Ke = (Earnings per Share / Market Price per Share) × 100' },
          { label: 'Step 2: Numerical Substitution', expression: `Ke = (${currencySymbol}${this.formatNumber(eps)} / ${currencySymbol}${this.formatNumber(price)}) × 100` },
          { label: 'Step 3: Calculate Earnings Yield Ratio', expression: `${eps} / ${price} = ${(eps / price).toFixed(6)}` },
          { label: 'Step 4: Express as Percentage', expression: `${(eps / price).toFixed(6)} × 100 = ${this.formatNumber(keRounded, 2)}%` }
        ],
        summary: `With EPS of ${currencySymbol}${this.formatNumber(eps)} and market price of ${currencySymbol}${this.formatNumber(price)}, the earnings yield (Ke) is ${this.formatNumber(keRounded, 2)}% (equivalent to a P/E multiple of ${peRatio ? peRatio + 'x' : 'N/A'}).`
      };
    },

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

      return {
        success: true,
        methodName: 'Realised Yield Method',
        ke: yieldRounded,
        keFormatted: `${this.formatNumber(yieldRounded, 2)}%`,
        inputs: { p0: startPrice, p1: endPrice, dividend: dividend, currencySymbol },
        formula: 'Realised Yield = [(D + (P1 - P0)) / P0] × 100',
        variables: [
          { symbol: 'D', name: 'Dividend Received During Period', value: `${currencySymbol}${this.formatNumber(dividend)}` },
          { symbol: 'P0', name: 'Beginning Market Price', value: `${currencySymbol}${this.formatNumber(startPrice)}` },
          { symbol: 'P1', name: 'Ending Market Price', value: `${currencySymbol}${this.formatNumber(endPrice)}` },
          { symbol: 'P1 - P0', name: 'Capital Gain / Loss', value: `${currencySymbol}${this.formatNumber(capitalGain)}` }
        ],
        steps: [
          { label: 'Step 1: Compute Capital Gain / Loss (P1 - P0)', expression: `Capital Gain = ${currencySymbol}${this.formatNumber(endPrice)} - ${currencySymbol}${this.formatNumber(startPrice)} = ${currencySymbol}${this.formatNumber(capitalGain)}` },
          { label: 'Step 2: Compute Total Investor Cash Return [D + (P1 - P0)]', expression: `Total Cash Return = ${currencySymbol}${this.formatNumber(dividend)} + (${currencySymbol}${this.formatNumber(capitalGain)}) = ${currencySymbol}${this.formatNumber(totalReturn)}` },
          { label: 'Step 3: Divide Total Return by Initial Price (P0)', expression: `Return Ratio = ${currencySymbol}${this.formatNumber(totalReturn)} / ${currencySymbol}${this.formatNumber(startPrice)} = ${(totalReturn / startPrice).toFixed(6)}` },
          { label: 'Step 4: Multiply by 100 for Realised Yield %', expression: `Realised Yield = ${(totalReturn / startPrice).toFixed(6)} × 100 = ${this.formatNumber(yieldRounded, 2)}%` }
        ],
        summary: `The total historical return is ${currencySymbol}${this.formatNumber(totalReturn)} (${currencySymbol}${this.formatNumber(dividend)} dividend + ${currencySymbol}${this.formatNumber(capitalGain)} capital gain), yielding an effective return of ${this.formatNumber(yieldRounded, 2)}% on beginning investment.`
      };
    },

    calculateAllMethods(data, currencySymbol = '₹') {
      const res1 = this.calculateDividendPrice(data.dividend, data.currentPrice, currencySymbol);
      const res2 = this.calculateDividendGrowth(data.dividend, data.growthRate, data.currentPrice, false, currencySymbol);
      const res3 = this.calculateEarningsPrice(data.eps, data.currentPrice, currencySymbol);
      const res4 = this.calculateRealisedYield(data.beginningPrice || data.currentPrice, data.endingPrice, data.dividend, currencySymbol);

      return { method1: res1, method2: res2, method3: res3, method4: res4 };
    }
  };

  /* ========================================================================
     2. CHART RENDERER
     ======================================================================== */
  const ChartRenderer = {
    chartInstance: null,

    render(canvasId, fallbackId, data) {
      const canvas = document.getElementById(canvasId);
      const fallbackContainer = document.getElementById(fallbackId);

      if (window.Chart && canvas) {
        try {
          if (fallbackContainer) fallbackContainer.style.display = 'none';
          canvas.style.display = 'block';
          this.renderChartJs(canvas, data);
          return;
        } catch (err) {
          console.warn('Chart.js rendering failed, falling back to SVG/HTML renderer:', err);
        }
      }

      if (canvas) canvas.style.display = 'none';
      if (fallbackContainer) {
        fallbackContainer.style.display = 'flex';
        this.renderFallbackBars(fallbackContainer, data);
      }
    },

    renderChartJs(canvas, data) {
      const ctx = canvas.getContext('2d');
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const labels = data.map(item => item.name);
      const values = data.map(item => item.value);
      const colors = data.map(item => item.color || '#6366F1');

      this.chartInstance = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cost of Equity (%)',
            data: values,
            backgroundColor: colors.map(c => c + 'CC'),
            borderColor: colors,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 42,
            maxBarThickness: 56
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0F172A',
              titleColor: '#F8FAFC',
              bodyColor: '#38BDF8',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 12,
              titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
              bodyFont: { family: 'JetBrains Mono', size: 14, weight: '600' },
              displayColors: false,
              callbacks: {
                label: (context) => `Cost of Equity: ${context.parsed.y.toFixed(2)}%`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false, drawBorder: false },
              ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
              ticks: {
                color: '#64748B',
                font: { family: 'JetBrains Mono', size: 11 },
                callback: (val) => val + '%'
              }
            }
          }
        }
      });
    },

    renderFallbackBars(container, data) {
      container.innerHTML = '';
      const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 20);

      data.forEach(item => {
        const row = document.createElement('div');
        row.className = 'bar-row';
        const widthPct = Math.min(Math.max((Math.abs(item.value) / maxVal) * 100, 4), 100);

        row.innerHTML = `
          <div class="bar-method-name">${item.name}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: 0%; background: ${item.color || '#6366F1'};" data-target-width="${widthPct}%">
              ${item.value.toFixed(2)}%
            </div>
          </div>
        `;
        container.appendChild(row);
      });

      setTimeout(() => {
        container.querySelectorAll('.bar-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-target-width');
        });
      }, 50);
    }
  };

  /* ========================================================================
     3. QUIZ ENGINE
     ======================================================================== */
  const QuizEngine = {
    questions: [
      {
        id: 1,
        question: "Which method assumes that the company pays a constant dividend and experiences zero dividend growth?",
        options: [
          "Dividend Yield + Growth Method",
          "Dividend Price Method",
          "Earnings Price Method",
          "Realised Yield Method"
        ],
        correctIndex: 1,
        explanation: "The Dividend Price Method (Ke = D / P × 100) assumes that dividends remain constant indefinitely with no growth (g = 0)."
      },
      {
        id: 2,
        question: "In the Gordon Growth Model (Ke = D1 / P0 + g), what does 'D1' represent?",
        options: [
          "Past year's dividend paid",
          "Expected dividend for the next period [D0 × (1 + g)]",
          "Total retained earnings per share",
          "Dividend after corporate tax"
        ],
        correctIndex: 1,
        explanation: "D1 is the expected next-period dividend. If the current dividend (D0) is given, D1 is calculated as D0 × (1 + g)."
      },
      {
        id: 3,
        question: "Why might the Earnings Price Method (Ke = E / P × 100) be preferred over the Dividend Price Method when evaluating growth firms?",
        options: [
          "Because growth firms often reinvest earnings instead of paying high dividends",
          "Because earnings are always equal to market price",
          "Because dividends are illegal for newly formed firms",
          "Because EPS has no tax implications"
        ],
        correctIndex: 0,
        explanation: "Growth companies frequently retain 70%–100% of their profits for capital expansion. The Earnings Price Method captures the full earning power attributable to equity holders, not just the distributed dividend."
      },
      {
        id: 4,
        question: "What distinguishes the Realised Yield Method from the other three Cost of Equity models?",
        options: [
          "It uses historical actual returns (past dividends + price changes) instead of forward-looking estimates",
          "It cannot be used for listed public companies",
          "It ignores capital appreciation completely",
          "It guarantees the exact future return of equity"
        ],
        correctIndex: 0,
        explanation: "The Realised Yield Method computes the actual return realised by an investor in the past: [D + (P1 - P0)] / P0 × 100, under the assumption that past returns mirror future shareholder expectations."
      },
      {
        id: 5,
        question: "When comparing the four methods on the same firm, why do the resulting Cost of Equity percentages often differ?",
        options: [
          "One method is always mathematically wrong",
          "Each method relies on distinct underlying assumptions (dividend payout, retention, growth, and historical performance)",
          "Calculators round to different decimal places",
          "Government regulations force them to differ"
        ],
        correctIndex: 1,
        explanation: "Each method captures different facets of equity valuation. Dividend Price assumes zero growth, Gordon assumes perpetual growth, Earnings Price assumes full earning entitlement, and Realised Yield reflects past market reality."
      }
    ],

    currentIndex: 0,
    score: 0,
    answered: false,

    init(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;
      this.currentIndex = 0;
      this.score = 0;
      this.answered = false;
      this.renderQuestion();
    },

    renderQuestion() {
      if (this.currentIndex >= this.questions.length) {
        this.renderScore();
        return;
      }

      const q = this.questions[this.currentIndex];
      this.answered = false;

      this.container.innerHTML = `
        <div class="quiz-header">
          <div style="font-weight: 700; color: #A5B4FC; font-size: 0.9rem;">
            QUESTION ${this.currentIndex + 1} OF ${this.questions.length}
          </div>
          <div class="quiz-progress-text">Score: ${this.score} / ${this.questions.length}</div>
        </div>

        <div class="quiz-question-box">
          <h3 class="quiz-question-title">${q.question}</h3>
          <div class="quiz-options-list">
            ${q.options.map((opt, idx) => `
              <button type="button" class="quiz-option-btn" data-index="${idx}">
                <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="quiz-feedback-box" id="quiz-feedback"></div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="quiz-skip-btn">Skip Question</button>
          <button type="button" class="btn btn-primary btn-sm" id="quiz-next-btn" style="display: none;">Next Question →</button>
        </div>
      `;

      const optionBtns = this.container.querySelectorAll('.quiz-option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedIdx = parseInt(btn.getAttribute('data-index'), 10);
          this.handleAnswer(selectedIdx);
        });
      });

      const nextBtn = this.container.querySelector('#quiz-next-btn');
      nextBtn.addEventListener('click', () => {
        this.currentIndex++;
        this.renderQuestion();
      });

      const skipBtn = this.container.querySelector('#quiz-skip-btn');
      skipBtn.addEventListener('click', () => {
        this.currentIndex++;
        this.renderQuestion();
      });
    },

    handleAnswer(selectedIdx) {
      if (this.answered) return;
      this.answered = true;

      const q = this.questions[this.currentIndex];
      const optionBtns = this.container.querySelectorAll('.quiz-option-btn');
      const feedbackBox = this.container.querySelector('#quiz-feedback');
      const nextBtn = this.container.querySelector('#quiz-next-btn');
      const skipBtn = this.container.querySelector('#quiz-skip-btn');

      optionBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.correctIndex) {
          btn.classList.add('correct');
        } else if (idx === selectedIdx) {
          btn.classList.add('incorrect');
        }
      });

      if (selectedIdx === q.correctIndex) {
        this.score++;
        feedbackBox.innerHTML = `
          <div style="color: #34D399; font-weight: 700; margin-bottom: 0.25rem;">✓ Correct!</div>
          <div>${q.explanation}</div>
        `;
        feedbackBox.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      } else {
        feedbackBox.innerHTML = `
          <div style="color: #F87171; font-weight: 700; margin-bottom: 0.25rem;">✗ Incorrect</div>
          <div>${q.explanation}</div>
        `;
        feedbackBox.style.borderColor = 'rgba(244, 63, 94, 0.4)';
      }

      feedbackBox.classList.add('visible');
      nextBtn.style.display = 'inline-flex';
      skipBtn.style.display = 'none';
    },

    renderScore() {
      const percentage = Math.round((this.score / this.questions.length) * 100);
      let feedbackTitle = "Great Job!";
      let feedbackBadge = "Finance Mastery";

      if (percentage === 100) {
        feedbackTitle = "Outstanding Mastery!";
        feedbackBadge = "Top Score: 100%";
      } else if (percentage >= 60) {
        feedbackTitle = "Well Done!";
        feedbackBadge = "Solid Understanding";
      } else {
        feedbackTitle = "Keep Practicing!";
        feedbackBadge = "Review Recommended";
      }

      this.container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <div class="hero-badge-pill" style="margin-bottom: 1rem;">${feedbackBadge}</div>
          <h3 style="font-size: 2rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.5rem;">${feedbackTitle}</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">You scored ${this.score} out of ${this.questions.length} (${percentage}%).</p>

          <div style="font-family: var(--font-mono); font-size: 3.5rem; font-weight: 800; color: #10B981; margin-bottom: 1.5rem;">
            ${percentage}%
          </div>

          <button type="button" class="btn btn-primary" id="quiz-restart-btn">
            Retake Quiz ↺
          </button>
        </div>
      `;

      this.container.querySelector('#quiz-restart-btn').addEventListener('click', () => {
        this.init('quiz-container');
      });
    }
  };

  /* ========================================================================
     4. UI CONTROLLER
     ======================================================================== */
  const UIController = {
    currencySymbol: '₹',

    init() {
      this.bindMethod1();
      this.bindMethod2();
      this.bindMethod3();
      this.bindMethod4();
      this.bindCompare();
      this.initToast();

      this.runMethod1();
      this.runMethod2();
      this.runMethod3();
      this.runMethod4();
      this.runCompare();
    },

    setCurrency(symbol) {
      this.currencySymbol = symbol;
      document.querySelectorAll('.curr-sym').forEach(el => el.textContent = symbol);
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

      const heroValEl = container.querySelector(`#${containerId}-hero-val`);
      this.animateCounter(heroValEl, result.ke);

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

      const recalcBtn = container.querySelector(`#${containerId}-recalc-btn`);
      recalcBtn.addEventListener('click', () => {
        const firstInput = container.closest('.calculator-layout')?.querySelector('input');
        if (firstInput) firstInput.focus();
      });

      const compareBtn = container.querySelector(`#${containerId}-compare-btn`);
      compareBtn.addEventListener('click', () => {
        window.navigateToTab('compare');
      });
    },

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
        if (divInp) divInp.value = '14';
        if (priceInp) priceInp.value = '200';
        if (growthInp) growthInp.value = '4';
        if (epsInp) epsInp.value = '16';
        if (p1Inp) p1Inp.value = '218';
        this.showToast('Loaded Scenario: Mature FMCG Blue-Chip');
      } else if (scenario === 'tech') {
        if (divInp) divInp.value = '4';
        if (priceInp) priceInp.value = '150';
        if (growthInp) growthInp.value = '9';
        if (epsInp) epsInp.value = '15';
        if (p1Inp) p1Inp.value = '180';
        this.showToast('Loaded Scenario: High-Growth Technology Firm');
      } else {
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

      const c1Val = document.getElementById('cmp-card-1-val');
      const c2Val = document.getElementById('cmp-card-2-val');
      const c3Val = document.getElementById('cmp-card-3-val');
      const c4Val = document.getElementById('cmp-card-4-val');

      if (c1Val && results.method1.success) c1Val.textContent = `${results.method1.ke.toFixed(2)}%`;
      if (c2Val && results.method2.success) c2Val.textContent = `${results.method2.ke.toFixed(2)}%`;
      if (c3Val && results.method3.success) c3Val.textContent = `${results.method3.ke.toFixed(2)}%`;
      if (c4Val && results.method4.success) c4Val.textContent = `${results.method4.ke.toFixed(2)}%`;

      const chartData = [
        { name: 'Dividend Price', value: results.method1.success ? results.method1.ke : 0, color: '#38BDF8' },
        { name: 'Dividend + Growth', value: results.method2.success ? results.method2.ke : 0, color: '#10B981' },
        { name: 'Earnings Price', value: results.method3.success ? results.method3.ke : 0, color: '#F59E0B' },
        { name: 'Realised Yield', value: results.method4.success ? results.method4.ke : 0, color: '#A855F7' }
      ];

      ChartRenderer.render('compare-chart-canvas', 'compare-chart-fallback', chartData);
    }
  };

  /* ========================================================================
     5. APP CONTROLLER & ROUTER
     ======================================================================== */
  class RithinFinanceApp {
    constructor() {
      this.currentTab = 'dashboard';
      this.currentMethod = 'm1';
    }

    init() {
      this.setupNavigation();
      this.setupCurrencyToggle();
      this.setupMethodSubNav();
      UIController.init();
      QuizEngine.init('quiz-container');

      const initialHash = window.location.hash.replace('#', '');
      if (initialHash) {
        this.navigateTo(initialHash);
      } else {
        this.navigateTo('dashboard');
      }

      window.navigateToTab = (tabId, methodId = null) => {
        this.navigateTo(tabId, methodId);
      };

      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== this.currentTab) {
          this.navigateTo(hash, null, false);
        }
      });
    }

    setupNavigation() {
      const navButtons = document.querySelectorAll('.nav-tab-btn');
      navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const tabId = btn.getAttribute('data-tab');
          this.navigateTo(tabId);
        });
      });
    }

    setupMethodSubNav() {
      const methodPills = document.querySelectorAll('.calc-pill-btn');
      methodPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const methodKey = pill.getAttribute('data-method');
          this.switchMethod(methodKey);
        });
      });
    }

    setupCurrencyToggle() {
      const currencySelect = document.getElementById('currency-select');
      if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
          const symbol = e.target.value;
          UIController.setCurrency(symbol);
          UIController.showToast(`Currency set to ${symbol}`);
        });
      }
    }

    switchMethod(methodKey) {
      this.currentMethod = methodKey;

      document.querySelectorAll('.calc-pill-btn').forEach(pill => {
        if (pill.getAttribute('data-method') === methodKey) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });

      document.querySelectorAll('.method-calc-panel').forEach(panel => {
        if (panel.id === `panel-${methodKey}`) {
          panel.style.display = 'grid';
        } else {
          panel.style.display = 'none';
        }
      });

      if (methodKey === 'm1') UIController.runMethod1();
      if (methodKey === 'm2') UIController.runMethod2();
      if (methodKey === 'm3') UIController.runMethod3();
      if (methodKey === 'm4') UIController.runMethod4();
    }

    navigateTo(tabId, methodId = null, updateHash = true) {
      if (tabId.startsWith('method-') || tabId.startsWith('m')) {
        const parsedMethod = tabId.replace('method-', '').replace('methods-', '');
        const mapped = parsedMethod.length === 1 ? `m${parsedMethod}` : parsedMethod;
        this.currentTab = 'methods';
        this.currentMethod = mapped;
      } else {
        this.currentTab = tabId;
        if (methodId) this.currentMethod = methodId;
      }

      if (updateHash) {
        window.location.hash = this.currentTab === 'methods' ? `methods-${this.currentMethod}` : this.currentTab;
      }

      document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === this.currentTab) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      document.querySelectorAll('.tab-view').forEach(view => {
        if (view.id === `view-${this.currentTab}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });

      if (this.currentTab === 'methods') {
        this.switchMethod(this.currentMethod);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new RithinFinanceApp();
      app.init();
    });
  } else {
    const app = new RithinFinanceApp();
    app.init();
  }
})();
