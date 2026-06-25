"""
Natural language → structured math operation parser.
Uses regex patterns first; falls back to Claude AI only for intent parsing.
AI is NEVER used for computation — only to interpret the user's request.
"""
import re
import os
from typing import Optional

try:
    import anthropic
    _ANTHROPIC_AVAILABLE = True
except ImportError:
    _ANTHROPIC_AVAILABLE = False

# ─────────────────────────────────────────────
#  REGEX PATTERN PARSER (fast, offline)
# ─────────────────────────────────────────────

PATTERNS = [
    # Solve equations
    (r"solve\s+(.+?)(?:\s+for\s+([a-z]))?$", "solve", lambda m: {"expression": m.group(1).strip(), "variable": m.group(2) or "x"}),
    # Differentiate / derivative
    (r"(?:differentiate|derivative of|d/dx|diff)\s+(.+?)(?:\s+with respect to\s+([a-z]))?$", "derivative", lambda m: {"expression": m.group(1).strip(), "variable": m.group(2) or "x"}),
    # Integrate / integral
    (r"(?:integrate|integral of)\s+(.+?)(?:\s+from\s+(.+?)\s+to\s+(.+?))?(?:\s+d([a-z]))?$", "integrate", lambda m: {"expression": m.group(1).strip(), "variable": m.group(4) or "x", "extra": {"lower": m.group(2), "upper": m.group(3)}}),
    # Limit
    (r"limit\s+of\s+(.+?)\s+as\s+([a-z])\s*(?:→|->|approaches)\s*(.+?)(?:\s+from\s+(left|right|\+|-))?$", "limit", lambda m: {"expression": m.group(1).strip(), "variable": m.group(2), "extra": {"approach": m.group(3).strip(), "direction": "+" if m.group(4) in ("right", "+") else "-" if m.group(4) in ("left", "-") else "+-"}}),
    # Taylor / series expansion
    (r"(?:taylor|maclaurin|series)\s+(?:expansion\s+)?of\s+(.+?)(?:\s+about\s+(.+?))?(?:\s+to\s+order\s+(\d+))?$", "series", lambda m: {"expression": m.group(1).strip(), "variable": "x", "extra": {"about": m.group(2) or "0", "order": int(m.group(3) or 6)}}),
    # Laplace transform
    (r"laplace\s+transform\s+of\s+(.+)", "laplace", lambda m: {"expression": m.group(1).strip(), "variable": "t"}),
    # Eigenvalues / eigenvectors
    (r"eigen(?:values?|vectors?)\s+(?:of\s+)?(.+)", "matrix_eigenvalues", lambda m: {"expression": m.group(1).strip(), "extra": {"matrix": m.group(1).strip()}}),
    # Determinant
    (r"det(?:erminant)?\s+(?:of\s+)?(.+)", "matrix_det", lambda m: {"expression": m.group(1).strip(), "extra": {"matrix": m.group(1).strip()}}),
    # Factor
    (r"factor\s+(.+)", "factor", lambda m: {"expression": m.group(1).strip()}),
    # Expand
    (r"expand\s+(.+)", "expand", lambda m: {"expression": m.group(1).strip()}),
    # Simplify
    (r"simplify\s+(.+)", "simplify", lambda m: {"expression": m.group(1).strip()}),
    # Unit conversion
    (r"convert\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)", "unit_convert", lambda m: {"expression": "", "extra": {"value": float(m.group(1)), "from": m.group(2), "to": m.group(3)}}),
    # Statistics
    (r"(?:find\s+)?(?:the\s+)?mean\s+of\s+(.+)", "stats_mean", lambda m: {"expression": m.group(1).strip(), "extra": {"data": _parse_list(m.group(1))}}),
    (r"(?:find\s+)?(?:the\s+)?median\s+of\s+(.+)", "stats_median", lambda m: {"expression": m.group(1).strip(), "extra": {"data": _parse_list(m.group(1))}}),
    (r"(?:find\s+)?(?:the\s+)?(?:standard\s+deviation|std)\s+of\s+(.+)", "stats_std", lambda m: {"expression": m.group(1).strip(), "extra": {"data": _parse_list(m.group(1))}}),
    (r"(?:find\s+)?(?:the\s+)?variance\s+of\s+(.+)", "stats_variance", lambda m: {"expression": m.group(1).strip(), "extra": {"data": _parse_list(m.group(1))}}),
    # GCD / LCM
    (r"gcd\s+(?:of\s+)?(.+)", "evaluate", lambda m: {"expression": f"gcd({m.group(1).replace(' ', ',')})" if ',' not in m.group(1) else f"gcd({m.group(1)})"}),
    (r"lcm\s+(?:of\s+)?(.+)", "evaluate", lambda m: {"expression": f"lcm({m.group(1).replace(' ', ',')})" if ',' not in m.group(1) else f"lcm({m.group(1)})"}),
    # Is prime
    (r"is\s+(\d+)\s+prime", "evaluate", lambda m: {"expression": f"isprime({m.group(1)})"}),
    # Graph
    (r"(?:graph|plot|draw)\s+(.+?)(?:\s+from\s+([\d.,-]+)\s+to\s+([\d.,-]+))?$", "graph_2d", lambda m: {"expression": m.group(1).strip(), "extra": {"x_range": [float(m.group(2) or -10), float(m.group(3) or 10)]}}),
]

# Thai language keyword map (transliterate common terms)
THAI_MAP = {
    "หา": "find",
    "limit": "limit",
    "ของ": "of",
    "หาร": "/",
    "เมื่อ": "as",
    "เข้าใกล้": "approaches",
    "ปริพันธ์": "integrate",
    "อนุพันธ์": "differentiate",
    "แก้สมการ": "solve",
    "เมทริกซ์": "matrix",
    "ค่าเฉลี่ย": "mean",
    "ส่วนเบี่ยงเบน": "std",
    "แยกตัวประกอบ": "factor",
    "กราฟ": "graph",
}


def _translate_thai(text: str) -> str:
    for thai, eng in THAI_MAP.items():
        text = text.replace(thai, eng)
    return text


def _parse_list(s: str):
    try:
        return [float(x.strip()) for x in re.split(r"[,\s]+", s.strip()) if x.strip()]
    except Exception:
        return []


def regex_parse(text: str) -> Optional[dict]:
    text_clean = text.strip().lower()
    text_clean = _translate_thai(text_clean)
    for pattern, operation, extractor in PATTERNS:
        m = re.search(pattern, text_clean, re.IGNORECASE)
        if m:
            result = extractor(m)
            result["operation"] = operation
            result.setdefault("variable", "x")
            result.setdefault("extra", {})
            return result
    return None


# ─────────────────────────────────────────────
#  AI PARSER (intent only — no computation)
# ─────────────────────────────────────────────

AI_SYSTEM_PROMPT = """You are a mathematical expression parser. Your ONLY job is to convert natural language math questions into a structured JSON object.

You MUST NEVER solve or calculate anything. You only identify the operation and extract the expression.

Return ONLY valid JSON with these fields:
{
  "operation": "<one of: evaluate, solve, derivative, integrate, limit, series, laplace, factor, expand, simplify, matrix_det, matrix_inverse, matrix_eigenvalues, matrix_eigenvectors, matrix_rref, matrix_trace, matrix_transpose, stats_mean, stats_median, stats_std, stats_variance, stats_summary, stats_regression, unit_convert, graph_2d, graph_3d, graph_polar, graph_parametric, physics, ode>",
  "expression": "<the mathematical expression as a Python/SymPy string>",
  "variable": "<the main variable, default 'x'>",
  "extra": {<any extra params like lower, upper bounds, approach value, matrix data, etc.>}
}

Rules:
- Use ** for exponentiation (not ^ unless raw expression)
- Use sin, cos, tan, log, exp, sqrt, etc. (SymPy style)
- For limits: extra = {"approach": "0", "direction": "+-"}
- For integrals with bounds: extra = {"lower": "0", "upper": "1"}
- For matrices: extra = {"matrix": [[1,2],[3,4]]}
- For statistics: extra = {"data": [1,2,3,4,5]}
- For unit conversion: extra = {"value": 1.0, "from": "km", "to": "mi"}
- Return ONLY the JSON, nothing else."""


async def ai_parse(text: str) -> Optional[dict]:
    if not _ANTHROPIC_AVAILABLE:
        return None
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=256,
            system=AI_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": text}],
        )
        import json
        content = response.content[0].text.strip()
        # Extract JSON if wrapped in markdown
        if "```" in content:
            content = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
            if content:
                content = content.group(1)
            else:
                return None
        return json.loads(content)
    except Exception:
        return None


async def parse_input(text: str) -> dict:
    """Main entry point: regex first, AI fallback, raw expression last."""
    # 1. Try regex
    result = regex_parse(text)
    if result:
        result["source"] = "regex"
        return result

    # 2. Try AI parser
    ai_result = await ai_parse(text)
    if ai_result and isinstance(ai_result, dict):
        ai_result["source"] = "ai"
        return ai_result

    # 3. Fall back: treat the whole input as a raw expression to evaluate
    return {
        "operation": "evaluate",
        "expression": text.strip(),
        "variable": "x",
        "extra": {},
        "source": "fallback",
    }
