import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const Home: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
          Master Cryptic Crosswords
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Learn to solve cryptic crosswords through gamified lessons inspired by the Economic Times.
          Progress through levels, earn streaks, and compete on leaderboards.
        </p>
        <div className="flex gap-4 justify-center">
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
              <Link
                to="/crosswords"
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Browse Crosswords
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section variants={itemVariants} className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: '🎮',
            title: 'Gamified Learning',
            description: 'Earn points, build streaks, and level up as you solve crosswords.',
          },
          {
            icon: '💡',
            title: 'Progressive Hints',
            description: 'Get 3 levels of hints to guide you without spoiling the answer.',
          },
          {
            icon: '📊',
            title: 'Track Progress',
            description: 'Monitor your improvement with detailed statistics and leaderboards.',
          },
          {
            icon: '🧩',
            title: 'Diverse Puzzles',
            description: 'From easy to hard, inspired by Economic Times cryptic format.',
          },
          {
            icon: '🏆',
            title: 'Compete',
            description: 'Join the global leaderboard and show off your crossword skills.',
          },
          {
            icon: '✨',
            title: 'Clean Design',
            description: 'Minimal, distraction-free interface for focused learning.',
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* How It Works */}
      <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-slate-50 p-12 rounded-lg">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { number: '1', title: 'Register', description: 'Create your free account' },
            { number: '2', title: 'Choose', description: 'Pick a crossword puzzle' },
            { number: '3', title: 'Solve', description: 'Use hints if needed' },
            { number: '4', title: 'Compete', description: 'Earn points and level up' },
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <motion.section variants={itemVariants} className="text-center py-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Learn?</h2>
          <p className="text-slate-600 mb-8">Start your crossword journey today</p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Create Free Account
          </Link>
        </motion.section>
      )}
    </motion.div>
  );
};

export default Home;
