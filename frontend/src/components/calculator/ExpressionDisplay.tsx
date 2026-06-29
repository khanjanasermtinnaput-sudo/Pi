"use client";
import { useRef, useEffect, KeyboardEvent, useCallback } from "react";
import { motion } from "framer-motion";
import { Delete, CornerDownLeft, ChevronUp, ChevronDown } from "lucide-react";
import { useCalculatorStore } from "@/store/calculatorStore";

interface Props {
  onSubmit: (input: string) => void;
  loading: boolean;
  onHistoryPrev: () => void;
  onHistoryNext: () => void;
}

function matchBrackets(text: string): { balanced: boolean; depth: number } {
  let depth = 0;
  for (const ch of text) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (depth < 0) return { balanced: false, depth };
  }
  return { balanced: depth === 0, depth };
}

export function ExpressionDisplay({ onSubmit, loading, onHistoryPrev, onHistoryNext }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Persist cursor position across blur (keypad button clicks blur the textarea)
  const savedCursor = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const { expression, setExpression, pendingInsert, clearPendingInsert } = useCalculatorStore();

  const saveCursor = () => {
    const ta = textareaRef.current;
    if (ta) {
      savedCursor.current = { start: ta.selectionStart, end: ta.selectionEnd };
    }
  };

  // Handle pending inserts from keypad buttons
  useEffect(() => {
    if (!pendingInsert) return;
    // Use saved cursor (from last textarea interaction) instead of live selectionStart
    // which resets to 0 when the textarea is blurred
    const start = savedCursor.current.start;
    const end = savedCursor.current.end;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const newExpr = expression.slice(0, start) + pendingInsert.text + expression.slice(end);
    setExpression(newExpr);
    const newCursor = start + pendingInsert.text.length;
    savedCursor.current = { start: newCursor, end: newCursor };
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(newCursor, newCursor);
      }
    });
    clearPendingInsert();
  }, [pendingInsert]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea; sync saved cursor to end when expression changes externally
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.max(56, Math.min(ta.scrollHeight, 160)) + "px";
    // If the textarea is not focused (keypad-driven change), keep cursor at end
    if (document.activeElement !== ta) {
      savedCursor.current = { start: expression.length, end: expression.length };
    }
  }, [expression]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === "ArrowUp" && !e.shiftKey) {
      const ta = textareaRef.current;
      if (ta && ta.selectionStart === 0) {
        e.preventDefault();
        onHistoryPrev();
        return;
      }
    }
    if (e.key === "ArrowDown" && !e.shiftKey) {
      const ta = textareaRef.current;
      if (ta && ta.selectionStart === ta.value.length) {
        e.preventDefault();
        onHistoryNext();
        return;
      }
    }
    if (e.key === "Escape") {
      setExpression("");
    }
  };

  const handleSubmit = useCallback(() => {
    if (!expression.trim() || loading) return;
    onSubmit(expression.trim());
  }, [expression, loading, onSubmit]);

  const { balanced, depth } = matchBrackets(expression);
  const bracketStatus = expression.length === 0 ? null : balanced ? "ok" : depth > 0 ? "open" : "error";

  return (
    <div className="calc-display-shell">
      {/* Screen bezel */}
      <div className="calc-display-bezel">
        {/* Top row: label + bracket indicator */}
        <div className="calc-display-topbar">
          <span className="calc-display-label">Expression</span>
          <div className="calc-display-indicators">
            {bracketStatus === "open" && (
              <span className="calc-bracket-hint">+{depth} bracket{depth > 1 ? "s" : ""}</span>
            )}
            {bracketStatus === "error" && (
              <span className="calc-bracket-error">Bracket mismatch</span>
            )}
            {bracketStatus === "ok" && expression && (
              <span className="calc-bracket-ok">✓</span>
            )}
          </div>
        </div>

        {/* Main textarea */}
        <div className="calc-display-screen">
          <textarea
            ref={textareaRef}
            value={expression}
            onChange={(e) => { setExpression(e.target.value); saveCursor(); }}
            onKeyDown={handleKeyDown}
            onKeyUp={saveCursor}
            onClick={saveCursor}
            onSelect={saveCursor}
            onBlur={saveCursor}
            placeholder="Type expression or use keypad…"
            className="calc-display-textarea"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            rows={1}
            aria-label="Math expression input"
          />
        </div>

        {/* Bottom bar: hints + actions */}
        <div className="calc-display-bottombar">
          <div className="calc-display-hints">
            <span>Enter ↵ to solve</span>
            <span className="calc-hint-sep">·</span>
            <span>↑↓ history</span>
            <span className="calc-hint-sep">·</span>
            <span>Esc clear</span>
          </div>
          <div className="calc-display-btns">
            <button
              onClick={() => onHistoryPrev()}
              className="calc-display-nav-btn"
              aria-label="Previous history"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onHistoryNext()}
              className="calc-display-nav-btn"
              aria-label="Next history"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpression("")}
              className="calc-display-clear-btn"
              disabled={!expression}
              aria-label="Clear expression"
            >
              <Delete className="w-3.5 h-3.5" />
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={!expression.trim() || loading}
              className="calc-solve-btn"
              whileTap={{ scale: 0.95 }}
              aria-label="Solve"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Solving…</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Solve</span>
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
