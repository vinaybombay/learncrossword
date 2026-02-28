import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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

  const { data: crossword, isLoading } = useQuery({
    queryKey: ['crossword', id],
    queryFn: () => crosswordService.getCrosswordById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => crosswordService.submitCrossword(id!, answers),
    onSuccess: (result) => {
      alert(`Score: ${result.correctCount}/${result.totalClues}\nPoints: ${result.pointsEarned}\n${result.message}`);
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

  if (isLoading) return <div className="text-center py-12 text-slate-600">Loading...</div>;
  if (!crossword) return <div className="text-center py-12 text-slate-600">Crossword not found</div>;

  const acrossClues: Clue[] = crossword.clues.filter((c: Clue) => c.direction === 'across');
  const downClues: Clue[] = crossword.clues.filter((c: Clue) => c.direction === 'down');
  const submitted = submitMutation.isSuccess;

  const renderClueList = (clues: Clue[]) =>
    clues.map((clue) => {
      const isSelected = selectedClue?.number === clue.number && selectedClue?.direction === clue.direction;
      const clueKey = String(clue.number);
      return (
        <motion.div
          key={`${clue.direction}-${clue.number}`}
          whileHover={{ x: 4 }}
          onClick={() => handleClueSelect(clue.number, clue.direction)}
          className={`p-3 rounded-lg cursor-pointer transition ${
            isSelected ? 'bg-indigo-100 border-l-4 border-indigo-600' : 'bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <div className="font-semibold text-slate-900 text-sm">{clue.number}</div>
          <div className="text-sm text-slate-600 mb-2">{clue.text}</div>

          {/* Hint buttons */}
          {isAuthenticated && (
            <div className="flex gap-1 mt-1">
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
                    H{level}
                  </button>
                );
              })}
            </div>
          )}

          {/* Revealed hints */}
          {([1, 2, 3] as const).map((level) => {
            const key = `${clueKey}-${level}`;
            return hintContent[key] ? (
              <div key={level} className="text-xs text-amber-700 mt-1 pl-1 border-l-2 border-amber-300">
                Hint {level}: {hintContent[key]}
              </div>
            ) : null;
          })}
        </motion.div>
      );
    });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8">
      {/* Grid Column */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{crossword.title}</h1>
          <div className="flex gap-4 mb-6 text-sm text-slate-600">
            <span className="uppercase font-medium">{crossword.difficulty}</span>
            <span>⏱ {crossword.estimatedTime} min</span>
            <span>⭐ {crossword.pointsReward} pts</span>
          </div>

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

          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || submitted}
            className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting...' : submitted ? 'Submitted' : 'Submit Answers'}
          </button>
        </div>
      </div>

      {/* Clues Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md h-fit max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Clues</h2>

        <div className="mb-6">
          <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Across</h3>
          <div className="space-y-2">{renderClueList(acrossClues)}</div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Down</h3>
          <div className="space-y-2">{renderClueList(downClues)}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CrosswordSolver;
