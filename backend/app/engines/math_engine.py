"""
Core mathematical computation engine powered by SymPy.
All calculations are performed here — AI is never used for computation.
"""
import re
import traceback
from typing import Any, Optional, List, Tuple

import numpy as np
import sympy as sp
from sympy import (
    symbols, sympify, latex, simplify, expand, factor, solve,
    diff, integrate, limit, oo, series,
    laplace_transform,
    Matrix, eye, zeros, ones,
    sin, cos, tan, asin, acos, atan,
    sinh, cosh, tanh,
    exp, log, sqrt, Abs,
    pi, E, I,
    Rational, Float, Integer,
    Symbol, Function,
    factorint, gcd, lcm, isprime, nextprime,
    Sum, Product, Piecewise,
    FiniteSet, Interval,
    solveset, linsolve, nonlinsolve,
    det, trace,
    Eq, Ne, Lt, Le, Gt, Ge,
    And, Or, Not,
    N, nsimplify, radsimp, cancel, together, apart,
    poly, Poly,
    divisors, totient,
    erf, erfc, gamma, beta, zeta,
    besseli, besselj, besselk, bessely,
    conjugate,
    arg,
)
import sympy as _sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)
from sympy.stats import (
    Normal, Binomial, Poisson, Exponential,
    E as Expectation, variance, std,
    P, density, cdf,
)

import scipy.stats as scipy_stats

TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)

CONSTANTS = {
    "pi": pi,
    "e": E,
    "i": I,
    "inf": oo,
    "infinity": oo,
    "oo": oo,
}

PHYSICS_CONSTANTS = {
    "c": 2.998e8,        # speed of light (m/s)
    "h": 6.626e-34,      # Planck constant
    "hbar": 1.055e-34,   # reduced Planck
    "k_B": 1.381e-23,    # Boltzmann constant
    "G": 6.674e-11,      # gravitational constant
    "e_charge": 1.602e-19,  # elementary charge
    "m_e": 9.109e-31,    # electron mass
    "m_p": 1.673e-27,    # proton mass
    "epsilon_0": 8.854e-12,  # vacuum permittivity
    "mu_0": 1.257e-6,    # vacuum permeability
    "N_A": 6.022e23,     # Avogadro's number
    "R": 8.314,          # gas constant
    "sigma": 5.671e-8,   # Stefan-Boltzmann
    "alpha": 7.297e-3,   # fine-structure constant
}


def safe_parse(expr_str: str, local_vars: dict = None) -> Any:
    """Parse a string expression safely into a SymPy expression."""
    expr_str = expr_str.strip()
    # Normalise common user syntax
    expr_str = expr_str.replace("^", "**")
    expr_str = re.sub(r"\bpi\b", "pi", expr_str, flags=re.IGNORECASE)
    expr_str = re.sub(r"\be\b", "E", expr_str)
    expr_str = expr_str.replace("√", "sqrt")
    expr_str = expr_str.replace("∞", "oo")
    expr_str = expr_str.replace("×", "*")
    expr_str = expr_str.replace("÷", "/")
    expr_str = re.sub(r"(\d)\s+([a-zA-Z])", r"\1*\2", expr_str)

    lv = {**{str(s): s for s in symbols("x y z t n m a b c k")}, **CONSTANTS}
    if local_vars:
        lv.update(local_vars)

    return parse_expr(expr_str, local_dict=lv, transformations=TRANSFORMATIONS)


def fmt_latex(expr) -> str:
    try:
        return latex(expr)
    except Exception:
        return str(expr)


def fmt_result(expr) -> str:
    try:
        return str(simplify(expr))
    except Exception:
        return str(expr)


# ─────────────────────────────────────────────
#  ARITHMETIC & ALGEBRA
# ─────────────────────────────────────────────

def compute_simplify(expr_str: str) -> dict:
    expr = safe_parse(expr_str)
    result = simplify(expr)
    steps = [
        {"index": 1, "description": "Parse the expression", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": "Apply simplification rules", "expression": str(result), "latex": fmt_latex(result)},
    ]
    try:
        numeric = str(float(N(result, 15)))
    except Exception:
        numeric = None
    return {"result": str(result), "result_latex": fmt_latex(result), "result_numeric": numeric, "steps": steps, "operation": "simplify"}


def compute_expand(expr_str: str) -> dict:
    expr = safe_parse(expr_str)
    result = expand(expr)
    steps = [
        {"index": 1, "description": "Original expression", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": "Expand all terms", "expression": str(result), "latex": fmt_latex(result)},
    ]
    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": "expand"}


def compute_factor(expr_str: str) -> dict:
    expr = safe_parse(expr_str)
    result = factor(expr)
    steps = [
        {"index": 1, "description": "Original expression", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": "Factor the expression", "expression": str(result), "latex": fmt_latex(result)},
    ]
    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": "factor"}


def compute_solve(expr_str: str, var_str: str = "x") -> dict:
    var = symbols(var_str)
    # Handle equation format "f(x) = g(x)"
    if "=" in expr_str:
        parts = expr_str.split("=", 1)
        lhs = safe_parse(parts[0])
        rhs = safe_parse(parts[1])
        equation = Eq(lhs, rhs)
    else:
        equation = safe_parse(expr_str)

    solutions = solve(equation, var)
    steps = [
        {"index": 1, "description": f"Set up equation for {var_str}", "expression": str(equation), "latex": fmt_latex(equation)},
        {"index": 2, "description": "Apply algebraic solving methods", "expression": f"{var_str} = {solutions}", "latex": f"{var_str} = {fmt_latex(sp.FiniteSet(*solutions) if solutions else sp.EmptySet)}"},
        {"index": 3, "description": "Solutions found", "expression": str(solutions), "latex": fmt_latex(solutions)},
    ]
    result_str = str(solutions)
    result_latex = fmt_latex(solutions)
    try:
        numeric = [str(complex(N(s))) for s in solutions]
        numeric_str = str(numeric)
    except Exception:
        numeric_str = None
    return {"result": result_str, "result_latex": result_latex, "result_numeric": numeric_str, "steps": steps, "operation": "solve"}


def compute_solve_system(equations: List[str], variables: List[str]) -> dict:
    vars_sym = symbols(" ".join(variables))
    if not isinstance(vars_sym, tuple):
        vars_sym = (vars_sym,)
    eqs = []
    for eq_str in equations:
        if "=" in eq_str:
            parts = eq_str.split("=", 1)
            eqs.append(Eq(safe_parse(parts[0]), safe_parse(parts[1])))
        else:
            eqs.append(safe_parse(eq_str))
    solutions = linsolve(eqs, *vars_sym)
    steps = [
        {"index": i + 1, "description": f"Equation {i + 1}", "expression": str(eqs[i]), "latex": fmt_latex(eqs[i])}
        for i in range(len(eqs))
    ]
    steps.append({"index": len(eqs) + 1, "description": "Solve the system", "expression": str(solutions), "latex": fmt_latex(solutions)})
    return {"result": str(solutions), "result_latex": fmt_latex(solutions), "steps": steps, "operation": "solve_system"}


def compute_inequality(expr_str: str, var_str: str = "x") -> dict:
    from sympy.solvers.inequalities import solve_univariate_inequality
    var = symbols(var_str)
    # Map string operators to SymPy
    expr_str_clean = expr_str.strip()
    expr = safe_parse(expr_str_clean)
    solution = solveset(expr, var, domain=_sp.S.Reals)
    steps = [
        {"index": 1, "description": "Parse the inequality", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": "Solve for the solution set", "expression": str(solution), "latex": fmt_latex(solution)},
    ]
    return {"result": str(solution), "result_latex": fmt_latex(solution), "steps": steps, "operation": "inequality"}


# ─────────────────────────────────────────────
#  CALCULUS
# ─────────────────────────────────────────────

def compute_derivative(expr_str: str, var_str: str = "x", order: int = 1) -> dict:
    var = symbols(var_str)
    expr = safe_parse(expr_str)
    result = diff(expr, var, order)
    simplified = simplify(result)
    steps = [
        {"index": 1, "description": "Original function", "expression": f"f({var_str}) = {expr}", "latex": f"f({var_str}) = {fmt_latex(expr)}"},
        {"index": 2, "description": f"Apply differentiation rules (order {order})", "expression": f"d^{order}f/d{var_str}^{order} = {result}", "latex": fmt_latex(diff(expr, var, order))},
        {"index": 3, "description": "Simplify the result", "expression": str(simplified), "latex": fmt_latex(simplified)},
    ]
    try:
        numeric = None
    except Exception:
        numeric = None
    return {"result": str(simplified), "result_latex": fmt_latex(simplified), "steps": steps, "operation": "derivative"}


def compute_integral(expr_str: str, var_str: str = "x", lower=None, upper=None) -> dict:
    var = symbols(var_str)
    expr = safe_parse(expr_str)

    if lower is not None and upper is not None:
        lower_sym = safe_parse(str(lower))
        upper_sym = safe_parse(str(upper))
        result = integrate(expr, (var, lower_sym, upper_sym))
        op = "definite_integral"
        steps = [
            {"index": 1, "description": "Integrand", "expression": str(expr), "latex": fmt_latex(expr)},
            {"index": 2, "description": f"Find the antiderivative F({var_str})", "expression": str(integrate(expr, var)), "latex": fmt_latex(integrate(expr, var))},
            {"index": 3, "description": f"Apply limits [{lower}, {upper}]", "expression": f"F({upper}) - F({lower})", "latex": f"F({fmt_latex(upper_sym)}) - F({fmt_latex(lower_sym)})"},
            {"index": 4, "description": "Compute the result", "expression": str(result), "latex": fmt_latex(result)},
        ]
    else:
        result = integrate(expr, var)
        op = "indefinite_integral"
        steps = [
            {"index": 1, "description": "Integrand", "expression": str(expr), "latex": fmt_latex(expr)},
            {"index": 2, "description": "Apply integration rules", "expression": str(result), "latex": fmt_latex(result)},
            {"index": 3, "description": "Add constant of integration", "expression": f"{result} + C", "latex": f"{fmt_latex(result)} + C"},
        ]

    try:
        numeric = str(float(N(result, 10)))
    except Exception:
        numeric = None

    return {"result": str(result), "result_latex": fmt_latex(result), "result_numeric": numeric, "steps": steps, "operation": op}


def compute_limit(expr_str: str, var_str: str = "x", approach_str: str = "0", direction: str = "+-") -> dict:
    var = symbols(var_str)
    expr = safe_parse(expr_str)
    approach = safe_parse(approach_str)

    if direction == "+":
        result = limit(expr, var, approach, "+")
    elif direction == "-":
        result = limit(expr, var, approach, "-")
    else:
        result = limit(expr, var, approach)

    steps = [
        {"index": 1, "description": "Expression to evaluate", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": f"Apply limit as {var_str} → {approach_str}", "expression": f"lim({var_str}→{approach_str}) {expr}", "latex": f"\\lim_{{{var_str} \\to {fmt_latex(approach)}}} {fmt_latex(expr)}"},
        {"index": 3, "description": "Compute the limit (L'Hôpital / substitution)", "expression": str(result), "latex": fmt_latex(result)},
    ]
    try:
        numeric = str(float(N(result, 10)))
    except Exception:
        numeric = None
    return {"result": str(result), "result_latex": fmt_latex(result), "result_numeric": numeric, "steps": steps, "operation": "limit"}


def compute_series(expr_str: str, var_str: str = "x", about: str = "0", order: int = 6) -> dict:
    var = symbols(var_str)
    expr = safe_parse(expr_str)
    about_pt = safe_parse(about)
    result = series(expr, var, about_pt, order)
    steps = [
        {"index": 1, "description": "Function to expand", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": f"Expand as Taylor/Maclaurin series about {about} to order {order}", "expression": str(result), "latex": fmt_latex(result)},
    ]
    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": "series"}


def compute_laplace(expr_str: str, var_str: str = "t", s_str: str = "s") -> dict:
    t_sym = symbols(var_str, positive=True)
    s_sym = symbols(s_str)
    expr = safe_parse(expr_str, {var_str: t_sym, s_str: s_sym})
    result, plane, cond = laplace_transform(expr, t_sym, s_sym, noconds=False)
    steps = [
        {"index": 1, "description": "Original function f(t)", "expression": str(expr), "latex": fmt_latex(expr)},
        {"index": 2, "description": "Apply Laplace Transform definition", "expression": f"L{{f(t)}} = F(s)", "latex": "\\mathcal{L}\\{f(t)\\} = \\int_0^\\infty f(t)e^{-st}dt"},
        {"index": 3, "description": "Result F(s)", "expression": str(result), "latex": fmt_latex(result)},
        {"index": 4, "description": "Region of convergence", "expression": f"Re(s) > {plane}", "latex": f"\\text{{Re}}(s) > {fmt_latex(plane)}"},
    ]
    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": "laplace"}


def compute_ode(expr_str: str, func_str: str = "f", var_str: str = "x") -> dict:
    from sympy import dsolve, Derivative
    var = symbols(var_str)
    f = Function(func_str)
    # Replace f'' or f' with proper SymPy ODE notation
    # Accept expressions like "f(x).diff(x,2) + f(x) = 0" or "y'' + y = 0"
    ode_expr = safe_parse(expr_str, {func_str: f, var_str: var})
    if "=" in expr_str:
        parts = expr_str.split("=", 1)
        lhs = safe_parse(parts[0], {func_str: f, var_str: var})
        rhs = safe_parse(parts[1], {func_str: f, var_str: var})
        eq = Eq(lhs, rhs)
    else:
        eq = safe_parse(expr_str, {func_str: f, var_str: var})
    result = dsolve(eq, f(var))
    steps = [
        {"index": 1, "description": "ODE to solve", "expression": str(eq), "latex": fmt_latex(eq)},
        {"index": 2, "description": "Apply standard ODE solving method", "expression": str(result), "latex": fmt_latex(result)},
    ]
    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": "ode"}


# ─────────────────────────────────────────────
#  LINEAR ALGEBRA
# ─────────────────────────────────────────────

def _parse_matrix(matrix_data) -> Matrix:
    if isinstance(matrix_data, list):
        return Matrix(matrix_data)
    if isinstance(matrix_data, str):
        # Parse "[[1,2],[3,4]]" style
        cleaned = matrix_data.strip()
        rows = re.findall(r"\[([^\[\]]+)\]", cleaned)
        parsed = [[float(x.strip()) for x in row.split(",")] for row in rows]
        return Matrix(parsed)
    raise ValueError("Invalid matrix format")


def compute_matrix_ops(matrix_data, operation: str) -> dict:
    M = _parse_matrix(matrix_data)
    steps = [{"index": 1, "description": "Input matrix", "expression": str(M), "latex": fmt_latex(M)}]

    if operation == "det":
        result = M.det()
        steps.append({"index": 2, "description": "Compute determinant using cofactor expansion", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "inverse":
        result = M.inv()
        steps.append({"index": 2, "description": "Compute matrix inverse (Gauss-Jordan elimination)", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "eigenvalues":
        result = M.eigenvals()
        steps.append({"index": 2, "description": "Compute characteristic polynomial det(A - λI) = 0", "expression": str(result), "latex": fmt_latex(result)})
        result = dict(result)
    elif operation == "eigenvectors":
        result = M.eigenvects()
        steps.append({"index": 2, "description": "Find eigenvectors for each eigenvalue", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "rref":
        result, pivots = M.rref()
        steps.append({"index": 2, "description": "Row-reduce to echelon form", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "rank":
        result = M.rank()
        steps.append({"index": 2, "description": "Compute matrix rank", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "trace":
        result = M.trace()
        steps.append({"index": 2, "description": "Compute trace (sum of diagonal elements)", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "transpose":
        result = M.T
        steps.append({"index": 2, "description": "Transpose matrix (rows ↔ columns)", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "null_space":
        result = M.nullspace()
        steps.append({"index": 2, "description": "Compute null space (kernel) of the matrix", "expression": str(result), "latex": fmt_latex(result)})
    else:
        result = str(M)

    result_str = str(result)
    try:
        result_latex = fmt_latex(result)
    except Exception:
        result_latex = result_str

    return {"result": result_str, "result_latex": result_latex, "steps": steps, "operation": f"matrix_{operation}"}


def compute_matrix_multiply(A_data, B_data) -> dict:
    A = _parse_matrix(A_data)
    B = _parse_matrix(B_data)
    result = A * B
    steps = [
        {"index": 1, "description": "Matrix A", "expression": str(A), "latex": fmt_latex(A)},
        {"index": 2, "description": "Matrix B", "expression": str(B), "latex": fmt_latex(B)},
        {"index": 3, "description": "Multiply A × B", "expression": str(result), "latex": fmt_latex(result)},
    ]
    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": "matrix_multiply"}


# ─────────────────────────────────────────────
#  STATISTICS
# ─────────────────────────────────────────────

def compute_statistics(data: List[float], operation: str) -> dict:
    arr = np.array(data, dtype=float)
    steps = [{"index": 1, "description": "Input dataset", "expression": str(list(arr)), "latex": str(list(arr))}]

    if operation == "mean":
        result = float(np.mean(arr))
        steps.append({"index": 2, "description": "Sum all values / count", "expression": f"μ = {result}", "latex": f"\\mu = {result:.6g}"})
    elif operation == "median":
        result = float(np.median(arr))
        steps.append({"index": 2, "description": "Sort values, take middle", "expression": f"median = {result}", "latex": f"\\text{{median}} = {result:.6g}"})
    elif operation == "mode":
        from scipy.stats import mode as scipy_mode
        m = scipy_mode(arr, keepdims=True)
        result = float(m.mode[0])
        steps.append({"index": 2, "description": "Most frequent value", "expression": f"mode = {result}", "latex": f"\\text{{mode}} = {result:.6g}"})
    elif operation == "variance":
        result = float(np.var(arr, ddof=1))
        steps.append({"index": 2, "description": "Sample variance s² = Σ(xᵢ - x̄)² / (n-1)", "expression": f"s² = {result}", "latex": f"s^2 = {result:.6g}"})
    elif operation == "std":
        result = float(np.std(arr, ddof=1))
        steps.append({"index": 2, "description": "Sample standard deviation s = √s²", "expression": f"s = {result}", "latex": f"s = {result:.6g}"})
    elif operation == "summary":
        result = {
            "count": len(arr),
            "mean": float(np.mean(arr)),
            "median": float(np.median(arr)),
            "std": float(np.std(arr, ddof=1)),
            "variance": float(np.var(arr, ddof=1)),
            "min": float(np.min(arr)),
            "max": float(np.max(arr)),
            "range": float(np.max(arr) - np.min(arr)),
            "q1": float(np.percentile(arr, 25)),
            "q3": float(np.percentile(arr, 75)),
            "iqr": float(np.percentile(arr, 75) - np.percentile(arr, 25)),
        }
        steps.append({"index": 2, "description": "Compute all descriptive statistics", "expression": str(result), "latex": ""})
    elif operation == "regression":
        if len(arr) % 2 != 0:
            raise ValueError("For regression, provide pairs x1,y1,x2,y2,...")
        n = len(arr) // 2
        x_vals = arr[:n]
        y_vals = arr[n:]
        slope, intercept, r, p, se = scipy_stats.linregress(x_vals, y_vals)
        result = {"slope": float(slope), "intercept": float(intercept), "r_squared": float(r ** 2), "p_value": float(p), "std_error": float(se)}
        steps.append({"index": 2, "description": "Linear regression y = mx + b", "expression": f"y = {slope:.4f}x + {intercept:.4f}, R² = {r**2:.4f}", "latex": f"y = {slope:.4f}x + {intercept:.4f},\\quad R^2 = {r**2:.4f}"})
    else:
        result = float(np.mean(arr))

    return {"result": str(result), "result_latex": str(result), "steps": steps, "operation": f"stats_{operation}"}


def compute_probability_distribution(dist_name: str, params: dict, query_type: str, value: float = None) -> dict:
    steps = [{"index": 1, "description": f"Distribution: {dist_name}", "expression": str(params), "latex": ""}]

    if dist_name == "normal":
        mu = params.get("mu", 0)
        sigma = params.get("sigma", 1)
        dist = scipy_stats.norm(loc=mu, scale=sigma)
        if query_type == "pdf":
            result = float(dist.pdf(value))
        elif query_type == "cdf":
            result = float(dist.cdf(value))
        else:
            result = {"mean": mu, "variance": sigma ** 2, "std": sigma}
        steps.append({"index": 2, "description": f"N(μ={mu}, σ²={sigma**2})", "expression": str(result), "latex": f"X \\sim N({mu}, {sigma**2})"})
    elif dist_name == "binomial":
        n_trials = params.get("n", 10)
        p_prob = params.get("p", 0.5)
        dist = scipy_stats.binom(n=n_trials, p=p_prob)
        if query_type == "pmf":
            result = float(dist.pmf(int(value)))
        elif query_type == "cdf":
            result = float(dist.cdf(int(value)))
        else:
            result = {"mean": n_trials * p_prob, "variance": n_trials * p_prob * (1 - p_prob)}
        steps.append({"index": 2, "description": f"B(n={n_trials}, p={p_prob})", "expression": str(result), "latex": f"X \\sim B({n_trials}, {p_prob})"})
    else:
        result = "Unsupported distribution"

    return {"result": str(result), "result_latex": str(result), "steps": steps, "operation": f"prob_{dist_name}"}


# ─────────────────────────────────────────────
#  NUMBER THEORY
# ─────────────────────────────────────────────

def compute_number_theory(n: int, operation: str) -> dict:
    steps = [{"index": 1, "description": f"Input: {n}", "expression": str(n), "latex": str(n)}]

    if operation == "prime_factors":
        result = factorint(n)
        steps.append({"index": 2, "description": "Prime factorization", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "is_prime":
        result = isprime(n)
        steps.append({"index": 2, "description": "Check primality", "expression": str(result), "latex": str(result)})
    elif operation == "next_prime":
        result = int(nextprime(n))
        steps.append({"index": 2, "description": "Next prime after n", "expression": str(result), "latex": str(result)})
    elif operation == "divisors":
        result = divisors(n)
        steps.append({"index": 2, "description": "All divisors of n", "expression": str(result), "latex": str(result)})
    elif operation == "totient":
        result = int(totient(n))
        steps.append({"index": 2, "description": "Euler's totient φ(n)", "expression": str(result), "latex": f"\\varphi({n}) = {result}"})
    else:
        result = str(n)

    return {"result": str(result), "result_latex": str(result), "steps": steps, "operation": f"number_{operation}"}


# ─────────────────────────────────────────────
#  COMPLEX NUMBERS
# ─────────────────────────────────────────────

def compute_complex(expr_str: str, operation: str) -> dict:
    x = symbols("x")
    expr = safe_parse(expr_str)
    steps = [{"index": 1, "description": "Complex expression", "expression": str(expr), "latex": fmt_latex(expr)}]

    if operation == "real_part":
        result = _sp.re(expr)
        steps.append({"index": 2, "description": "Extract real part", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "imag_part":
        result = _sp.im(expr)
        steps.append({"index": 2, "description": "Extract imaginary part", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "conjugate":
        result = conjugate(expr)
        steps.append({"index": 2, "description": "Complex conjugate", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "magnitude":
        result = Abs(expr)
        steps.append({"index": 2, "description": "|z| = √(Re² + Im²)", "expression": str(result), "latex": fmt_latex(result)})
    elif operation == "argument":
        result = arg(expr)
        steps.append({"index": 2, "description": "arg(z) = atan2(Im, Re)", "expression": str(result), "latex": fmt_latex(result)})
    else:
        result = simplify(expr)

    return {"result": str(result), "result_latex": fmt_latex(result), "steps": steps, "operation": f"complex_{operation}"}


# ─────────────────────────────────────────────
#  PHYSICS
# ─────────────────────────────────────────────

PHYSICS_FORMULAS = {
    "kinematics_v": {
        "formula": "v = u + at",
        "description": "Final velocity",
        "variables": ["v", "u", "a", "t"],
        "solve_for": "v",
        "sympy": lambda u, a, t: u + a * t,
    },
    "kinematics_s": {
        "formula": "s = ut + 0.5at²",
        "description": "Displacement",
        "variables": ["s", "u", "a", "t"],
        "solve_for": "s",
        "sympy": lambda u, a, t: u * t + 0.5 * a * t ** 2,
    },
    "newton_f": {
        "formula": "F = ma",
        "description": "Newton's second law",
        "variables": ["F", "m", "a"],
        "solve_for": "F",
        "sympy": lambda m, a: m * a,
    },
    "energy_kinetic": {
        "formula": "KE = 0.5mv²",
        "description": "Kinetic energy",
        "variables": ["KE", "m", "v"],
        "solve_for": "KE",
        "sympy": lambda m, v: 0.5 * m * v ** 2,
    },
    "coulomb": {
        "formula": "F = kq₁q₂/r²",
        "description": "Coulomb's law",
        "variables": ["F", "k", "q1", "q2", "r"],
        "solve_for": "F",
        "sympy": lambda k, q1, q2, r: k * q1 * q2 / r ** 2,
    },
    "ohm": {
        "formula": "V = IR",
        "description": "Ohm's law",
        "variables": ["V", "I", "R"],
        "solve_for": "V",
        "sympy": lambda I, R: I * R,
    },
}


def compute_physics(formula_key: str, values: dict) -> dict:
    formula_info = PHYSICS_FORMULAS.get(formula_key)
    if not formula_info:
        raise ValueError(f"Unknown formula: {formula_key}")
    sym_vars = {k: symbols(k) for k in formula_info["variables"]}
    fn = formula_info["sympy"]
    known = {k: float(v) for k, v in values.items()}
    args = []
    for var_name in formula_info["variables"]:
        if var_name == formula_info["solve_for"]:
            continue
        if var_name in known:
            args.append(known[var_name])
        else:
            args.append(sym_vars[var_name])
    result = fn(*args)
    numeric = float(result) if result.is_number else None
    steps = [
        {"index": 1, "description": f"Formula: {formula_info['formula']}", "expression": formula_info["formula"], "latex": formula_info["formula"]},
        {"index": 2, "description": "Substitute known values", "expression": str(result), "latex": fmt_latex(result)},
    ]
    if numeric is not None:
        steps.append({"index": 3, "description": "Numerical result", "expression": str(numeric), "latex": str(numeric)})
    return {"result": str(result), "result_latex": fmt_latex(result), "result_numeric": str(numeric) if numeric else None, "steps": steps, "operation": "physics"}


# ─────────────────────────────────────────────
#  UNIT CONVERSION
# ─────────────────────────────────────────────

UNIT_CONVERSIONS = {
    "length": {"m": 1, "km": 1000, "cm": 0.01, "mm": 0.001, "ft": 0.3048, "in": 0.0254, "yd": 0.9144, "mi": 1609.344},
    "mass": {"kg": 1, "g": 0.001, "mg": 1e-6, "lb": 0.453592, "oz": 0.0283495, "t": 1000},
    "temperature": {"celsius": 1, "fahrenheit": 1, "kelvin": 1},
    "time": {"s": 1, "ms": 0.001, "min": 60, "h": 3600, "d": 86400},
    "energy": {"j": 1, "kj": 1000, "cal": 4.184, "kcal": 4184, "ev": 1.602e-19, "kwh": 3.6e6},
}


def convert_units(value: float, from_unit: str, to_unit: str) -> dict:
    from_unit = from_unit.lower()
    to_unit = to_unit.lower()
    for category, units in UNIT_CONVERSIONS.items():
        if from_unit in units and to_unit in units:
            if category == "temperature":
                if from_unit == "celsius" and to_unit == "fahrenheit":
                    result = value * 9 / 5 + 32
                elif from_unit == "celsius" and to_unit == "kelvin":
                    result = value + 273.15
                elif from_unit == "fahrenheit" and to_unit == "celsius":
                    result = (value - 32) * 5 / 9
                elif from_unit == "fahrenheit" and to_unit == "kelvin":
                    result = (value - 32) * 5 / 9 + 273.15
                elif from_unit == "kelvin" and to_unit == "celsius":
                    result = value - 273.15
                elif from_unit == "kelvin" and to_unit == "fahrenheit":
                    result = (value - 273.15) * 9 / 5 + 32
                else:
                    result = value
            else:
                to_base = value * units[from_unit]
                result = to_base / units[to_unit]
            steps = [
                {"index": 1, "description": f"Convert {value} {from_unit} to {to_unit}", "expression": f"{value} {from_unit} = ? {to_unit}", "latex": ""},
                {"index": 2, "description": "Apply conversion factor", "expression": f"{result:.6g} {to_unit}", "latex": f"{result:.6g} \\text{{ {to_unit}}}"},
            ]
            return {"result": f"{result:.6g} {to_unit}", "result_latex": f"{result:.6g} \\text{{ {to_unit}}}", "result_numeric": str(result), "steps": steps, "operation": "unit_conversion", "domain": category}
    raise ValueError(f"Cannot convert {from_unit} to {to_unit}")


# ─────────────────────────────────────────────
#  DISPATCHER
# ─────────────────────────────────────────────

def dispatch(parsed: dict) -> dict:
    op = parsed.get("operation", "evaluate")
    expr = parsed.get("expression", "")
    var = parsed.get("variable", "x")
    extra = parsed.get("extra", {}) or {}

    try:
        if op == "simplify":
            return compute_simplify(expr)
        elif op == "expand":
            return compute_expand(expr)
        elif op == "factor":
            return compute_factor(expr)
        elif op == "solve":
            return compute_solve(expr, var)
        elif op == "solve_system":
            return compute_solve_system(extra.get("equations", []), extra.get("variables", ["x", "y"]))
        elif op in ("diff", "derivative", "differentiate"):
            return compute_derivative(expr, var, extra.get("order", 1))
        elif op in ("integrate", "integral"):
            return compute_integral(expr, var, extra.get("lower"), extra.get("upper"))
        elif op == "limit":
            return compute_limit(expr, var, extra.get("approach", "0"), extra.get("direction", "+-"))
        elif op == "series":
            return compute_series(expr, var, extra.get("about", "0"), extra.get("order", 6))
        elif op == "laplace":
            return compute_laplace(expr, var, extra.get("s_var", "s"))
        elif op == "ode":
            return compute_ode(expr, extra.get("func", "f"), var)
        elif op.startswith("matrix_"):
            mat_op = op[len("matrix_"):]
            if mat_op == "multiply":
                return compute_matrix_multiply(extra.get("A"), extra.get("B"))
            return compute_matrix_ops(extra.get("matrix", expr), mat_op)
        elif op.startswith("stats_"):
            stat_op = op[len("stats_"):]
            return compute_statistics(extra.get("data", []), stat_op)
        elif op == "unit_convert":
            return convert_units(extra.get("value", 0), extra.get("from"), extra.get("to"))
        elif op == "physics":
            return compute_physics(extra.get("formula"), extra.get("values", {}))
        elif op == "complex":
            return compute_complex(expr, extra.get("complex_op", "simplify"))
        elif op == "evaluate":
            expr_parsed = safe_parse(expr)
            result = simplify(expr_parsed)
            try:
                numeric = str(float(N(result, 15)))
            except Exception:
                numeric = None
            return {"result": str(result), "result_latex": fmt_latex(result), "result_numeric": numeric, "steps": [{"index": 1, "description": "Evaluate expression", "expression": str(result), "latex": fmt_latex(result)}], "operation": "evaluate"}
        else:
            # Try to evaluate as a general expression
            expr_parsed = safe_parse(expr)
            result = simplify(expr_parsed)
            try:
                numeric = str(float(N(result, 15)))
            except Exception:
                numeric = None
            return {"result": str(result), "result_latex": fmt_latex(result), "result_numeric": numeric, "steps": [{"index": 1, "description": "Compute expression", "expression": str(result), "latex": fmt_latex(result)}], "operation": op}
    except Exception as e:
        return {"success": False, "error": str(e), "operation": op, "result": None}
