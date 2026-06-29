"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { useCalculatorStore } from "@/store/calculatorStore";

// ─── Shared modal shell ─────────────────────────────────────────────────────

function BuilderModal({
  title,
  icon,
  onClose,
  onInsert,
  children,
}: {
  title: string;
  icon: string;
  onClose: () => void;
  onInsert: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onInsert();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onInsert]);

  return (
    <motion.div
      className="builder-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="builder-modal"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="builder-header">
          <div className="builder-title">
            <span className="builder-icon">{icon}</span>
            <span>{title}</span>
          </div>
          <button onClick={onClose} className="builder-close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="builder-body">{children}</div>
        <div className="builder-footer">
          <button onClick={onClose} className="builder-cancel-btn">Cancel</button>
          <button onClick={onInsert} className="builder-insert-btn">
            Insert → Expression
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="builder-field">
      <label className="builder-field-label">{label}</label>
      <input
        className="builder-field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="builder-field">
      <label className="builder-field-label">{label}</label>
      <select className="builder-field-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Integral Builder ────────────────────────────────────────────────────────

function IntegralBuilder({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("x**2");
  const [variable, setVariable] = useState("x");
  const [lower, setLower] = useState("");
  const [upper, setUpper] = useState("");
  const { setExpression, setCurrentResult } = useCalculatorStore();

  const preview = lower && upper
    ? `integrate ${expr} from ${lower} to ${upper} d${variable}`
    : `integrate ${expr}`;

  const handleInsert = () => {
    setExpression(preview);
    setCurrentResult(null);
    onClose();
  };

  return (
    <BuilderModal title="Integral Builder" icon="∫" onClose={onClose} onInsert={handleInsert}>
      <Field label="Expression f(x)" value={expr} onChange={setExpr} placeholder="e.g. x**2 * sin(x)" />
      <Field label="Variable" value={variable} onChange={setVariable} placeholder="x" />
      <div className="builder-row">
        <Field label="Lower Bound (optional)" value={lower} onChange={setLower} placeholder="0" />
        <Field label="Upper Bound (optional)" value={upper} onChange={setUpper} placeholder="pi" />
      </div>
      <div className="builder-preview">
        <span className="builder-preview-label">Expression preview:</span>
        <code className="builder-preview-code">{preview}</code>
      </div>
    </BuilderModal>
  );
}

// ─── Limit Builder ───────────────────────────────────────────────────────────

function LimitBuilder({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("sin(x)/x");
  const [variable, setVariable] = useState("x");
  const [approach, setApproach] = useState("0");
  const [direction, setDirection] = useState("both");
  const { setExpression, setCurrentResult } = useCalculatorStore();

  const dirStr = direction === "left" ? " from left" : direction === "right" ? " from right" : "";
  const preview = `limit of ${expr} as ${variable} approaches ${approach}${dirStr}`;

  const handleInsert = () => {
    setExpression(preview);
    setCurrentResult(null);
    onClose();
  };

  return (
    <BuilderModal title="Limit Builder" icon="lim" onClose={onClose} onInsert={handleInsert}>
      <Field label="Expression" value={expr} onChange={setExpr} placeholder="e.g. sin(x)/x" />
      <div className="builder-row">
        <Field label="Variable" value={variable} onChange={setVariable} placeholder="x" />
        <Field label="Approaches" value={approach} onChange={setApproach} placeholder="0, oo, pi…" />
      </div>
      <Select
        label="Direction"
        value={direction}
        onChange={setDirection}
        options={[
          { value: "both", label: "Both sides (±)" },
          { value: "left", label: "From left (−)" },
          { value: "right", label: "From right (+)" },
        ]}
      />
      <div className="builder-preview">
        <span className="builder-preview-label">Expression preview:</span>
        <code className="builder-preview-code">{preview}</code>
      </div>
    </BuilderModal>
  );
}

// ─── Derivative Builder ──────────────────────────────────────────────────────

function DerivativeBuilder({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("x**3 * sin(x)");
  const [variable, setVariable] = useState("x");
  const [order, setOrder] = useState("1");
  const { setExpression, setCurrentResult } = useCalculatorStore();

  const preview =
    order === "1"
      ? `differentiate ${expr} with respect to ${variable}`
      : `differentiate ${expr} with respect to ${variable} order ${order}`;

  const handleInsert = () => {
    setExpression(preview);
    setCurrentResult(null);
    onClose();
  };

  return (
    <BuilderModal title="Derivative Builder" icon="d/dx" onClose={onClose} onInsert={handleInsert}>
      <Field label="Expression f(x)" value={expr} onChange={setExpr} placeholder="e.g. x**3 * sin(x)" />
      <div className="builder-row">
        <Field label="Variable" value={variable} onChange={setVariable} placeholder="x" />
        <Select
          label="Order"
          value={order}
          onChange={setOrder}
          options={[
            { value: "1", label: "1st derivative" },
            { value: "2", label: "2nd derivative" },
            { value: "3", label: "3rd derivative" },
            { value: "4", label: "4th derivative" },
          ]}
        />
      </div>
      <div className="builder-preview">
        <span className="builder-preview-label">Expression preview:</span>
        <code className="builder-preview-code">{preview}</code>
      </div>
    </BuilderModal>
  );
}

// ─── Matrix Builder ───────────────────────────────────────────────────────────

function MatrixBuilder({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [cells, setCells] = useState<string[][]>([["1", "0"], ["0", "1"]]);
  const [action, setAction] = useState<"eigenvalues" | "det" | "inverse" | "raw">("raw");
  const { setExpression, setCurrentResult } = useCalculatorStore();

  // Resize grid when rows/cols change
  useEffect(() => {
    setCells((prev) =>
      Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => prev[r]?.[c] ?? "0")
      )
    );
  }, [rows, cols]);

  const matrixStr = `[${cells.map((row) => `[${row.join(",")}]`).join(",")}]`;

  const preview =
    action === "eigenvalues" ? `eigenvalues of ${matrixStr}` :
    action === "det" ? `det ${matrixStr}` :
    action === "inverse" ? `inverse of ${matrixStr}` :
    matrixStr;

  const handleInsert = () => {
    setExpression(preview);
    setCurrentResult(null);
    onClose();
  };

  const updateCell = (r: number, c: number, v: string) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = v;
      return next;
    });
  };

  return (
    <BuilderModal title="Matrix Builder" icon="M" onClose={onClose} onInsert={handleInsert}>
      <div className="builder-row">
        <div className="builder-field">
          <label className="builder-field-label">Rows</label>
          <div className="builder-stepper">
            <button onClick={() => setRows(Math.max(1, rows - 1))}><Minus className="w-3 h-3" /></button>
            <span>{rows}</span>
            <button onClick={() => setRows(Math.min(6, rows + 1))}><Plus className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="builder-field">
          <label className="builder-field-label">Columns</label>
          <div className="builder-stepper">
            <button onClick={() => setCols(Math.max(1, cols - 1))}><Minus className="w-3 h-3" /></button>
            <span>{cols}</span>
            <button onClick={() => setCols(Math.min(6, cols + 1))}><Plus className="w-3 h-3" /></button>
          </div>
        </div>
      </div>

      <div className="builder-matrix-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {cells.map((row, r) =>
          row.map((val, c) => (
            <input
              key={`${r}-${c}`}
              className="builder-matrix-cell"
              value={val}
              onChange={(e) => updateCell(r, c, e.target.value)}
              placeholder="0"
            />
          ))
        )}
      </div>

      <Select
        label="Operation"
        value={action}
        onChange={(v) => setAction(v as typeof action)}
        options={[
          { value: "raw", label: "Insert matrix only" },
          { value: "eigenvalues", label: "Eigenvalues" },
          { value: "det", label: "Determinant" },
          { value: "inverse", label: "Inverse" },
        ]}
      />

      <div className="builder-preview">
        <span className="builder-preview-label">Expression preview:</span>
        <code className="builder-preview-code">{preview}</code>
      </div>
    </BuilderModal>
  );
}

// ─── Physics Panels ─────────────────────────────────────────────────────────

const CONSTANTS = [
  { symbol: "c", name: "Speed of light", value: "299792458", unit: "m/s" },
  { symbol: "G", name: "Gravitational constant", value: "6.67430e-11", unit: "N·m²/kg²" },
  { symbol: "h", name: "Planck constant", value: "6.62607015e-34", unit: "J·s" },
  { symbol: "k_B", name: "Boltzmann constant", value: "1.380649e-23", unit: "J/K" },
  { symbol: "N_A", name: "Avogadro number", value: "6.02214076e23", unit: "mol⁻¹" },
  { symbol: "e", name: "Elementary charge", value: "1.602176634e-19", unit: "C" },
  { symbol: "m_e", name: "Electron mass", value: "9.1093837015e-31", unit: "kg" },
  { symbol: "m_p", name: "Proton mass", value: "1.67262192369e-27", unit: "kg" },
  { symbol: "R", name: "Gas constant", value: "8.314462618", unit: "J/(mol·K)" },
  { symbol: "ε₀", name: "Vacuum permittivity", value: "8.8541878128e-12", unit: "F/m" },
  { symbol: "μ₀", name: "Vacuum permeability", value: "1.25663706212e-6", unit: "N/A²" },
  { symbol: "σ", name: "Stefan–Boltzmann", value: "5.670374419e-8", unit: "W/(m²·K⁴)" },
];

const FORMULAS = [
  { name: "Newton's 2nd Law", expr: "F = m * a", insert: "F = m * a" },
  { name: "Kinetic Energy", expr: "KE = (1/2) * m * v**2", insert: "(1/2) * m * v**2" },
  { name: "Gravitational PE", expr: "PE = m * g * h", insert: "m * g * h" },
  { name: "Ohm's Law", expr: "V = I * R", insert: "V = I * R" },
  { name: "Coulomb's Law", expr: "F = k*q1*q2/r**2", insert: "k * q1 * q2 / r**2" },
  { name: "Wave speed", expr: "v = f * λ", insert: "f * wavelength" },
  { name: "E = mc²", expr: "E = m * c**2", insert: "m * c**2" },
  { name: "Ideal Gas Law", expr: "P * V = n * R * T", insert: "P * V = n * R * T" },
  { name: "de Broglie", expr: "λ = h / (m * v)", insert: "h / (m * v)" },
  { name: "Schrödinger (simple)", expr: "E * ψ = H * ψ", insert: "E * psi = H * psi" },
];

function PhysicsPanel({ onClose }: { onClose: () => void }) {
  const { showPhysicsPanel, setShowPhysicsPanel, insertAtCursor } = useCalculatorStore();
  const [search, setSearch] = useState("");

  const filteredConstants = CONSTANTS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFormulas = FORMULAS.filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="builder-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="builder-modal builder-modal-wide"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="builder-header">
          <div className="builder-title">
            <span className="builder-icon">⚛</span>
            <span>Physics {showPhysicsPanel === "constants" ? "Constants" : "Formulas"}</span>
          </div>
          <button onClick={onClose} className="builder-close"><X className="w-4 h-4" /></button>
        </div>

        <div className="builder-tab-row">
          <button
            className={`builder-tab ${showPhysicsPanel === "constants" ? "active" : ""}`}
            onClick={() => setShowPhysicsPanel("constants")}
          >Constants</button>
          <button
            className={`builder-tab ${showPhysicsPanel === "formulas" ? "active" : ""}`}
            onClick={() => setShowPhysicsPanel("formulas")}
          >Formulas</button>
        </div>

        <div className="builder-body">
          <input
            className="builder-search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {showPhysicsPanel === "constants" ? (
            <div className="builder-list">
              {filteredConstants.map((c) => (
                <button
                  key={c.symbol}
                  className="builder-list-item"
                  onClick={() => { insertAtCursor(c.value); onClose(); }}
                >
                  <span className="builder-list-symbol">{c.symbol}</span>
                  <span className="builder-list-name">{c.name}</span>
                  <span className="builder-list-value">{c.value}</span>
                  <span className="builder-list-unit">{c.unit}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="builder-list">
              {filteredFormulas.map((f) => (
                <button
                  key={f.name}
                  className="builder-list-item"
                  onClick={() => { insertAtCursor(f.insert); onClose(); }}
                >
                  <span className="builder-list-name">{f.name}</span>
                  <code className="builder-list-formula">{f.expr}</code>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export function FormulaBuilders() {
  const { openBuilder, setOpenBuilder, showPhysicsPanel, setShowPhysicsPanel } = useCalculatorStore();

  return (
    <AnimatePresence>
      {openBuilder === "integral" && (
        <IntegralBuilder key="integral" onClose={() => setOpenBuilder(null)} />
      )}
      {openBuilder === "limit" && (
        <LimitBuilder key="limit" onClose={() => setOpenBuilder(null)} />
      )}
      {openBuilder === "derivative" && (
        <DerivativeBuilder key="derivative" onClose={() => setOpenBuilder(null)} />
      )}
      {openBuilder === "matrix" && (
        <MatrixBuilder key="matrix" onClose={() => setOpenBuilder(null)} />
      )}
      {showPhysicsPanel && (
        <PhysicsPanel
          key="physics"
          onClose={() => setShowPhysicsPanel(null)}
        />
      )}
    </AnimatePresence>
  );
}
