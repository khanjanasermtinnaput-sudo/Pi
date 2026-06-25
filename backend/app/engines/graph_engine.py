"""
Graph generation engine powered by Plotly.
Produces interactive chart JSON for the frontend.
"""
import numpy as np
import sympy as sp
from sympy import sympify, lambdify, symbols, pi, E
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor
import json
from typing import Optional, List

TRANSFORMATIONS = standard_transformations + (implicit_multiplication_application, convert_xor)

PLOTLY_THEME = {
    "paper_bgcolor": "rgba(0,0,0,0)",
    "plot_bgcolor": "rgba(0,0,0,0)",
    "font": {"family": "Inter, system-ui, sans-serif", "size": 13, "color": "#1a1a1a"},
    "margin": {"l": 50, "r": 30, "t": 50, "b": 50},
    "xaxis": {
        "showgrid": True,
        "gridcolor": "#e5e7eb",
        "gridwidth": 1,
        "zeroline": True,
        "zerolinecolor": "#374151",
        "zerolinewidth": 2,
        "linecolor": "#e5e7eb",
        "tickfont": {"size": 11},
    },
    "yaxis": {
        "showgrid": True,
        "gridcolor": "#e5e7eb",
        "gridwidth": 1,
        "zeroline": True,
        "zerolinecolor": "#374151",
        "zerolinewidth": 2,
        "linecolor": "#e5e7eb",
        "tickfont": {"size": 11},
    },
    "colorway": ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"],
}


def _safe_lambdify(expr_str: str, var_names: List[str]):
    syms = symbols(" ".join(var_names))
    if not isinstance(syms, tuple):
        syms = (syms,)
    local_dict = {s: sym for s, sym in zip(var_names, syms)}
    local_dict["pi"] = pi
    local_dict["e"] = E
    expr_str = expr_str.replace("^", "**")
    parsed = parse_expr(expr_str, local_dict=local_dict, transformations=TRANSFORMATIONS)
    modules = ["numpy", {"sqrt": np.sqrt, "Abs": np.abs, "sign": np.sign}]
    fn = lambdify(list(syms), parsed, modules=modules)
    return fn


def generate_2d_graph(expression: str, x_range: List[float], title: str = None, points: int = 500) -> dict:
    x_vals = np.linspace(x_range[0], x_range[1], points)
    fn = _safe_lambdify(expression, ["x"])
    y_raw = fn(x_vals)
    # Mask discontinuities
    y_vals = np.where(np.abs(y_raw) > 1e10, np.nan, y_raw)
    y_vals = np.where(np.iscomplex(y_vals), np.nan, np.real(y_vals))

    trace = {
        "type": "scatter",
        "x": x_vals.tolist(),
        "y": y_vals.tolist(),
        "mode": "lines",
        "line": {"color": "#2563eb", "width": 2.5},
        "name": expression,
        "hovertemplate": "x = %{x:.4f}<br>y = %{y:.4f}<extra></extra>",
    }

    layout = {
        **PLOTLY_THEME,
        "title": {"text": title or f"y = {expression}", "font": {"size": 15, "color": "#111827"}, "x": 0.5},
        "xaxis": {**PLOTLY_THEME["xaxis"], "title": "x"},
        "yaxis": {**PLOTLY_THEME["yaxis"], "title": "y"},
        "hovermode": "x unified",
        "showlegend": False,
    }

    return {"data": [trace], "layout": layout}


def generate_3d_graph(expression: str, x_range: List[float], y_range: List[float], points: int = 60) -> dict:
    x_vals = np.linspace(x_range[0], x_range[1], points)
    y_vals = np.linspace(y_range[0], y_range[1], points)
    X, Y = np.meshgrid(x_vals, y_vals)
    fn = _safe_lambdify(expression, ["x", "y"])
    try:
        Z = fn(X, Y)
        Z = np.where(np.abs(Z) > 1e10, np.nan, np.real(Z))
    except Exception:
        Z = np.zeros_like(X)

    trace = {
        "type": "surface",
        "x": x_vals.tolist(),
        "y": y_vals.tolist(),
        "z": Z.tolist(),
        "colorscale": "Blues",
        "showscale": True,
        "opacity": 0.9,
        "name": expression,
    }

    layout = {
        **PLOTLY_THEME,
        "title": {"text": f"z = {expression}", "font": {"size": 15}, "x": 0.5},
        "scene": {
            "xaxis": {"title": "x", "gridcolor": "#e5e7eb"},
            "yaxis": {"title": "y", "gridcolor": "#e5e7eb"},
            "zaxis": {"title": "z", "gridcolor": "#e5e7eb"},
            "bgcolor": "rgba(0,0,0,0)",
        },
    }

    return {"data": [trace], "layout": layout}


def generate_polar_graph(expression: str, theta_range: List[float] = None, points: int = 500) -> dict:
    if theta_range is None:
        theta_range = [0, 2 * np.pi]
    theta_vals = np.linspace(theta_range[0], theta_range[1], points)
    fn = _safe_lambdify(expression, ["theta"])
    r_raw = fn(theta_vals)
    r_vals = np.where(np.abs(r_raw) > 1e10, np.nan, np.real(r_raw))

    x_vals = (r_vals * np.cos(theta_vals)).tolist()
    y_vals = (r_vals * np.sin(theta_vals)).tolist()

    trace = {
        "type": "scatter",
        "x": x_vals,
        "y": y_vals,
        "mode": "lines",
        "line": {"color": "#7c3aed", "width": 2.5},
        "name": f"r = {expression}",
    }

    layout = {
        **PLOTLY_THEME,
        "title": {"text": f"r = {expression}", "font": {"size": 15}, "x": 0.5},
        "xaxis": {**PLOTLY_THEME["xaxis"], "title": "x", "scaleanchor": "y", "scaleratio": 1},
        "yaxis": {**PLOTLY_THEME["yaxis"], "title": "y"},
        "showlegend": False,
    }
    return {"data": [trace], "layout": layout}


def generate_parametric_graph(x_expr: str, y_expr: str, t_range: List[float] = None, points: int = 500) -> dict:
    if t_range is None:
        t_range = [0, 2 * np.pi]
    t_vals = np.linspace(t_range[0], t_range[1], points)
    fn_x = _safe_lambdify(x_expr, ["t"])
    fn_y = _safe_lambdify(y_expr, ["t"])
    x_vals = np.real(fn_x(t_vals))
    y_vals = np.real(fn_y(t_vals))

    trace = {
        "type": "scatter",
        "x": x_vals.tolist(),
        "y": y_vals.tolist(),
        "mode": "lines",
        "line": {"color": "#16a34a", "width": 2.5},
        "name": f"x={x_expr}, y={y_expr}",
        "text": [f"t={t:.3f}" for t in t_vals],
        "hovertemplate": "x = %{x:.4f}<br>y = %{y:.4f}<br>%{text}<extra></extra>",
    }

    layout = {
        **PLOTLY_THEME,
        "title": {"text": f"Parametric: x={x_expr}, y={y_expr}", "font": {"size": 15}, "x": 0.5},
        "xaxis": {**PLOTLY_THEME["xaxis"], "title": "x"},
        "yaxis": {**PLOTLY_THEME["yaxis"], "title": "y"},
        "showlegend": False,
    }
    return {"data": [trace], "layout": layout}


def generate_multi_2d(expressions: List[str], x_range: List[float], points: int = 500) -> dict:
    colors = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"]
    traces = []
    x_vals = np.linspace(x_range[0], x_range[1], points)

    for i, expr in enumerate(expressions):
        fn = _safe_lambdify(expr, ["x"])
        y_raw = fn(x_vals)
        y_vals = np.where(np.abs(y_raw) > 1e10, np.nan, np.real(y_raw))
        traces.append({
            "type": "scatter",
            "x": x_vals.tolist(),
            "y": y_vals.tolist(),
            "mode": "lines",
            "line": {"color": colors[i % len(colors)], "width": 2.5},
            "name": f"y = {expr}",
        })

    layout = {
        **PLOTLY_THEME,
        "title": {"text": "Multiple Functions", "font": {"size": 15}, "x": 0.5},
        "xaxis": {**PLOTLY_THEME["xaxis"], "title": "x"},
        "yaxis": {**PLOTLY_THEME["yaxis"], "title": "y"},
        "showlegend": True,
        "legend": {"bgcolor": "rgba(255,255,255,0.8)", "bordercolor": "#e5e7eb", "borderwidth": 1},
    }
    return {"data": traces, "layout": layout}


def generate_stat_graph(data: List[float], graph_type: str = "histogram") -> dict:
    if graph_type == "histogram":
        trace = {
            "type": "histogram",
            "x": data,
            "marker": {"color": "#2563eb", "opacity": 0.8},
            "nbinsx": max(10, len(data) // 5),
            "name": "Frequency",
        }
        layout = {
            **PLOTLY_THEME,
            "title": {"text": "Histogram", "font": {"size": 15}, "x": 0.5},
            "xaxis": {**PLOTLY_THEME["xaxis"], "title": "Value"},
            "yaxis": {**PLOTLY_THEME["yaxis"], "title": "Count"},
            "bargap": 0.05,
        }
    elif graph_type == "boxplot":
        trace = {
            "type": "box",
            "y": data,
            "marker": {"color": "#2563eb"},
            "boxmean": True,
            "name": "Distribution",
        }
        layout = {
            **PLOTLY_THEME,
            "title": {"text": "Box Plot", "font": {"size": 15}, "x": 0.5},
            "yaxis": {**PLOTLY_THEME["yaxis"], "title": "Value"},
        }
    else:
        trace = {"type": "scatter", "y": data, "mode": "markers", "marker": {"color": "#2563eb", "size": 5}}
        layout = {**PLOTLY_THEME, "title": {"text": "Data", "x": 0.5}}

    return {"data": [trace], "layout": layout}


def dispatch_graph(request: dict) -> dict:
    graph_type = request.get("graph_type", "2d")
    expr = request.get("expression", "x")
    x_range = request.get("x_range", [-10, 10])
    y_range = request.get("y_range", [-10, 10])
    points = request.get("points", 500)
    title = request.get("title")
    extra = request.get("extra", {}) or {}

    if graph_type == "2d":
        return generate_2d_graph(expr, x_range, title, points)
    elif graph_type == "3d":
        return generate_3d_graph(expr, x_range, y_range or [-10, 10], min(points, 80))
    elif graph_type == "polar":
        return generate_polar_graph(expr, extra.get("theta_range"), points)
    elif graph_type == "parametric":
        return generate_parametric_graph(extra.get("x_expr", "cos(t)"), extra.get("y_expr", "sin(t)"), extra.get("t_range"), points)
    elif graph_type == "multi":
        return generate_multi_2d(extra.get("expressions", [expr]), x_range, points)
    elif graph_type == "stat":
        return generate_stat_graph(extra.get("data", []), extra.get("stat_type", "histogram"))
    else:
        return generate_2d_graph(expr, x_range, title, points)
