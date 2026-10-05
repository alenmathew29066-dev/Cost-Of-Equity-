/**
 * RITHIN FINANCE — Student Knowledge Check Quiz Module
 * Interactive 5-question quiz for B.Com/MBA finance students.
 */

export const QuizEngine = {
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

    // Attach listeners
    const optionBtns = this.container.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
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
