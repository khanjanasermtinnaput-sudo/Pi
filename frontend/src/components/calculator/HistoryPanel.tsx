"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Pin, PinOff, Trash2, Search, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useCalculatorStore } from "@/store/calculatorStore";

interface Props {
  onSelect: (input: string) => void;
  onRerun: (input: string) => void;
}

export function HistoryPanel({ onSelect, onRerun }: Props) {
  const { history, togglePin, removeFromHistory, clearHistory, setExpression } = useCalculatorStore();
  const [search, setSearch] = useState("");

  const filtered = history.filter((item) =>
    item.input.toLowerCase().includes(search.toLowerCase()) ||
    item.result?.result?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((h) => h.pinned);
  const recent = filtered.filter((h) => !h.pinned);

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <Clock className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">No history yet</p>
        <p className="text-xs text-gray-300 mt-1">Calculations will appear here</p>
      </div>
    );
  }

  return (
    <div className="history-shell">
      {/* Header */}
      <div className="history-header">
        <div className="history-header-left">
          <Clock className="w-4 h-4" />
          <span>History</span>
          <span className="history-count">{history.length}</span>
        </div>
        <button
          onClick={() => clearHistory()}
          className="history-clear-btn"
          title="Clear all history"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search */}
      {history.length > 4 && (
        <div className="history-search-wrap">
          <Search className="w-3.5 h-3.5 history-search-icon" />
          <input
            className="history-search"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="history-search-clear">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Items */}
      <div className="history-list">
        {pinned.length > 0 && (
          <p className="history-section-label">
            <Pin className="w-3 h-3" /> Pinned
          </p>
        )}

        <AnimatePresence initial={false}>
          {pinned.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onRerun={onRerun}
              onPin={togglePin}
              onRemove={removeFromHistory}
              onLoad={() => setExpression(item.input)}
            />
          ))}
        </AnimatePresence>

        {recent.length > 0 && pinned.length > 0 && (
          <p className="history-section-label">
            <Clock className="w-3 h-3" /> Recent
          </p>
        )}

        <AnimatePresence initial={false}>
          {recent.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onRerun={onRerun}
              onPin={togglePin}
              onRemove={removeFromHistory}
              onLoad={() => setExpression(item.input)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HistoryItem({
  item,
  onSelect,
  onRerun,
  onPin,
  onRemove,
  onLoad,
}: {
  item: ReturnType<typeof useCalculatorStore.getState>["history"][number];
  onSelect: (input: string) => void;
  onRerun: (input: string) => void;
  onPin: (id: string) => void;
  onRemove: (id: string) => void;
  onLoad: () => void;
}) {
  const shortResult = item.result?.result?.slice(0, 30) ?? "";
  const ts = new Date(item.timestamp);
  const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      className={`history-item ${item.pinned ? "pinned" : ""}`}
    >
      <button className="history-item-main" onClick={onLoad} title="Load into expression">
        <div className="history-item-status">
          {item.result.success ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          )}
        </div>
        <div className="history-item-content">
          <code className="history-item-input">{item.input}</code>
          {item.result.success && shortResult && (
            <span className="history-item-result">= {shortResult}{item.result?.result && item.result.result.length > 30 ? "…" : ""}</span>
          )}
          <span className="history-item-time">{timeStr}</span>
        </div>
      </button>

      <div className="history-item-actions">
        <button
          onClick={() => onPin(item.id)}
          className={`history-action-btn ${item.pinned ? "active" : ""}`}
          title={item.pinned ? "Unpin" : "Pin"}
        >
          {item.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
        <button
          onClick={() => onRerun(item.input)}
          className="history-action-btn"
          title="Re-run"
        >
          ↻
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="history-action-btn history-action-del"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
