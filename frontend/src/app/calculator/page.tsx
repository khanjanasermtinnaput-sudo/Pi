"use client";
import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { ExpressionDisplay } from "@/components/calculator/ExpressionDisplay";
import { Keypad } from "@/components/calculator/Keypad";
import { ResultDisplay } from "@/components/calculator/ResultDisplay";
import { HistoryPanel } from "@/components/calculator/HistoryPanel";
import { FormulaBuilders } from "@/components/calculator/FormulaBuilders";
import { calculate } from "@/lib/api";
import { useCalculatorStore } from "@/store/calculatorStore";

// ─── Theme Toggle ─────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="theme-toggle" style={{ width: 180 }} />;

  const current = theme ?? resolvedTheme ?? "light";

  return (
    <div className="theme-toggle" role="group" aria-label="Choose theme">
      {(["light", "dark", "high-contrast"] as const).map((t) => (
        <button
          key={t}
          className={`theme-toggle-btn ${current === t ? "active" : ""}`}
          onClick={() => setTheme(t)}
          aria-pressed={current === t}
        >
          {t === "light" ? "☀ Light" : t === "dark" ? "☾ Dark" : "◑ Contrast"}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const historyIndexRef = useRef<number>(-1);

  const {
    expression,
    setExpression,
    currentResult,
    setCurrentResult,
    setLastAnswer,
    addToHistory,
    history,
    showHistory,
    setShowHistory,
  } = useCalculatorStore();

  const handleSubmit = useCallback(
    async (input: string) => {
      if (!input.trim() || loading) return;
      setLoading(true);
      historyIndexRef.current = -1;
      try {
        const result = await calculate(input);
        setCurrentResult(result);
        addToHistory(input, result);
        if (result.success && result.result) {
          setLastAnswer(result.result_numeric ?? result.result);
        }
        if (!result.success) {
          toast.error(result.error ?? "Computation failed");
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
        setTimeout(
          () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
          100
        );
      }
    },
    [loading, setCurrentResult, setLastAnswer, addToHistory]
  );

  // History navigation: ↑/↓ keys in ExpressionDisplay
  const handleHistoryPrev = useCallback(() => {
    if (history.length === 0) return;
    const nextIdx = Math.min(historyIndexRef.current + 1, history.length - 1);
    historyIndexRef.current = nextIdx;
    setExpression(history[nextIdx].input);
  }, [history, setExpression]);

  const handleHistoryNext = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      historyIndexRef.current = -1;
      setExpression("");
      return;
    }
    const nextIdx = historyIndexRef.current - 1;
    historyIndexRef.current = nextIdx;
    setExpression(history[nextIdx].input);
  }, [history, setExpression]);

  const handleHistorySelect = useCallback(
    (input: string) => {
      setExpression(input);
    },
    [setExpression]
  );

  return (
    <div className="calc-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="calc-header">
        <div className="calc-header-inner">
          <div className="calc-header-left">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <a className="calc-header-logo" href="/calculator">
              <span>π</span>
              <span className="hidden sm:inline text-sm font-semibold" style={{ color: "var(--fg)" }}>
                Pi
              </span>
            </a>

            <div className="flex items-center gap-1.5">
              <div className="calc-status-dot" />
              <span className="text-xs text-gray-400 hidden md:inline">Online</span>
            </div>
          </div>

          <div className="calc-header-right">
            <ThemeToggle />
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors hidden sm:block"
            >
              API
            </a>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="calc-body">
        {/* Expression display — full width */}
        <ExpressionDisplay
          onSubmit={handleSubmit}
          loading={loading}
          onHistoryPrev={handleHistoryPrev}
          onHistoryNext={handleHistoryNext}
        />

        {/* Two-column layout */}
        <div className="calc-columns">
          {/* LEFT: Keypad */}
          <div className="flex flex-col gap-3">
            <Keypad onSubmit={handleSubmit} />

            {/* Mobile: history toggle */}
            <div className="lg:hidden">
              <button
                className="history-toggle-btn w-full"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Clock className="w-4 h-4" />
                <span>History ({history.length})</span>
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <HistoryPanel
                      onSelect={handleHistorySelect}
                      onRerun={handleSubmit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Result + History (desktop) */}
          <div className="flex flex-col gap-3">
            {/* Loading */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-16 gap-3 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.55, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Computing…</span>
                </motion.div>
              )}

              {!loading && currentResult && (
                <motion.div
                  key="result"
                  ref={resultRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResultDisplay result={currentResult} />
                </motion.div>
              )}

              {!loading && !currentResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center"
                >
                  <div className="text-6xl select-none">π</div>
                  <div>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      Ready to compute
                    </p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs">
                      Use the keypad or type any expression. Supports calculus,
                      algebra, matrices, stats, and physics.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-sm">
                    {[
                      "solve x**2 + 5x + 6 = 0",
                      "differentiate sin(x)**2",
                      "integrate x**2 from 0 to 1",
                      "eigenvalues of [[3,1],[1,3]]",
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => handleSubmit(ex)}
                        className="text-xs font-mono px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop history */}
            <div className="hidden lg:block">
              <HistoryPanel
                onSelect={handleHistorySelect}
                onRerun={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formula builder modals */}
      <FormulaBuilders />
    </div>
  );
}
