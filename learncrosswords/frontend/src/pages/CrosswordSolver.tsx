import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { crosswordService } from '../services/crosswordService';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const CrosswordSolver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [selectedClueNumber, setSelectedClueNumber] = useState<number | null>(null);

  const { data: crossword, isLoading } = useQuery({
    queryKey: ['crossword', id],
    queryFn: () => crosswordService.getCrosswordById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => crosswordService.submitCrossword(id!, answers),
    onSuccess: (result) => {
      alert(`
Score: ${result.correctCount}/${result.totalClues}
Points: ${result.pointsEarned}
${result.message}
      `);
    },
  });

  const getHintMutation = useMutation({
    mutationFn: ({ clueId, level }: { clueId: string; level: 1 | 2 | 3 }) =>
      crosswordService.getHint(id!, clueId, level),
  });

  const handleAnswerChange = (clueNumber: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [clueNumber]: value.toUpperCase(),
    }));
  };

  const handleGetHint = (clueId: string, level: 1 | 2 | 3) => {
    getHintMutation.mutate({ clueId, level });
  };

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!crossword) return <div className="text-center py-12">Crossword not found</div>;

  const acrossClues = crossword.clues.filter((c: any) => c.direction === 'across');
  const downClues = crossword.clues.filter((c: any) => c.direction === 'down');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8">
      {/* Crossword Grid */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{crossword.title}</h1>
          <div className="flex gap-4 mb-6 text-sm text-slate-600">
            <span>{crossword.difficulty.toUpperCase()}</span>
            <span>⏱️ {crossword.estimatedTime} min</span>
            <span>⭐ {crossword.pointsReward} pts</span>
          </div>

          {/* Grid Placeholder */}
          <div className="bg-slate-100 p-6 rounded-lg mb-6 text-center text-slate-600">
            <p>Interactive grid will be rendered here</p>
            <p className="text-sm mt-2">{crossword.gridSize}×{crossword.gridSize} grid</p>
          </div>

          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </div>

      {/* Clues Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Clues</h2>

        {/* Across */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">ACROSS</h3>
          <div className="space-y-3">
            {acrossClues.map((clue: any) => (
              <motion.div
                key={clue.number}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedClueNumber(clue.number)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedClueNumber === clue.number
                    ? 'bg-indigo-100 border-l-4 border-indigo-600'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold text-slate-900">{clue.number}</div>
                <div className="text-sm text-slate-600 mb-2">{clue.text}</div>
                <input
                  type="text"
                  placeholder={`(${clue.length} letters)`}
                  value={answers[clue.number] || ''}
                  onChange={(e) => handleAnswerChange(clue.number, e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="text-xs text-slate-500 mt-2">Hints available</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Down */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">DOWN</h3>
          <div className="space-y-3">
            {downClues.map((clue: any) => (
              <motion.div
                key={clue.number}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedClueNumber(clue.number)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedClueNumber === clue.number
                    ? 'bg-indigo-100 border-l-4 border-indigo-600'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold text-slate-900">{clue.number}</div>
                <div className="text-sm text-slate-600 mb-2">{clue.text}</div>
                <input
                  type="text"
                  placeholder={`(${clue.length} letters)`}
                  value={answers[clue.number] || ''}
                  onChange={(e) => handleAnswerChange(clue.number, e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="text-xs text-slate-500 mt-2">Hints available</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CrosswordSolver;
