"""
RITHIN FINANCE - Cost of Equity Calculator
Automated Mathematical Verification Test Suite

Tests all four standard financial methods for calculating the Cost of Equity (Ke):
1. Dividend Price Method: Ke = (D / P) * 100
2. Dividend Yield + Growth Method: Ke = (D1 / P0) + g
   where D1 = D0 * (1 + g)
3. Earnings Price Method: Ke = (E / P) * 100
4. Realised Yield Method: Realised Yield = [(D + (P1 - P0)) / P0] * 100
"""

import math
import sys

def round2(val):
    return round(val + 1e-15, 2)

def calculate_dividend_price(d, p):
    if p <= 0:
        raise ValueError("Market Price per Share (P) must be greater than zero.")
    if d < 0:
        raise ValueError("Dividend per Share (D) cannot be negative.")
    ke = (d / p) * 100.0
    return {
        "ke": round2(ke),
        "d": d,
        "p": p,
        "substitution": f"{d} / {p} * 100",
        "result_str": f"{round2(ke):.2f}%"
    }

def calculate_dividend_growth(d0, g_pct, p0, is_d1=False):
    if p0 <= 0:
        raise ValueError("Current Market Price (P0) must be greater than zero.")
    if d0 < 0:
        raise ValueError("Dividend cannot be negative.")
    
    g_dec = g_pct / 100.0
    if is_d1:
        d1 = d0
    else:
        d1 = d0 * (1.0 + g_dec)
    
    div_yield_dec = d1 / p0
    div_yield_pct = div_yield_dec * 100.0
    ke_pct = div_yield_pct + g_pct
    
    return {
        "ke": round2(ke_pct),
        "d0": d0,
        "d1": round2(d1),
        "g_pct": g_pct,
        "p0": p0,
        "dividend_yield_pct": round2(div_yield_pct),
        "growth_pct": round2(g_pct),
        "result_str": f"{round2(ke_pct):.2f}%"
    }

def calculate_earnings_price(e, p):
    if p <= 0:
        raise ValueError("Market Price per Share (P) must be greater than zero.")
    ke = (e / p) * 100.0
    pe_ratio = p / e if e > 0 else None
    return {
        "ke": round2(ke),
        "e": e,
        "p": p,
        "pe_ratio": round2(pe_ratio) if pe_ratio else "N/A",
        "substitution": f"{e} / {p} * 100",
        "result_str": f"{round2(ke):.2f}%"
    }

def calculate_realised_yield(p0, p1, d):
    if p0 <= 0:
        raise ValueError("Beginning Market Price (P0) must be greater than zero.")
    if d < 0:
        raise ValueError("Dividend received (D) cannot be negative.")
    
    capital_gain = p1 - p0
    total_return = d + capital_gain
    realised_yield = (total_return / p0) * 100.0
    
    return {
        "realised_yield": round2(realised_yield),
        "p0": p0,
        "p1": p1,
        "d": d,
        "capital_gain": round2(capital_gain),
        "total_return": round2(total_return),
        "dividend_yield": round2((d / p0) * 100.0),
        "capital_gain_yield": round2((capital_gain / p0) * 100.0),
        "result_str": f"{round2(realised_yield):.2f}%"
    }


def run_tests():
    passed = 0
    failed = 0

    print("==================================================")
    print("RITHIN FINANCE - Cost of Equity Test Suite")
    print("==================================================")

    # ----------------------------------------------------
    # TEST 1: Method 1 - Dividend Price Method
    # Example: Dividend = ₹8, Market Price = ₹100 => Ke = 8.00%
    # ----------------------------------------------------
    try:
        res = calculate_dividend_price(d=8, p=100)
        assert res["ke"] == 8.00, f"Expected 8.00%, got {res['ke']}"
        assert res["result_str"] == "8.00%"
        print("[PASS] Test 1: Dividend Price Method Example (D=8, P=100 -> 8.00%)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 1: {e}")
        failed += 1

    # ----------------------------------------------------
    # TEST 2: Method 2 - Dividend Yield + Growth Method
    # Example: D0 = ₹8, Growth = 5%, Market Price = ₹100
    # D1 = 8 * 1.05 = 8.40
    # Ke = (8.40 / 100) + 0.05 = 0.084 + 0.05 = 13.40%
    # ----------------------------------------------------
    try:
        res = calculate_dividend_growth(d0=8, g_pct=5, p0=100)
        assert res["d1"] == 8.40, f"Expected D1=8.40, got {res['d1']}"
        assert res["ke"] == 13.40, f"Expected 13.40%, got {res['ke']}"
        assert res["result_str"] == "13.40%"
        print("[PASS] Test 2: Dividend Yield + Growth Method Example (D0=8, g=5%, P0=100 -> 13.40%)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 2: {e}")
        failed += 1

    # ----------------------------------------------------
    # TEST 3: Method 3 - Earnings Price Method
    # Example: EPS = ₹12, Market Price = ₹120 => Ke = 10.00%
    # ----------------------------------------------------
    try:
        res = calculate_earnings_price(e=12, p=120)
        assert res["ke"] == 10.00, f"Expected 10.00%, got {res['ke']}"
        assert res["result_str"] == "10.00%"
        print("[PASS] Test 3: Earnings Price Method Example (E=12, P=120 -> 10.00%)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 3: {e}")
        failed += 1

    # ----------------------------------------------------
    # TEST 4: Method 4 - Realised Yield Method
    # Example: Beginning Price = ₹100, Ending Price = ₹110, Dividend = ₹5
    # Realised Yield = [5 + (110 - 100)] / 100 * 100 = 15.00%
    # ----------------------------------------------------
    try:
        res = calculate_realised_yield(p0=100, p1=110, d=5)
        assert res["capital_gain"] == 10.00
        assert res["total_return"] == 15.00
        assert res["realised_yield"] == 15.00, f"Expected 15.00%, got {res['realised_yield']}"
        assert res["result_str"] == "15.00%"
        print("[PASS] Test 4: Realised Yield Method Example (P0=100, P1=110, D=5 -> 15.00%)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 4: {e}")
        failed += 1

    # ----------------------------------------------------
    # TEST 5: Boundary & Edge Cases
    # - Negative Price rejection
    # - Capital Loss in Realised Yield (P1 < P0)
    # - Zero growth rate in Gordon model
    # ----------------------------------------------------
    try:
        # P = 0 must raise error
        try:
            calculate_dividend_price(8, 0)
            assert False, "Should have raised ValueError on P=0"
        except ValueError:
            pass

        # Capital loss: P0=100, P1=90, D=5 => Total return = -5 => Realised Yield = -5.00%
        res_loss = calculate_realised_yield(p0=100, p1=90, d=5)
        assert res_loss["realised_yield"] == -5.00
        assert res_loss["capital_gain"] == -10.00
        assert res_loss["total_return"] == -5.00

        # Zero growth: D0=10, g=0%, P0=200 => Ke = 5.00%
        res_zero_g = calculate_dividend_growth(d0=10, g_pct=0, p0=200)
        assert res_zero_g["ke"] == 5.00
        assert res_zero_g["d1"] == 10.00

        print("[PASS] Test 5: Boundary & Error Handling (P=0 rejection, Capital Loss, Zero Growth)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 5: {e}")
        failed += 1

    print("==================================================")
    print(f"Summary: {passed} passed, {failed} failed.")
    print("==================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
