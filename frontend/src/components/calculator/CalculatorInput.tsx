"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, ChevronDown } from "lucide-react";
import { EXAMPLE_INPUTS, type ExampleInput } from "@/types/math";

const CATEGORY_COLORS: Record<string, string> = {
  algebra: "text-blue-600 bg-blue-50",
  calculus: "text-purple-600 bg-purple-50",
  "linear-algebra": "text-green-600 bg-green-50",
  statistics: "text-orange-600 bg-orange-50",
  physics: "text-red-600 bg-red-50",
  graphing: "text-indigo-600 bg-indigo-50",
  "number-theory": "text-teal-600 bg-teal-50",
  complex: "text-pink-600 bg-pink-50",
};

const CATEGORY_LABELS: Record<string, string> = {
  algebra: "Algebra",
  calculus: "Calculus",
  "linear-algebra": "Linear Algebra",
  statistics: "Statistics",
  physics: "Physics",
  graphing: "Graphing",
  "number-theory": "Number Theory",
  complex: "Complex",
};

interface Props {
  onSubmit: (input: string) => void;
  loading: boolean;
}

export function CalculatorInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredExamples = EXAMPLE_INPUTS.filter(
    (e) => !selectedCategory || e.category === selectedCategory
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setShowSuggestions(false);
  };

  const handleExample = (example: ExampleInput) => {
    setValue(example.input);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  const categories = Array.from(new Set(EXAMPLE_INPUTS.map((e) => e.category)));

  return (
    <div className="w-full">
      {/* Main input */}
      <div className="relative bg-white border-2 border-gray-200 rounded-2xl transition-all duration-200 focus-within:border-gray-400 focus-within:shadow-lg">
        <div className="flex items-start gap-3 p-4">
          <Search className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type a math expression, equation, or natural language question…"
            className="flex-1 text-gray-900 placeholder-gray-400 text-base leading-relaxed resize-none outline-none font-sans min-h-[40px] max-h-[160px] bg-transparent"
            rows={1}
          />

          <button
            onClick={handleSubmit}
            disabled={!value.trim() || loading}
            className="flex-shrink-0 bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-1.5 mt-0.5"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Solving
              </span>
            ) : (
              <>
                Solve
                <ArrowUpRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Hint bar */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-xs text-gray-400">
          <span>Enter to solve · Shift+Enter for new line</span>
          <button
            className="ml-auto flex items-center gap-1 hover:text-gray-600 transition-colors"
            onClick={() => setShowSuggestions((v) => !v)}
          >
            Examples
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSuggestions ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Examples panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Category filter */}
            <div className="flex gap-2 p-3 border-b border-gray-100 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  !selectedCategory ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Examples list */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {filteredExamples.map((example) => (
                <button
                  key={example.input}
                  onClick={() => handleExample(example)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[example.category]}`}>
                        {CATEGORY_LABELS[example.category]}
                      </span>
                      <span className="font-mono text-sm text-gray-800 truncate">{example.input}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 hidden group-hover:block">{example.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
