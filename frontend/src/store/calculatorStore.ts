import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculateResponse } from "@/types/math";

export interface HistoryItem {
  id: string;
  input: string;
  result: CalculateResponse;
  timestamp: number;
  pinned: boolean;
}

export type Theme = "light" | "dark" | "high-contrast";
export type KeypadMode = "scientific" | "calculus" | "matrix" | "stats" | "physics";
export type BuilderType = "integral" | "limit" | "derivative" | "matrix" | null;

interface CalculatorStore {
  // Expression state
  expression: string;
  setExpression: (expr: string) => void;
  pendingInsert: { text: string; timestamp: number } | null;
  insertAtCursor: (text: string) => void;
  clearPendingInsert: () => void;

  // Results
  currentResult: CalculateResponse | null;
  setCurrentResult: (result: CalculateResponse | null) => void;
  lastAnswer: string;
  setLastAnswer: (ans: string) => void;

  // History
  history: HistoryItem[];
  addToHistory: (input: string, result: CalculateResponse) => void;
  togglePin: (id: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // Memory
  memory: number;
  memoryHasValue: boolean;
  memoryStore: (value: number) => void;
  memoryRecall: () => number;
  memoryClear: () => void;
  memoryAdd: (value: number) => void;
  memorySub: (value: number) => void;

  // UI state
  keypadMode: KeypadMode;
  setKeypadMode: (mode: KeypadMode) => void;
  openBuilder: BuilderType;
  setOpenBuilder: (builder: BuilderType) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showPhysicsPanel: "constants" | "formulas" | null;
  setShowPhysicsPanel: (panel: "constants" | "formulas" | null) => void;
}

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => ({
      expression: "",
      setExpression: (expr) => set({ expression: expr }),
      pendingInsert: null,
      insertAtCursor: (text) => set({ pendingInsert: { text, timestamp: Date.now() } }),
      clearPendingInsert: () => set({ pendingInsert: null }),

      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),
      lastAnswer: "",
      setLastAnswer: (ans) => set({ lastAnswer: ans }),

      history: [],
      addToHistory: (input, result) => {
        const item: HistoryItem = {
          id: Math.random().toString(36).slice(2),
          input,
          result,
          timestamp: Date.now(),
          pinned: false,
        };
        set((state) => {
          const unpinned = state.history.filter((h) => !h.pinned).slice(0, 47);
          const pinned = state.history.filter((h) => h.pinned);
          return { history: [...pinned, item, ...unpinned] };
        });
      },
      togglePin: (id) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, pinned: !h.pinned } : h
          ),
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),

      memory: 0,
      memoryHasValue: false,
      memoryStore: (value) => set({ memory: value, memoryHasValue: true }),
      memoryRecall: () => get().memory,
      memoryClear: () => set({ memory: 0, memoryHasValue: false }),
      memoryAdd: (value) =>
        set((state) => ({ memory: state.memory + value, memoryHasValue: true })),
      memorySub: (value) =>
        set((state) => ({ memory: state.memory - value, memoryHasValue: true })),

      keypadMode: "scientific",
      setKeypadMode: (mode) => set({ keypadMode: mode }),

      openBuilder: null,
      setOpenBuilder: (builder) => set({ openBuilder: builder }),
      showHistory: false,
      setShowHistory: (show) => set({ showHistory: show }),
      showPhysicsPanel: null,
      setShowPhysicsPanel: (panel) => set({ showPhysicsPanel: panel }),
    }),
    {
      name: "pi-calculator-v2",
      partialize: (state) => ({
        history: state.history.slice(0, 50),
        memory: state.memory,
        memoryHasValue: state.memoryHasValue,
        lastAnswer: state.lastAnswer,
        keypadMode: state.keypadMode,
      }),
    }
  )
);
