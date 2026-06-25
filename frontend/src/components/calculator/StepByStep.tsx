"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Step } from "@/types/math";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface Props {
  steps: Step[];
  operation: string;
}

function SafeLatex({ expr }: { expr: string }) {
  try {
    return <InlineMath math={expr} />;
  } catch {
    return <code className="text-sm font-mono">{expr}</code>;
  }
}

export function StepByStep({ steps, operation }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-semibold text-gray-800 text-sm">Step-by-step Solution</span>
          <span className="text-xs text-gray-400 ml-1">({steps.length} steps)</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-4"
                >
                  {/* Step number */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {step.index}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 bg-blue-100 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {step.latex && step.latex.trim() !== "" && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 overflow-x-auto">
                        <div className="text-center">
                          <SafeLatex expr={step.latex} />
                        </div>
                      </div>
                    )}
                    {step.expression && !step.latex && (
                      <code className="block text-sm font-mono text-gray-800 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        {step.expression}
                      </code>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
