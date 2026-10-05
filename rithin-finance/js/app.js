/**
 * RITHIN FINANCE — Application Entrypoint & Router
 * Manages tab switching, URL hash routing, currency selection, and initialization.
 */

import { UIController } from './ui.js';
import { QuizEngine } from './quiz.js';

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

    // Handle direct URL hash or default to dashboard
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      this.navigateTo(initialHash);
    } else {
      this.navigateTo('dashboard');
    }

    // Window global hook for buttons inside dynamically rendered components
    window.navigateToTab = (tabId, methodId = null) => {
      this.navigateTo(tabId, methodId);
    };

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== this.currentTab) {
        this.navigateTo(hash, null, false);
      }
    });

    console.log('RITHIN FINANCE Application Initialized Successfully.');
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

    // Update subnav pills
    document.querySelectorAll('.calc-pill-btn').forEach(pill => {
      if (pill.getAttribute('data-method') === methodKey) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update method sections
    document.querySelectorAll('.method-calc-panel').forEach(panel => {
      if (panel.id === `panel-${methodKey}`) {
        panel.style.display = 'grid';
      } else {
        panel.style.display = 'none';
      }
    });

    // Run calculation on switch
    if (methodKey === 'm1') UIController.runMethod1();
    if (methodKey === 'm2') UIController.runMethod2();
    if (methodKey === 'm3') UIController.runMethod3();
    if (methodKey === 'm4') UIController.runMethod4();
  }

  navigateTo(tabId, methodId = null, updateHash = true) {
    // Check if target is a specific method (e.g. 'methods-m1' or 'method-1' or 'm1')
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

    // Update active nav button
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === this.currentTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Switch visible tab view
    document.querySelectorAll('.tab-view').forEach(view => {
      if (view.id === `view-${this.currentTab}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // If on methods view, activate the correct sub-method
    if (this.currentTab === 'methods') {
      this.switchMethod(this.currentMethod);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new RithinFinanceApp();
  app.init();
});
