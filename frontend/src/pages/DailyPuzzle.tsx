import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { puzzleService } from '../services/puzzleService';
import { Puzzle, PuzzleClue, ClueType } from '../types';
import PuzzleGrid from '../components/PuzzleGrid';

// ── Clue type metadata ────────────────────────────────────────────────────────
const CLUE_TYPE_META: Record<ClueType, { label: string; color: string; bg: string }> = {
  ANAG: { label: 'anagram',      color: 'text-orange-700', bg: 'bg-orange-100' },
  HID:  { label: 'hidden',       color: 'text-green-700',  bg: 'bg-green-100'  },
  HIDR: { label: 'hidden↩',      color: 'text-teal-700',   bg: 'bg-teal-100'   },
  SND:  { label: 'sounds like',  color: 'text-purple-700', bg: 'bg-purple-100' },
  ACRO: { label: 'acrostic',     color: 'text-blue-700',   bg: 'bg-blue-100'   },
  CHAR: { label: 'charade',      color: 'text-indigo-700', bg: 'bg-indigo-100' },
  ALT:  { label: 'alternate',    color: 'text-pink-700',   bg: 'bg-pink-100'   },
  LAST: { label: 'last letters', color: 'text-rose-700',   bg: 'bg-rose-100'   },
};

// ── Difficulty config ─────────────────────────────────────────────────────────
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; ring: string }> = {
  beginner:     { label: 'Beginner',     color: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-400' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-400'   },
  advanced:     { label: 'Advanced',     color: 'bg-red-100 text-red-700',         ring: 'ring-red-400'     },
};

// ── Helper: check answers against solution ───────────────────────────────────
function checkAnswers(
  puzzle: Puzzle,
  answers: Record<string, string>
): { correct: number; total: number; correctCells: Set<string>; wrongCells: Set<string> } {
  const { rows, cols, cells } = puzzle.gridData;
  let correct = 0, total = 0;
  const correctCells = new Set<string>();
  const wrongCells = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!cells[r]?.[c]?.isBlack) {
        total++;
        const entered = (answers[`${r},${c}`] ?? '').trim().toUpperCase();
        const sol = (puzzle.solution?.[r]?.[c] ?? '').toUpperCase();
        if (entered === sol && entered !== '') {
          correct++;
          correctCells.add(`${r},${c}`);
        } else if (entered !== '') {
          wrongCells.add(`${r},${c}`);
        }
      }
    }
  }
  return { correct, total, correctCells, wrongCells };
}

// ── Clue Item ─────────────────────────────────────────────────────────────────
const ClueItem: React.FC<{
  clue: PuzzleClue;
  isSelected: boolean;
  answers: Record<string, string>;
  onClick: () => void;
}> = ({ clue, isSelected, answers, onClick }) => {
  const meta = CLUE_TYPE_META[clue.clueType];

  // Count filled cells for this clue
  const totalCells = clue.length;
  const filledCells = Array.from({ length: clue.length }, (_, i) => {
    const r = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
    const c = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
    return answers[`${r},${c}`];
  }).filter((l) => l && l !== ' ').length;

  const isComplete = filledCells === totalCells;

  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 rounded cursor-pointer transition-colors border-l-4 ${
        isSelected
          ? 'bg-[#c7d8e8] border-slate-800'
          : isComplete
          ? 'bg-slate-50 border-emerald-400 hover:bg-slate-100'
          : 'bg-white border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`text-xs font-bold mt-0.5 min-w-[18px] ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
          {clue.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
            {clue.text}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-slate-400">({clue.letterCount})</span>
            {meta && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
            )}
          </div>
        </div>
        {isComplete && !isSelected && (
          <span className="text-emerald-500 text-xs mt-0.5 flex-shrink-0">✓</span>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const DailyPuzzle: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedClue, setSelectedClue] = useState<{ number: number; direction: 'across' | 'down' } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [checkResult, setCheckResult] = useState<{ correct: number; total: number } | null>(null);

  // Reset state when difficulty changes
  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    setAnswers({});
    setSelectedClue(null);
    setSubmitted(false);
    setShowModal(false);
    setCheckResult(null);
  };

  const { data: puzzle, isLoading, isError } = useQuery<Puzzle>({
    queryKey: ['dailyPuzzle', difficulty],
    queryFn: () => puzzleService.getDailyPuzzle(difficulty),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleCellChange = (row: number, col: number, char: string) => {
    setAnswers((prev) => ({ ...prev, [`${row},${col}`]: char }));
  };

  const handleClueSelect = (number: number, direction: 'across' | 'down') => {
    setSelectedClue({ number, direction });
  };

  const handleCheckAnswers = () => {
    if (!puzzle) return;
    const result = checkAnswers(puzzle, answers);
    setCheckResult({ correct: result.correct, total: result.total });
    setSubmitted(true);
    setShowModal(true);
  };

  // Active clue
  const activeClue = selectedClue && puzzle
    ? puzzle.clues.find(
        (cl) => cl.number === selectedClue.number && cl.direction === selectedClue.direction
      )
    : null;

  // Split clues
  const acrossClues = puzzle
    ? [...puzzle.clues.filter((c) => c.direction === 'across')].sort((a, b) => a.number - b.number)
    : [];
  const downClues = puzzle
    ? [...puzzle.clues.filter((c) => c.direction === 'down')].sort((a, b) => a.number - b.number)
    : [];

  const diffConfig = DIFFICULTY_CONFIG[difficulty];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Today's Cryptic Puzzle</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Difficulty tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                difficulty === d
                  ? `bg-white shadow-sm ${DIFFICULTY_CONFIG[d].color} ring-1 ${DIFFICULTY_CONFIG[d].ring}`
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>

        {/* Check Answers button */}
        <button
          onClick={handleCheckAnswers}
          disabled={!puzzle || submitted}
          className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition disabled:opacity-40 text-sm"
        >
          {submitted ? '✓ Checked' : 'Check Answers'}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading puzzle…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-32">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-slate-600 font-medium">Couldn't load today's puzzle.</p>
          <p className="text-slate-400 text-sm mt-1">Please try refreshing the page.</p>
        </div>
      )}

      {/* Puzzle UI */}
      {puzzle && !isLoading && (
        <>
          {/* Active clue bar — Guardian style */}
          <div className="bg-slate-800 text-white px-4 py-2.5 rounded-lg mb-5 min-h-[44px] flex items-center gap-3">
            {activeClue ? (
              <>
                <span className="font-bold text-yellow-300 text-sm whitespace-nowrap">
                  {activeClue.number} {selectedClue?.direction === 'across' ? 'Across' : 'Down'}
                </span>
                <span className="text-sm flex-1 leading-snug">{activeClue.text}</span>
                <span className="text-slate-400 text-sm whitespace-nowrap">({activeClue.letterCount})</span>
                {CLUE_TYPE_META[activeClue.clueType] && (
                  <span
                    className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full ${CLUE_TYPE_META[activeClue.clueType].bg} ${CLUE_TYPE_META[activeClue.clueType].color}`}
                  >
                    {CLUE_TYPE_META[activeClue.clueType].label}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-400 text-sm">Click a cell or clue to begin solving</span>
            )}
          </div>

          {/* Grid + Clues */}
          <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap">
            {/* Grid */}
            <div className="flex-shrink-0">
              <PuzzleGrid
                puzzle={puzzle}
                answers={answers}
                onCellChange={handleCellChange}
                selectedClue={selectedClue}
                onClueSelect={handleClueSelect}
                submitted={submitted}
              />

              {/* Grid meta */}
              <p className="text-xs text-slate-400 mt-2">
                {puzzle.gridData.rows}×{puzzle.gridData.cols} grid · {puzzle.clues.length} clues
              </p>
            </div>

            {/* Clues panel */}
            <div className="flex-1 min-w-0 bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Clue type legend */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
                {(Object.entries(CLUE_TYPE_META) as [ClueType, typeof CLUE_TYPE_META[ClueType]][]).map(
                  ([type, meta]) => (
                    <span
                      key={type}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-200">
                {/* Across */}
                <div className="flex flex-col">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">
                      Across
                    </h3>
                  </div>
                  <div className="overflow-y-auto max-h-[65vh] p-2 space-y-0.5">
                    {acrossClues.map((clue) => (
                      <ClueItem
                        key={`across-${clue.number}`}
                        clue={clue}
                        isSelected={
                          selectedClue?.number === clue.number &&
                          selectedClue?.direction === 'across'
                        }
                        answers={answers}
                        onClick={() => handleClueSelect(clue.number, 'across')}
                      />
                    ))}
                    {acrossClues.length === 0 && (
                      <p className="text-xs text-slate-400 p-3 text-center">No across clues</p>
                    )}
                  </div>
                </div>

                {/* Down */}
                <div className="flex flex-col">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">
                      Down
                    </h3>
                  </div>
                  <div className="overflow-y-auto max-h-[65vh] p-2 space-y-0.5">
                    {downClues.map((clue) => (
                      <ClueItem
                        key={`down-${clue.number}`}
                        clue={clue}
                        isSelected={
                          selectedClue?.number === clue.number &&
                          selectedClue?.direction === 'down'
                        }
                        answers={answers}
                        onClick={() => handleClueSelect(clue.number, 'down')}
                      />
                    ))}
                    {downClues.length === 0 && (
                      <p className="text-xs text-slate-400 p-3 text-center">No down clues</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Result Modal */}
      {showModal && checkResult && puzzle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
          >
            <div className="text-5xl mb-4">
              {checkResult.correct === checkResult.total
                ? '🎉'
                : checkResult.correct > checkResult.total / 2
                ? '👏'
                : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {checkResult.correct}/{checkResult.total} cells correct
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              {checkResult.correct === checkResult.total
                ? 'Perfect solve! Brilliant!'
                : checkResult.correct > checkResult.total * 0.8
                ? 'Almost there — great effort!'
                : checkResult.correct > checkResult.total / 2
                ? 'Good progress, keep going!'
                : 'Cryptic crosswords are tough — keep practising!'}
            </p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${diffConfig.color}`}>
              {difficulty}
            </span>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                Review Grid
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleDifficultyChange(
                    difficulty === 'beginner'
                      ? 'intermediate'
                      : difficulty === 'intermediate'
                      ? 'advanced'
                      : 'beginner'
                  );
                }}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition"
              >
                {difficulty === 'advanced' ? 'Try Beginner' : `Try ${difficulty === 'beginner' ? 'Intermediate' : 'Advanced'}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DailyPuzzle;
