import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '../services/leaderboardService';
import { motion } from 'framer-motion';

const Leaderboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardService.getLeaderboard(0, 50),
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Global Leaderboard</h1>
        <p className="text-slate-600">See who's leading the charge</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Rank</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Player</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900">Level</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900">Points</th>
            </tr>
          </thead>
          <tbody>
            {data?.leaderboard.map((entry: any, index: number) => (
              <motion.tr
                key={index}
                whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                className="border-b border-slate-200 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {entry.rank <= 3 && (
                      <span className="text-lg">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                      </span>
                    )}
                    <span className="font-semibold text-slate-900">#{entry.rank}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">{entry.username}</td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Lvl {entry.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-indigo-600">{entry.totalPoints.toLocaleString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
