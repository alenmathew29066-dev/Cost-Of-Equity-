# 🏛️ RITHIN FINANCE

> **"Smart Finance. Simple Decisions."**  
> *A premium financial education web app designed for B.Com and MBA finance students.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Production](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)]()
[![Platform: Web](https://img.shields.io/badge/Platform-Web%20App-indigo.svg)]()

---

## 📌 About The Project

**RITHIN FINANCE** is an interactive **Cost of Equity Capital ($K_e$) Calculator** built specifically to bridge the gap between financial theory and practical calculation. It provides real-time mathematical transparency across the four standard methods taught in corporate financial management courses.

---

## 🧮 Four Core Calculation Methods

### 1. Dividend Price Method (Zero Growth)
$$K_e = \frac{D}{P} \times 100$$
- **When to use**: Mature, stable companies with 100% dividend payout and zero anticipated growth.
- **Example**: Dividend $D = ₹8$, Market Price $P = ₹100 \implies K_e = \mathbf{8.00\%}$.

### 2. Dividend Yield + Growth Method (Gordon Growth Model)
$$K_e = \left(\frac{D_1}{P_0}\right) + g \quad \text{where} \quad D_1 = D_0 \times (1 + g)$$
- **When to use**: Established corporations with a consistent policy of growing dividends.
- **Example**: Current Dividend $D_0 = ₹8$, Growth $g = 5\%$, Price $P_0 = ₹100 \implies D_1 = ₹8.40, K_e = \mathbf{13.40\%}$.

### 3. Earnings Price Method (Earnings Yield)
$$K_e = \frac{E}{P} \times 100$$
- **When to use**: Fast-expanding firms that retain a large percentage of profits for reinvestment.
- **Example**: $\text{EPS} = ₹12$, Price $P = ₹120 \implies K_e = \mathbf{10.00\%}$ ($P/E = 10\times$).

### 4. Realised Yield Method (Historical Ex-Post Return)
$$\text{Realised Yield} = \left[\frac{D + (P_1 - P_0)}{P_0}\right] \times 100$$
- **When to use**: Historical return analysis measuring past dividends and capital appreciation ($P_1 - P_0$).
- **Example**: $P_0 = ₹100, P_1 = ₹110, D = ₹5 \implies \text{Realised Yield} = \mathbf{15.00\%}$.

---

## ✨ Features & User Experience

- **Fintech Aesthetic**: Dark navy / charcoal palette (`#070B14`, `#0F172A`), electric indigo & emerald accents, glassmorphic cards, and soft ambient glows.
- **Motion Animation System**: Fluid staggered card reveals, floating background auras, and interactive hover light-sheens.
- **Dynamic Step-by-Step Substitution**: Shows given parameters, algebraic substitution, intermediate calculations, and final animated percentage counters.
- **Compare Methods Engine**: Cross-method benchmarking with interactive bar charts (Chart.js + pure SVG fallback) and neutral academic evaluation.
- **Educational Suite**: Student study guide, exam formula cheat-sheet, and an interactive 5-question multiple choice quiz with instant explanations.
- **Zero Dependencies**: Pure HTML5, CSS3, and modern JavaScript. Works 100% offline.
- **Multi-Currency Support**: Indian Rupee (`₹` default), US Dollar (`$`), Euro (`€`), British Pound (`£`).

---

## 🚀 Quick Start

### Option 1: Open Directly in Any Browser (Zero Server Required)
Simply double-click `index.html` or `rithin_finance_standalone.html` in any browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run via Local HTTP Server
```bash
# Using Python 3
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 3: Run the Verification Test Suite
```bash
python test_cost_of_equity.py
```

---

## 🌐 Deploy to GitHub Pages

To host this project for free on **GitHub Pages**:
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then click **Save**.
5. Your live app URL will be available at:  
   `https://<your-username>.github.io/<repo-name>/`

---

## 👥 Audience
Built for students, professors, and financial analysts in:
- Bachelor of Commerce (B.Com)
- Master of Business Administration (MBA - Finance)
- Chartered Accountancy (CA / CMA / CFA)

---

## 📄 License
Released under the [MIT License](LICENSE).
