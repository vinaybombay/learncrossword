import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { SEO } from '../components/SEO';

const Home: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
      <SEO
        path="/"
        description="Learn cryptic crosswords with daily puzzles, progressive hints, and interactive clue-type walkthroughs. Free to play."
      />

      {/* ── Hero ── */}
      <motion.section variants={itemVariants} className="text-center py-20">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          ✨ Daily AI-generated cryptic puzzles
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-5 leading-tight">
          Fall in Love with<br className="hidden md:block" /> Cryptic Crosswords
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Solve daily cryptic crosswords across three difficulty levels. Learn all 8 clue types —
          anagrams, hidden words, homophones and more — through guided hints that teach you
          <em> how</em> to think, not just what to answer.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                Get Started — Free
              </Link>
              <Link
                to="/crosswords"
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Try Today's Puzzle
              </Link>
            </>
          ) : (
            <Link
              to="/crosswords"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              Today's Puzzle →
            </Link>
          )}
        </div>
        {/* Difficulty preview pills */}
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          {[
            { label: 'Beginner', color: 'bg-emerald-100 text-emerald-700', note: '10 clues' },
            { label: 'Intermediate', color: 'bg-amber-100 text-amber-700', note: '15 clues' },
            { label: 'Advanced', color: 'bg-red-100 text-red-700', note: '20 clues' },
          ].map((d) => (
            <span key={d.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${d.color}`}>
              {d.label} <span className="font-normal opacity-70">{d.note}</span>
            </span>
          ))}
        </div>
      </motion.section>

      {/* ── Features ── */}
      <motion.section variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: '🧩',
            title: 'Daily Fresh Puzzles',
            description:
              'A new Beginner puzzle every day. Intermediate and Advanced refreshed weekly. Every puzzle is uniquely AI-generated — no repeats.',
          },
          {
            icon: '💡',
            title: 'Progressive Hints',
            description:
              'Three levels of hints per clue. Level 1 tells you the clue type. Level 2 breaks down the structure. Level 3 gives you the near-answer.',
          },
          {
            icon: '📖',
            title: '8 Clue Types to Master',
            description:
              'Anagram, hidden word, reversed hidden, homophone, acrostic, charade, alternate letters, last letters. Each puzzle teaches new techniques.',
          },
          {
            icon: '🎮',
            title: 'Gamified Progress',
            description:
              'Earn points for every correct cell. Build daily streaks, level up, and track your improvement from Beginner to Advanced.',
          },
          {
            icon: '🏆',
            title: 'Global Leaderboard',
            description:
              'Compete with solvers worldwide. Daily completions feed into global rankings. See where you stand.',
          },
          {
            icon: '⌨️',
            title: 'Guardian-Style Grid',
            description:
              'Full keyboard navigation, direction toggle, active clue bar. Solve the way professionals do — no mouse required.',
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Clue Types Strip ── */}
      <motion.section variants={itemVariants} className="bg-slate-900 rounded-2xl px-8 py-10 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5">The 8 clue types you'll master</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { type: 'Anagram', ex: '"Rearranged…"', color: 'bg-orange-100 text-orange-800' },
            { type: 'Hidden Word', ex: '"Concealed in…"', color: 'bg-green-100 text-green-800' },
            { type: 'Hidden Reversed', ex: '"Going back…"', color: 'bg-teal-100 text-teal-800' },
            { type: 'Homophone', ex: '"We hear…"', color: 'bg-purple-100 text-purple-800' },
            { type: 'Acrostic', ex: '"Leaders of…"', color: 'bg-blue-100 text-blue-800' },
            { type: 'Charade', ex: '"Parts joined"', color: 'bg-indigo-100 text-indigo-800' },
            { type: 'Alternate Letters', ex: '"Every other…"', color: 'bg-pink-100 text-pink-800' },
            { type: 'Last Letters', ex: '"Endings of…"', color: 'bg-rose-100 text-rose-800' },
          ].map(({ type, ex, color }) => (
            <div key={type} className={`px-3 py-2 rounded-lg text-xs font-semibold ${color}`}>
              <div>{type}</div>
              <div className="font-normal opacity-60 mt-0.5">{ex}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── How It Works ── */}
      <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-slate-50 p-10 rounded-2xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">How It Works</h2>
        <p className="text-center text-slate-500 text-sm mb-10">From first attempt to expert solver</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { number: '1', title: 'Sign Up Free', description: 'Create your account in 30 seconds. No credit card needed.' },
            { number: '2', title: 'Pick a Difficulty', description: 'Start with Beginner — 10 clues, gentler vocabulary — then advance.' },
            { number: '3', title: 'Use the Hints', description: 'Unlock hints one level at a time. Learn the pattern, not just the answer.' },
            { number: '4', title: 'Level Up Daily', description: 'Earn points, build your streak, climb the leaderboard as you improve.' },
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-md">
                {step.number}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA ── */}
      {!isAuthenticated && (
        <motion.section variants={itemVariants} className="text-center py-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to Start Solving?</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Today's puzzles are waiting. No experience needed — the hints will guide you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/crosswords"
              className="inline-block px-8 py-3 border-2 border-slate-300 text-slate-600 rounded-lg font-semibold hover:border-slate-400 transition"
            >
              Try Without Signing Up
            </Link>
          </div>
        </motion.section>
      )}

    </motion.div>
  );
};

export default Home;
