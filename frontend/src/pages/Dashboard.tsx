import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => userService.getUserStats(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: () => userService.getUserProgress(user?.id || ''),
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-indigo-100">Keep up your streak and reach new levels</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Level', value: stats?.level || 0, icon: '📊' },
          { label: 'Total Points', value: stats?.totalPoints || 0, icon: '⭐' },
          { label: 'Current Streak', value: stats?.currentStreak || 0, icon: '🔥' },
          { label: 'Completed', value: stats?.completedCrosswords || 0, icon: '✅' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Activity</h2>
        {progress && progress.length > 0 ? (
          <div className="space-y-3">
            {progress.slice(0, 5).map((item: any) => (
              <div key={item._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{item.crosswordId.title}</p>
                  <p className="text-sm text-slate-600">{item.completed ? '✅ Completed' : '⏳ In progress'}</p>
                </div>
                <span className="font-semibold text-indigo-600">{item.pointsEarned} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No activity yet. Start solving crosswords!</p>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
