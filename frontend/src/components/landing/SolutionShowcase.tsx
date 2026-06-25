"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const SHOWCASES = [
  {
    input: "integrate x² · sin(x) from 0 to π",
    steps: [
      { step: "Apply integration by parts: ∫u·dv = uv − ∫v·du", expr: "Let u = x², dv = sin(x)dx" },
      { step: "First application: du = 2x dx, v = −cos(x)", expr: "= −x²cos(x) + 2∫x·cos(x)dx" },
      { step: "Second application of IBP", expr: "= −x²cos(x) + 2[x·sin(x) + cos(x)]" },
      { step: "Apply bounds [0, π]", expr: "= π² − 4" },
    ],
    result: "π² − 4 ≈ 5.8696",
    label: "Calculus",
  },
  {
    input: "eigenvalues of [[4,1],[2,3]]",
    steps: [
      { step: "Form characteristic polynomial: det(A − λI) = 0", expr: "det([[4−λ, 1],[2, 3−λ]]) = 0" },
      { step: "Expand: (4−λ)(3−λ) − 2 = 0", expr: "λ² − 7λ + 10 = 0" },
      { step: "Factor the quadratic", expr: "(λ − 5)(λ − 2) = 0" },
      { step: "Solve for eigenvalues", expr: "λ₁ = 5, λ₂ = 2" },
    ],
    result: "λ = 5, λ = 2",
    label: "Linear Algebra",
  },
];

export function SolutionShowcase() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Step-by-step. Every time.
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Not just an answer — a complete mathematical explanation that teaches you the method.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {SHOWCASES.map((showcase, i) => (
            <motion.div
              key={showcase.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{showcase.label}</span>
                <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Solved ✓</span>
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Input</p>
                <p className="font-mono text-sm text-gray-800">{showcase.input}</p>
              </div>

              {/* Steps */}
              <div className="px-5 py-4 space-y-3">
                {showcase.steps.map((s, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-600">{j + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{s.step}</p>
                      <p className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded-md">{s.expr}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Result */}
              <div className="px-5 py-4 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Result</span>
                </div>
                <span className="font-mono font-semibold text-blue-900 text-sm">{showcase.result}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
