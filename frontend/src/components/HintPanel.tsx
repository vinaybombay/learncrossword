import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PuzzleClue } from '../types';
import { getHint } from '../utils/hintUtils';

interface HintPanelProps {
  clue: PuzzleClue;
  /** Currently revealed hint level (0 = none). Owned by DailyPuzzle parent. */
  revealedLevel: 0 | 1 | 2 | 3;
  /** Called when user reveals a hint. Parent updates its hintsUsed map. */
  onHintUsed: (clueKey: string, level: 1 | 2 | 3) => void;
}

const LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Clue type explained',
  2: 'Structure revealed',
  3: 'First letter shown',
};

const HintPanel: React.FC<HintPanelProps> = ({ clue, revealedLevel, onHintUsed }) => {
  const [isOpen, setIsOpen] = useState(revealedLevel > 0);

  const clueKey = `${clue.number}-${clue.direction}`;

  const handleReveal = (level: 1 | 2 | 3) => {
    onHintUsed(clueKey, level);
    setIsOpen(true);
  };

  return (
    <div className="mb-5">
      {/* ── Trigger bar ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="hint-panel-body"
        className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-base">💡</span>
          <span className="text-sm font-semibold text-amber-800">Hints</span>
          {revealedLevel > 0 && (
            <span className="text-xs text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
              {revealedLevel} of 3 revealed
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-amber-500 text-xs"
        >
          ▼
        </motion.span>
      </button>

      {/* ── Expanded panel ─────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="hint-panel-body"
            key="hint-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            aria-live="polite"
          >
            <div className="bg-amber-50 border border-amber-200 border-t-0 rounded-b-lg px-4 pb-4 pt-3 space-y-2">
              {/* ── Level 1 ─────────────────────────────────────────────────── */}
              {revealedLevel >= 1 ? (
                <HintCard level={1} text={getHint(clue, 1).text} />
              ) : (
                <UnrevealedCard
                  level={1}
                  label={LEVEL_LABELS[1]}
                  onReveal={() => handleReveal(1)}
                />
              )}

              {/* ── Level 2 (only if level 1 revealed) ──────────────────────── */}
              {revealedLevel >= 1 && (
                revealedLevel >= 2 ? (
                  <HintCard level={2} text={getHint(clue, 2).text} />
                ) : (
                  <UnrevealedCard
                    level={2}
                    label={LEVEL_LABELS[2]}
                    onReveal={() => handleReveal(2)}
                    showCost
                  />
                )
              )}

              {/* ── Level 3 (only if level 2 revealed) ──────────────────────── */}
              {revealedLevel >= 2 && (
                revealedLevel >= 3 ? (
                  <HintCard level={3} text={getHint(clue, 3).text} />
                ) : (
                  <UnrevealedCard
                    level={3}
                    label={LEVEL_LABELS[3]}
                    onReveal={() => handleReveal(3)}
                    showCost
                  />
                )
              )}

              {revealedLevel === 3 && (
                <p className="text-xs text-amber-500 text-center pt-1">
                  All hints revealed for this clue.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const LEVEL_BADGE = ['', 'H1', 'H2', 'H3'] as const;

const HintCard: React.FC<{ level: 1 | 2 | 3; text: string }> = ({ level, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-3"
  >
    <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 mt-0.5">
      {LEVEL_BADGE[level]}
    </span>
    <p className="text-sm text-slate-700 leading-relaxed flex-1">{text}</p>
    <span className="flex-shrink-0 text-emerald-500 text-sm mt-0.5">✓</span>
  </motion.div>
);

const UnrevealedCard: React.FC<{
  level: 1 | 2 | 3;
  label: string;
  onReveal: () => void;
  showCost?: boolean;
}> = ({ level, label, onReveal, showCost }) => (
  <div className="flex items-center justify-between border border-dashed border-amber-300 rounded-lg px-3 py-2.5">
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-400 border border-amber-200">
        {LEVEL_BADGE[level]}
      </span>
      <span className="text-sm text-amber-700 font-medium">{label}</span>
    </div>
    <button
      onClick={onReveal}
      className="flex-shrink-0 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-md hover:bg-amber-600 transition"
    >
      {showCost ? 'Reveal (uses hint)' : 'Reveal'}
    </button>
  </div>
);

export default HintPanel;
