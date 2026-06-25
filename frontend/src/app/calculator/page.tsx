"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CalculatorInput } from "@/components/calculator/CalculatorInput";
import { ResultDisplay } from "@/components/calculator/ResultDisplay";
import { calculate } from "@/lib/api";
import type { CalculateResponse } from "@/types/math";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  input: string;
  result: CalculateResponse;
  timestamp: Date;
}

const KEYBOARD_SHORTCUTS = [
  { keys: ["↑", "↓"], label: "Navigate history" },
  { keys: ["Enter"], label: "Solve" },
  { keys: ["Shift", "Enter"], label: "New line" },
  { keys: ["Ctrl", "K"], label: "Clear" },
];

export default function CalculatorPage() {
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CalculateResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (input: string) => {
    setLoading(true);
    setSelectedHistoryId(null);
    try {
      const result = await calculate(input);
      setCurrentResult(result);
      const item: HistoryItem = {
        id: Math.random().toString(36).slice(2),
        input,
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [item, ...prev.slice(0, 49)]);
      if (!result.success) {
        toast.error(result.error || "Computation failed");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Server unreachable";
      toast.error(`Error: ${message}`);
      setCurrentResult({
        success: false,
        operation: "error",
        input,
        steps: [],
        error: message,
      });
    } finally {
      setLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const displayedResult = selectedHistoryId
    ? history.find((h) => h.id === selectedHistoryId)?.result ?? currentResult
    : currentResult;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-gray-900">Universal Scientific Calculator</span>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            API Docs
          </a>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar: history */}
        {history.length > 0 && (
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">History</span>
              </div>
              <button
                onClick={() => {
                  setHistory([]);
                  setCurrentResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedHistoryId(item.id === selectedHistoryId ? null : item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    selectedHistoryId === item.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.result.success ? "bg-green-400" : "bg-red-400"}`} />
                    <span className="truncate font-mono text-xs">{item.input}</span>
                  </div>
                  <p className="text-[10px] opacity-50 mt-0.5 ml-3.5">
                    {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Input */}
          <CalculatorInput onSubmit={handleSubmit} loading={loading} />

          {/* Result */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-16 gap-3 text-gray-500"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
                <span className="text-sm">Computing…</span>
              </motion.div>
            )}

            {!loading && displayedResult && (
              <motion.div
                key="result"
                ref={resultRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultDisplay result={displayedResult} />
              </motion.div>
            )}

            {!loading && !displayedResult && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="text-5xl mb-4">∫</div>
                <p className="text-lg font-semibold text-gray-700 mb-2">Ready to solve</p>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Enter any mathematical expression, equation, or question. Use the examples dropdown to explore capabilities.
                </p>

                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  {["solve x² − 4 = 0", "differentiate x³·sin(x)", "integrate e^x from 0 to 1", "eigenvalues of [[3,1],[1,3]]"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => handleSubmit(ex)}
                      className="text-xs font-mono px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
