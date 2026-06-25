"use client";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Hash, ChartLine, Sigma } from "lucide-react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import type { CalculateResponse } from "@/types/math";
import { StepByStep } from "./StepByStep";
import { ExportOptions } from "./ExportOptions";
import { GraphDisplay } from "./GraphDisplay";
import { generateGraph } from "@/lib/api";
import { useEffect, useState } from "react";
import type { GraphData } from "@/types/math";

interface Props {
  result: CalculateResponse;
  autoGraph?: boolean;
}

const OPERATION_LABELS: Record<string, string> = {
  solve: "Equation Solved",
  derivative: "Derivative",
  integrate: "Integral",
  indefinite_integral: "Indefinite Integral",
  definite_integral: "Definite Integral",
  limit: "Limit",
  series: "Series Expansion",
  laplace: "Laplace Transform",
  factor: "Factored Form",
  expand: "Expanded Form",
  simplify: "Simplified",
  evaluate: "Result",
  matrix_eigenvalues: "Eigenvalues",
  matrix_eigenvectors: "Eigenvectors",
  matrix_det: "Determinant",
  matrix_inverse: "Inverse Matrix",
  matrix_rref: "Row Reduced Form",
  matrix_trace: "Trace",
  matrix_transpose: "Transposed Matrix",
  stats_mean: "Mean",
  stats_median: "Median",
  stats_std: "Standard Deviation",
  stats_variance: "Variance",
  stats_summary: "Statistical Summary",
  unit_conversion: "Unit Conversion",
  physics: "Physics Result",
  ode: "ODE Solution",
};

function SafeBlock({ math }: { math: string }) {
  try {
    return <BlockMath math={math} />;
  } catch {
    return <code className="font-mono text-gray-800">{math}</code>;
  }
}

function SafeInline({ math }: { math: string }) {
  try {
    return <InlineMath math={math} />;
  } catch {
    return <code className="font-mono text-sm">{math}</code>;
  }
}

function isPlottable(operation: string, expression: string): boolean {
  const plottable = ["evaluate", "derivative", "integrate", "simplify", "expand", "factor"];
  return plottable.includes(operation) && !!expression && !expression.includes("[[");
}

export function ResultDisplay({ result, autoGraph = true }: Props) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  const operationLabel = OPERATION_LABELS[result.operation] || result.operation;

  // Auto-generate graph for function expressions
  useEffect(() => {
    if (!autoGraph || !result.success) return;
    const expr = result.parsed?.expression;
    if (!expr || !isPlottable(result.operation, expr)) return;

    setGraphLoading(true);
    generateGraph({ expression: expr, graph_type: "2d", x_range: [-10, 10] })
      .then((res) => {
        if (res.success && res.graph_json) {
          setGraphData(res.graph_json);
        }
      })
      .catch(() => {})
      .finally(() => setGraphLoading(false));
  }, [result, autoGraph]);

  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-3"
      >
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 text-sm">Computation Error</p>
          <p className="text-sm text-red-600 mt-1">{result.error || "Unable to compute the result."}</p>
          <p className="text-xs text-red-400 mt-2">Check your expression syntax and try again.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {/* Result header card */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
        {/* Top bar */}
        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">{operationLabel}</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">{result.operation}</span>
        </div>

        {/* Main result */}
        <div className="px-5 py-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Answer</p>

          {result.result_latex ? (
            <div className="overflow-x-auto">
              <SafeBlock math={result.result_latex} />
            </div>
          ) : (
            <code className="block text-xl font-mono text-gray-900">{result.result}</code>
          )}

          {/* Numeric approximation */}
          {result.result_numeric &&
            result.result_numeric !== result.result &&
            !result.result_numeric.includes("None") && (
              <div className="mt-4 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Numeric:</span>
                <code className="text-sm font-mono text-gray-700">{result.result_numeric}</code>
              </div>
            )}
        </div>

        {/* Export options */}
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
          <ExportOptions result={result} />
        </div>
      </div>

      {/* Graph */}
      {(graphData || graphLoading) && (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <ChartLine className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Graph</span>
          </div>
          {graphLoading ? (
            <div className="flex items-center justify-center h-48 bg-gray-50">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                Generating graph…
              </div>
            </div>
          ) : (
            graphData && <GraphDisplay data={graphData} height={350} />
          )}
        </div>
      )}

      {/* Step-by-step */}
      {result.steps && result.steps.length > 0 && (
        <StepByStep steps={result.steps} operation={result.operation} />
      )}

      {/* Debug: parsed operation */}
      {result.parsed && (
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer select-none hover:text-gray-600">Parsed operation</summary>
          <pre className="mt-2 bg-gray-50 rounded-xl p-3 overflow-x-auto font-mono text-[11px]">
            {JSON.stringify(result.parsed, null, 2)}
          </pre>
        </details>
      )}
    </motion.div>
  );
}
