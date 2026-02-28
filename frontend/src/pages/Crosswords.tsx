import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { crosswordService } from '../services/crosswordService';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Crosswords: React.FC = () => {
  const [difficulty, setDifficulty] = useState<string>('');
  const [skip, setSkip] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['crosswords', difficulty, skip],
    queryFn: () => crosswordService.getCrosswords(difficulty, skip, 10),
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Crossword Puzzles</h1>
        <p className="text-slate-600">Choose a puzzle and start solving</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {['easy', 'medium', 'hard'].map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(difficulty === level ? '' : level)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              difficulty === level
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-600">Loading crosswords...</p>
        </div>
      )}

      {/* Crossword List */}
      {data && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.crosswords.map((crossword: any) => (
              <Link key={crossword._id} to={`/crossword/${crossword._id}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{crossword.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(crossword.difficulty)}`}>
                      {crossword.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{crossword.description}</p>
                  <div className="flex gap-4 text-sm text-slate-600 mb-4">
                    <span>📐 {crossword.gridSize}×{crossword.gridSize}</span>
                    <span>⏱️ {crossword.estimatedTime} min</span>
                    <span>⭐ {crossword.pointsReward} pts</span>
                  </div>
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                    Solve →
                  </button>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.total > 10 && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSkip(Math.max(0, skip - 10))}
                disabled={skip === 0}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-600">
                {skip / 10 + 1} / {Math.ceil(data.total / 10)}
              </span>
              <button
                onClick={() => setSkip(skip + 10)}
                disabled={skip + 10 >= data.total}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Crosswords;
