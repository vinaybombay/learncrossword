import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { crosswordService } from '../services/crosswordService';
import { useAuthStore } from '../store/authStore';
import { Clue } from '../types';
import CrosswordGrid from '../components/CrosswordGrid';

const CrosswordSolver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedClue, setSelectedClue] = useState<{ number: number; direction: 'across' | 'down' } | null>(null);
  const [hintContent, setHintContent] = useState<Record<string, string>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    correctCount: number;
    totalClues: number;
    pointsEarned: number;
    message: string;
  } | null>(null);

  const { data: crossword, isLoading } = useQuery({
    queryKey: ['crossword', id],
    queryFn: () => crosswordService.getCrosswordById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => crosswordService.submitCrossword(id!, answers),
    onSuccess: (result) => {
      setSubmitResult(result);
      setShowSubmitModal(true);
    },
  });

  const hintMutation = useMutation({
    mutationFn: ({ clueId, level }: { clueId: string; level: 1 | 2 | 3 }) =>
      crosswordService.getHint(id!, clueId, level),
    onSuccess: (result, { clueId, level }) => {
      setHintContent((prev) => ({ ...prev, [`${clueId}-${level}`]: result.content }));
    },
  });

  const handleCellChange = (clueNumber: number, direction: 'across' | 'down', charIndex: number, char: string) => {
    if (!crossword) return;
    const clue = crossword.clues.find((c: Clue) => c.number === clueNumber && c.direction === direction);
    if (!clue) return;
    const current = (answers[clueNumber] || '').padEnd(clue.length, ' ');
    const updated = current.substring(0, charIndex) + char + current.substring(charIndex + 1);
    setAnswers((prev) => ({ ...prev, [clueNumber]: updated.trimEnd() }));
  };

  const handleClueSelect = (number: number, direction: 'across' | 'down') => {
    setSelectedClue({ number, direction });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading crossword…</p>
        </div>
      </div>
    );
  }

  if (!crossword) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 text-lg">Crossword not found.</p>
        <Link to="/crosswords" className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Back to library
        </Link>
      </div>
    );
  }

  const acrossClues: Clue[] = crossword.clues
    .filter((c: Clue) => c.direction === 'across')
    .sort((a: Clue, b: Clue) => a.number - b.number);
  const downClues: Clue[] = crossword.clues
    .filter((c: Clue) => c.direction === 'down')
    .sort((a: Clue, b: Clue) => a.number - b.number);

  const submitted = submitMutation.isSuccess;

  const activeClue = selectedClue
    ? crossword.clues.find(
        (c: Clue) => c.number === selectedClue.number && c.direction === selectedClue.direction
      )
    : null;

  const difficultyColors: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };

  const renderClueItem = (clue: Clue) => {
    const isSelected =
      selectedClue?.number === clue.number && selectedClue?.direction === clue.direction;
    const clueKey = String(clue.number);
    const answeredChars = (answers[clue.number] || '').replace(/ /g, '').length;
    const isComplete = answeredChars === clue.length;

    return (
      <div
        key={`${clue.direction}-${clue.number}`}
        onClick={() => handleClueSelect(clue.number, clue.direction)}
        className={`px-3 py-2 rounded cursor-pointer transition-colors border-l-4 ${
          isSelected
            ? 'bg-[#c7d8e8] border-slate-800'
            : isComplete
            ? 'bg-slate-50 border-emerald-400 hover:bg-slate-100'
            : 'bg-white border-transparent hover:bg-slate-50'
        }`}
      >
        <div className="flex items-start gap-2">
          <span
            className={`text-xs font-bold mt-0.5 min-w-[20px] ${
              isSelected ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {clue.number}
          </span>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-snug ${
                isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'
              }`}
            >
              {clue.text}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">({clue.length})</p>

            {/* Hint buttons — only when selected and authenticated */}
            {isSelected && isAuthenticated && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {([1, 2, 3] as const).map((level) => {
                  const key = `${clueKey}-${level}`;
                  const revealed = hintContent[key];
                  return (
                    <button
                      key={level}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!revealed) hintMutation.mutate({ clueId: clueKey, level });
                      }}
                      className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                        revealed
                          ? 'bg-amber-100 text-amber-700 cursor-default'
                          : 'bg-slate-200 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                      }`}
                    >
                      {revealed ? `💡 Hint ${level}` : `Hint ${level}`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Revealed hint content */}
            {isSelected &&
              ([1, 2, 3] as const).map((level) => {
                const key = `${clueKey}-${level}`;
                return hintContent[key] ? (
                  <div
                    key={level}
                    className="text-xs text-amber-700 mt-1 pl-2 border-l-2 border-amber-300"
                  >
                    Hint {level}: {hintContent[key]}
                  </div>
                ) : null;
              })}
          </div>
          {isComplete && !isSelected && (
            <span className="text-emerald-500 text-xs mt-0.5 flex-shrink-0">✓</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/crosswords" className="text-slate-400 hover:text-slate-600 text-sm">
              ← Library
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl font-bold text-slate-900">{crossword.title}</h1>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                difficultyColors[crossword.difficulty] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {crossword.difficulty}
            </span>
          </div>
          <div className="flex gap-4 mt-1 text-sm text-slate-500">
            <span>⏱ {crossword.estimatedTime} min</span>
            <span>⭐ {crossword.pointsReward} pts</span>
            {crossword.category && <span>📂 {crossword.category}</span>}
          </div>
        </div>
        <button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || submitted}
          className="px-6 py-2 bg-slate-800 text-white rounded font-semibold hover:bg-slate-700 transition disabled:opacity-50 text-sm"
        >
          {submitMutation.isPending ? 'Checking…' : submitted ? '✓ Submitted' : 'Check Answers'}
        </button>
      </div>

      {/* Active clue bar — Guardian-style */}
      <div className="bg-slate-800 text-white px-4 py-2.5 rounded mb-5 min-h-[42px] flex items-center gap-3">
        {activeClue ? (
          <>
            <span className="font-bold text-yellow-300 text-sm whitespace-nowrap">
              {activeClue.number} {selectedClue?.direction === 'across' ? 'Across' : 'Down'}
            </span>
            <span className="text-sm flex-1">{activeClue.text}</span>
            <span className="text-slate-400 text-sm whitespace-nowrap">({activeClue.length})</span>
          </>
        ) : (
          <span className="text-slate-400 text-sm">Click a cell or clue to begin solving</span>
        )}
      </div>

      {/* Main layout: grid left, clues right */}
      <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap">
        {/* Grid */}
        <div className="flex-shrink-0">
          <CrosswordGrid
            gridData={crossword.gridData}
            gridSize={crossword.gridSize}
            clues={crossword.clues}
            answers={answers}
            onCellChange={handleCellChange}
            selectedClue={selectedClue}
            onClueSelect={handleClueSelect}
            submitted={submitted}
          />
        </div>

        {/* Clues panel — two columns: Across | Down */}
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="flex flex-col">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">Across</h3>
              </div>
              <div className="overflow-y-auto max-h-[72vh] p-2 space-y-0.5">
                {acrossClues.map(renderClueItem)}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">Down</h3>
              </div>
              <div className="overflow-y-auto max-h-[72vh] p-2 space-y-0.5">
                {downClues.map(renderClueItem)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit result modal */}
      {showSubmitModal && submitResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center"
          >
            <div className="text-5xl mb-4">
              {submitResult.correctCount === submitResult.totalClues
                ? '🎉'
                : submitResult.correctCount > submitResult.totalClues / 2
                ? '👏'
                : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {submitResult.correctCount}/{submitResult.totalClues} correct
            </h2>
            <p className="text-slate-500 mb-2">{submitResult.message}</p>
            {submitResult.pointsEarned > 0 && (
              <p className="text-emerald-600 font-semibold">+{submitResult.pointsEarned} points earned!</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                Review Grid
              </button>
              <Link
                to="/crosswords"
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition text-center"
              >
                More Puzzles
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CrosswordSolver;
