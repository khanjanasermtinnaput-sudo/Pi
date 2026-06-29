"use client";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { Delete, Equal } from "lucide-react";
import { useCalculatorStore } from "@/store/calculatorStore";
import type { KeypadMode } from "@/store/calculatorStore";

// ─── Button config ─────────────────────────────────────────────────────────

type BtnVariant = "num" | "op" | "fn" | "clear" | "del" | "solve" | "mem" | "ans" | "util";

interface BtnDef {
  label: string | React.ReactNode;
  title?: string;
  variant: BtnVariant;
  insert?: string;
  action?: "clear" | "del" | "solve" | "ans" | "negate" | "paren" | "builder" | "physics";
  builder?: "integral" | "limit" | "derivative" | "matrix";
  physics?: "constants" | "formulas";
  wide?: boolean;
}

// ─── Mode-specific function button grids ───────────────────────────────────

const SCIENTIFIC_BTNS: BtnDef[] = [
  { label: "sin", title: "Sine", variant: "fn", insert: "sin(" },
  { label: "cos", title: "Cosine", variant: "fn", insert: "cos(" },
  { label: "tan", title: "Tangent", variant: "fn", insert: "tan(" },
  { label: "π", title: "Pi", variant: "fn", insert: "pi" },
  { label: "asin", title: "Arcsin", variant: "fn", insert: "asin(" },
  { label: "acos", title: "Arccos", variant: "fn", insert: "acos(" },
  { label: "atan", title: "Arctan", variant: "fn", insert: "atan(" },
  { label: "e", title: "Euler's number", variant: "fn", insert: "e" },
  { label: "log", title: "Log base 10", variant: "fn", insert: "log(" },
  { label: "ln", title: "Natural log", variant: "fn", insert: "ln(" },
  { label: "√", title: "Square root", variant: "fn", insert: "sqrt(" },
  { label: "x²", title: "Square", variant: "fn", insert: "**2" },
  { label: "x³", title: "Cube", variant: "fn", insert: "**3" },
  { label: "xʸ", title: "Power", variant: "fn", insert: "**" },
  { label: "10ˣ", title: "10 to the power", variant: "fn", insert: "10**" },
  { label: "eˣ", title: "e to the power", variant: "fn", insert: "exp(" },
  { label: "abs", title: "Absolute value", variant: "fn", insert: "abs(" },
  { label: "n!", title: "Factorial", variant: "fn", insert: "factorial(" },
  { label: "⌊x⌋", title: "Floor", variant: "fn", insert: "floor(" },
  { label: "⌈x⌉", title: "Ceiling", variant: "fn", insert: "ceil(" },
];

const CALCULUS_BTNS: BtnDef[] = [
  { label: "lim", title: "Limit", variant: "fn", action: "builder", builder: "limit" },
  { label: "∫", title: "Integral", variant: "fn", action: "builder", builder: "integral" },
  { label: "d/dx", title: "Derivative", variant: "fn", action: "builder", builder: "derivative" },
  { label: "Σ", title: "Summation", variant: "fn", insert: "Sum(" },
  { label: "Π", title: "Product", variant: "fn", insert: "Product(" },
  { label: "∞", title: "Infinity", variant: "fn", insert: "oo" },
  { label: "∂/∂x", title: "Partial derivative", variant: "fn", insert: "diff(" },
  { label: "∇", title: "Nabla / gradient", variant: "fn", insert: "grad " },
  { label: "Taylor", title: "Taylor series", variant: "fn", insert: "taylor series of " },
  { label: "Laplace", title: "Laplace transform", variant: "fn", insert: "laplace transform of " },
  { label: "ODE", title: "ODE solver", variant: "fn", insert: "solve ODE " },
  { label: "series", title: "Series expansion", variant: "fn", insert: "series of " },
];

const MATRIX_BTNS: BtnDef[] = [
  { label: "Matrix", title: "Open matrix builder", variant: "fn", action: "builder", builder: "matrix" },
  { label: "det", title: "Determinant", variant: "fn", insert: "det " },
  { label: "inv", title: "Inverse", variant: "fn", insert: "inverse of " },
  { label: "rank", title: "Rank", variant: "fn", insert: "rank " },
  { label: "eigen", title: "Eigenvalues", variant: "fn", insert: "eigenvalues of " },
  { label: "eigvec", title: "Eigenvectors", variant: "fn", insert: "eigenvectors of " },
  { label: "Tᵀ", title: "Transpose", variant: "fn", insert: "transpose of " },
  { label: "rref", title: "Row echelon form", variant: "fn", insert: "rref of " },
  { label: "trace", title: "Trace", variant: "fn", insert: "trace of " },
  { label: "norm", title: "Norm", variant: "fn", insert: "norm of " },
  { label: "[[", title: "Open matrix", variant: "fn", insert: "[[" },
  { label: "]]", title: "Close matrix", variant: "fn", insert: "]]" },
];

const STATS_BTNS: BtnDef[] = [
  { label: "mean", title: "Mean", variant: "fn", insert: "mean of " },
  { label: "median", title: "Median", variant: "fn", insert: "median of " },
  { label: "mode", title: "Mode", variant: "fn", insert: "mode of " },
  { label: "var", title: "Variance", variant: "fn", insert: "variance of " },
  { label: "std", title: "Standard deviation", variant: "fn", insert: "standard deviation of " },
  { label: "sum", title: "Sum", variant: "fn", insert: "sum of " },
  { label: "min", title: "Minimum", variant: "fn", insert: "min(" },
  { label: "max", title: "Maximum", variant: "fn", insert: "max(" },
  { label: "sort", title: "Sort", variant: "fn", insert: "sort(" },
  { label: "gcd", title: "GCD", variant: "fn", insert: "gcd " },
  { label: "lcm", title: "LCM", variant: "fn", insert: "lcm " },
  { label: "prime?", title: "Is prime?", variant: "fn", insert: "is " },
];

const PHYSICS_BTNS: BtnDef[] = [
  { label: "Const.", title: "Physics constants", variant: "fn", action: "physics", physics: "constants" },
  { label: "Formulas", title: "Formula library", variant: "fn", action: "physics", physics: "formulas" },
  { label: "convert", title: "Unit conversion", variant: "fn", insert: "convert " },
  { label: "F=ma", title: "Newton's 2nd law", variant: "fn", insert: "F = m * a" },
  { label: "E=mc²", title: "Mass-energy equivalence", variant: "fn", insert: "m * c**2" },
  { label: "KE", title: "Kinetic energy", variant: "fn", insert: "(1/2)*m*v**2" },
  { label: "PE=mgh", title: "Gravitational PE", variant: "fn", insert: "m*g*h" },
  { label: "V=IR", title: "Ohm's law", variant: "fn", insert: "V = I * R" },
  { label: "pV=nRT", title: "Ideal gas law", variant: "fn", insert: "P*V = n*R*T" },
  { label: "λ=h/mv", title: "de Broglie wavelength", variant: "fn", insert: "h/(m*v)" },
  { label: "c", title: "Speed of light", variant: "fn", insert: "299792458" },
  { label: "G", title: "Gravitational constant", variant: "fn", insert: "6.674e-11" },
];

const MODE_BTNS: Record<KeypadMode, BtnDef[]> = {
  scientific: SCIENTIFIC_BTNS,
  calculus: CALCULUS_BTNS,
  matrix: MATRIX_BTNS,
  stats: STATS_BTNS,
  physics: PHYSICS_BTNS,
};

// Numeric keypad — always visible
const NUMERIC_BTNS: BtnDef[] = [
  { label: "AC", variant: "clear", action: "clear" },
  { label: <Delete className="w-4 h-4 mx-auto" />, title: "Delete", variant: "del", action: "del" },
  { label: "ANS", title: "Last answer", variant: "ans", action: "ans" },
  { label: "%", title: "Percent", variant: "util", insert: "%" },
  { label: "()", title: "Parentheses", variant: "util", action: "paren" },
  { label: "+/-", title: "Negate", variant: "util", action: "negate" },
  { label: "^", title: "Power", variant: "op", insert: "**" },
  { label: "√", title: "Square root", variant: "fn", insert: "sqrt(" },
  { label: "7", variant: "num", insert: "7" },
  { label: "8", variant: "num", insert: "8" },
  { label: "9", variant: "num", insert: "9" },
  { label: "÷", title: "Divide", variant: "op", insert: "/" },
  { label: "4", variant: "num", insert: "4" },
  { label: "5", variant: "num", insert: "5" },
  { label: "6", variant: "num", insert: "6" },
  { label: "×", title: "Multiply", variant: "op", insert: "*" },
  { label: "1", variant: "num", insert: "1" },
  { label: "2", variant: "num", insert: "2" },
  { label: "3", variant: "num", insert: "3" },
  { label: "−", title: "Minus", variant: "op", insert: "-" },
  { label: "0", variant: "num", insert: "0" },
  { label: ".", title: "Decimal", variant: "num", insert: "." },
  { label: <span className="flex items-center gap-1"><Equal className="w-4 h-4" />Solve</span>, title: "Solve", variant: "solve", action: "solve" },
  { label: "+", title: "Plus", variant: "op", insert: "+" },
];

const MEMORY_BTNS: Array<{ label: string; title: string; memAction: "MC" | "MR" | "MS" | "M+" | "M-" }> = [
  { label: "MC", title: "Memory Clear", memAction: "MC" },
  { label: "MR", title: "Memory Recall", memAction: "MR" },
  { label: "MS", title: "Memory Store", memAction: "MS" },
  { label: "M+", title: "Memory Add", memAction: "M+" },
  { label: "M−", title: "Memory Subtract", memAction: "M-" },
];

const MODE_TABS: { key: KeypadMode; label: string; symbol: string }[] = [
  { key: "scientific", label: "Sci", symbol: "ƒ" },
  { key: "calculus", label: "Calc", symbol: "∫" },
  { key: "matrix", label: "Matrix", symbol: "M" },
  { key: "stats", label: "Stats", symbol: "σ" },
  { key: "physics", label: "Physics", symbol: "⚛" },
];

// ─── Single button ─────────────────────────────────────────────────────────

function CalcBtn({ def, onPress }: { def: BtnDef; onPress: (def: BtnDef) => void }) {
  return (
    <motion.button
      className={`calc-btn calc-btn-${def.variant}${def.wide ? " calc-btn-wide" : ""}`}
      onClick={() => onPress(def)}
      whileTap={{ scale: 0.88 }}
      title={def.title}
      aria-label={typeof def.label === "string" ? def.label : def.title}
    >
      <span className="calc-btn-inner">{def.label}</span>
    </motion.button>
  );
}

// ─── Main Keypad component ─────────────────────────────────────────────────

export function Keypad({ onSubmit }: { onSubmit: (expr: string) => void }) {
  const {
    expression, setExpression,
    insertAtCursor, lastAnswer,
    memory, memoryHasValue,
    memoryStore, memoryRecall, memoryClear, memoryAdd, memorySub,
    currentResult,
    keypadMode, setKeypadMode,
    setOpenBuilder, setShowPhysicsPanel,
  } = useCalculatorStore();

  const getNumericValue = useCallback((): number => {
    if (currentResult?.result_numeric) {
      const n = parseFloat(currentResult.result_numeric);
      if (!isNaN(n)) return n;
    }
    if (currentResult?.result) {
      const n = parseFloat(currentResult.result);
      if (!isNaN(n)) return n;
    }
    const n = parseFloat(expression);
    return isNaN(n) ? 0 : n;
  }, [currentResult, expression]);

  const handlePress = useCallback((def: BtnDef) => {
    if (def.insert !== undefined) {
      insertAtCursor(def.insert);
      return;
    }
    switch (def.action) {
      case "clear":
        setExpression("");
        break;
      case "del": {
        setExpression(expression.slice(0, -1));
        break;
      }
      case "solve":
        if (expression.trim()) onSubmit(expression.trim());
        break;
      case "ans":
        if (lastAnswer) insertAtCursor(lastAnswer);
        break;
      case "negate": {
        const trimmed = expression.trim();
        if (trimmed.startsWith("-")) {
          setExpression(trimmed.slice(1));
        } else if (trimmed) {
          setExpression(`-(${trimmed})`);
        }
        break;
      }
      case "paren": {
        // smart: count open vs close, insert whichever is needed
        let open = 0;
        for (const ch of expression) {
          if (ch === "(") open++;
          if (ch === ")") open--;
        }
        insertAtCursor(open > 0 ? ")" : "(");
        break;
      }
      case "builder":
        if (def.builder) setOpenBuilder(def.builder);
        break;
      case "physics":
        if (def.physics) setShowPhysicsPanel(def.physics);
        break;
    }
  }, [expression, insertAtCursor, setExpression, lastAnswer, onSubmit, setOpenBuilder, setShowPhysicsPanel]);

  const handleMemory = useCallback((action: string) => {
    const val = getNumericValue();
    switch (action) {
      case "MC": memoryClear(); break;
      case "MR": insertAtCursor(String(memoryRecall())); break;
      case "MS": memoryStore(val); break;
      case "M+": memoryAdd(val); break;
      case "M-": memorySub(val); break;
    }
  }, [getNumericValue, memoryClear, memoryRecall, memoryStore, memoryAdd, memorySub, insertAtCursor]);

  const modeBtns = MODE_BTNS[keypadMode];

  return (
    <div className="keypad-shell">
      {/* Memory bar */}
      <div className="keypad-memory-bar">
        {MEMORY_BTNS.map((btn) => (
          <button
            key={btn.memAction}
            className={`keypad-mem-btn ${memoryHasValue && (btn.memAction === "MR" || btn.memAction === "MC") ? "active" : ""}`}
            onClick={() => handleMemory(btn.memAction)}
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
        {memoryHasValue && (
          <span className="keypad-mem-value" title={`Memory: ${memory}`}>
            M={memory.toPrecision(4)}
          </span>
        )}
      </div>

      {/* Mode tabs */}
      <div className="keypad-mode-tabs" role="tablist">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={keypadMode === tab.key}
            className={`keypad-tab ${keypadMode === tab.key ? "active" : ""}`}
            onClick={() => setKeypadMode(tab.key)}
          >
            <span className="keypad-tab-sym">{tab.symbol}</span>
            <span className="keypad-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Function grid */}
      <div className={`keypad-fn-grid keypad-fn-grid-${keypadMode}`}>
        {modeBtns.map((btn, i) => (
          <CalcBtn key={i} def={btn} onPress={handlePress} />
        ))}
      </div>

      {/* Numeric grid */}
      <div className="keypad-num-grid">
        {NUMERIC_BTNS.map((btn, i) => (
          <CalcBtn key={i} def={btn} onPress={handlePress} />
        ))}
      </div>
    </div>
  );
}
