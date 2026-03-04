import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClueType } from '../types';
import { CLUE_TYPE_META } from '../utils/hintUtils';

// ── Tab order: beginner-friendly → most niche ─────────────────────────────────
const TAB_ORDER: ClueType[] = ['ANAG', 'HID', 'CHAR', 'SND', 'ACRO', 'HIDR', 'ALT', 'LAST'];

// ── Example data per clue type ────────────────────────────────────────────────
interface LearnExample {
  clueText: string;
  letterCount: string;
  answer: string;
  step1: {
    indicatorPhrase: string;    // "(no indicator)" for CHAR
    definitionPhrase: string;
    definitionSide: 'start' | 'end';
  };
  step2: string;  // workings explanation
  step3: string;  // full explanation
}

const EXAMPLES: Record<ClueType, LearnExample> = {
  ANAG: {
    clueText: 'POTS mixed up — halt! (4)',
    letterCount: '4',
    answer: 'STOP',
    step1: {
      indicatorPhrase: 'mixed up',
      definitionPhrase: 'halt',
      definitionSide: 'end',
    },
    step2: 'The letters P, O, T, S are rearranged. Try every permutation: STOP, TOPS, SPOT, OPTS… "halt" matches STOP.',
    step3: '"halt" is the definition. "mixed up" tells you to anagram POTS → STOP.',
  },
  HID: {
    clueText: 'Space craft conceals an expert (3)',
    letterCount: '3',
    answer: 'ACE',
    step1: {
      indicatorPhrase: 'conceals',
      definitionPhrase: 'an expert',
      definitionSide: 'end',
    },
    step2: 'Read "Space craft" and look inside it for consecutive letters: sp[ACE]craft. The letters A-C-E appear one after another.',
    step3: '"an expert" is the definition. "conceals" signals a hidden word inside "Space craft" → ACE.',
  },
  HIDR: {
    clueText: 'Returns from nettle — a number (3)',
    letterCount: '3',
    answer: 'TEN',
    step1: {
      indicatorPhrase: 'Returns from',
      definitionPhrase: 'a number',
      definitionSide: 'end',
    },
    step2: 'Write "nettle" backwards: e-l-t-t-e-n. Now find a hidden run reading forward: neTENle reversed gives TEN.',
    step3: '"a number" is the definition. "Returns from" signals reversal — TEN hides backwards in "neTtle".',
  },
  SND: {
    clueText: "We're told you see the ocean (3)",
    letterCount: '3',
    answer: 'SEA',
    step1: {
      indicatorPhrase: "We're told",
      definitionPhrase: 'the ocean',
      definitionSide: 'end',
    },
    step2: '"You see" sounds like the letter C. What word means "the ocean" and sounds like "see"? SEA sounds like "see".',
    step3: '"the ocean" is the definition. "We\'re told" flags a homophone — SEA sounds exactly like "see" (the word in the clue).',
  },
  ACRO: {
    clueText: 'Initially, Cats And Mice Playing — an outdoor activity! (4)',
    letterCount: '4',
    answer: 'CAMP',
    step1: {
      indicatorPhrase: 'Initially',
      definitionPhrase: 'an outdoor activity',
      definitionSide: 'end',
    },
    step2: 'Take the first letter of each word in "Cats And Mice Playing": C · A · M · P = CAMP.',
    step3: '"an outdoor activity" is the definition. "Initially" signals first letters: Cats-And-Mice-Playing → C-A-M-P = CAMP.',
  },
  CHAR: {
    clueText: 'Vehicle with a pet — a floor covering (6)',
    letterCount: '6',
    answer: 'CARPET',
    step1: {
      indicatorPhrase: '(no indicator)',
      definitionPhrase: 'a floor covering',
      definitionSide: 'end',
    },
    step2: '"Vehicle" = CAR. "a pet" = PET. Join them back-to-back: CAR + PET = CARPET.',
    step3: '"a floor covering" is the definition. No indicator needed — the parts CAR (vehicle) + PET (a pet) join to make CARPET.',
  },
  ALT: {
    clueText: "Regularly in 'able ladies evening' — a drink! (3)",
    letterCount: '3',
    answer: 'ALE',
    step1: {
      indicatorPhrase: 'Regularly',
      definitionPhrase: 'a drink',
      definitionSide: 'end',
    },
    step2: "Take every other letter from 'able ladies evening': A·b·L·a·d·i·E·s → positions 1, 3, 5… give A, L, E = ALE.",
    step3: '"a drink" is the definition. "Regularly" signals alternate letters of "able ladies evening" → A-L-E = ALE.',
  },
  LAST: {
    clueText: 'Finals of Sources In Text — do this in a chair (3)',
    letterCount: '3',
    answer: 'SIT',
    step1: {
      indicatorPhrase: 'Finals of',
      definitionPhrase: 'do this in a chair',
      definitionSide: 'end',
    },
    step2: 'Take the last letter of each word: sourceS · In · texT → S, I, T = SIT.',
    step3: '"do this in a chair" is the definition. "Finals of" signals last letters: Sources→S, In→I, Text→T = SIT.',
  },
};

// ── Learn page ────────────────────────────────────────────────────────────────
const Learn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ClueType>('ANAG');
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const meta = CLUE_TYPE_META[activeTab];
  const example = EXAMPLES[activeTab];

  const handleTabChange = (type: ClueType) => {
    setActiveTab(type);
    setStep(0);
  };

  const isNoIndicator = example.step1.indicatorPhrase === '(no indicator)';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Learn Cryptic Clue Types</h1>
        <p className="text-slate-500">
          Master all 8 patterns used in cryptic crosswords. Work through each type with an interactive worked example.
        </p>
      </div>

      {/* ── Horizontal tab bar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 mb-6">
        {TAB_ORDER.map((type) => {
          const m = CLUE_TYPE_META[type];
          const isActive = activeTab === type;
          return (
            <button
              key={type}
              onClick={() => handleTabChange(type)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 -mb-px ${
                isActive
                  ? `border-indigo-600 text-indigo-700 ${m.bg}`
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {m.fullName}
            </button>
          );
        })}
      </div>

      {/* ── Type overview card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${meta.bg} ${meta.color}`}>
            {meta.fullName}
          </span>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">{activeTab}</span>
        </div>
        <p className="text-slate-700 leading-relaxed">{meta.description}</p>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How to spot it</p>
          <p className="text-sm text-slate-600 mb-3">{meta.howToSpot}</p>
          <div className="flex flex-wrap gap-1.5">
            {meta.indicatorExamples.map((ex) => (
              <span
                key={ex}
                className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600"
              >
                "{ex}"
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Worked example card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Card header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Worked Example</h3>
          <span className="text-xs text-slate-400">Step {step} of 3</span>
        </div>

        {/* Step 0 — Always visible: dark clue card */}
        <div className="px-6 py-5">
          <div className="bg-slate-900 text-white rounded-lg px-5 py-4 text-center mb-4">
            <p className="text-lg font-bold tracking-wide">{example.clueText}</p>
          </div>
          <p className="text-sm text-slate-500 text-center">
            {step === 0
              ? `Can you work out the answer? It has ${example.letterCount} letter${example.letterCount !== '1' ? 's' : ''}.`
              : `The answer has ${example.letterCount} letter${example.letterCount !== '1' ? 's' : ''}.`}
          </p>
        </div>

        {/* Steps 1–3 revealed progressively */}
        <AnimatePresence initial={false}>
          {/* Step 1: Structure */}
          {step >= 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-6 pb-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Step 1 — Structure</p>
                <div className="flex flex-wrap gap-3">
                  {/* Indicator */}
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium ${isNoIndicator ? 'bg-slate-100 text-slate-400' : `${meta.bg} ${meta.color}`}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-60">Indicator</span>
                    {isNoIndicator
                      ? <span className="italic text-slate-400">No indicator — parts juxtaposed directly</span>
                      : <span>"{example.step1.indicatorPhrase}"</span>
                    }
                  </div>
                  {/* Definition */}
                  <div className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-60">Definition</span>
                    <span>"{example.step1.definitionPhrase}"</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Definition is at the {example.step1.definitionSide} of the clue.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Workings */}
          {step >= 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-6 pb-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Step 2 — Workings</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
                  {example.step2}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Answer */}
          {step >= 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Step 3 — Answer</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-700 tracking-[0.25em] mb-2">{example.answer}</p>
                  <p className="text-sm text-emerald-700 leading-relaxed">{example.step3}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2 | 3)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              {step === 0 ? 'Show structure' : step === 1 ? 'Show workings' : 'Reveal answer'}
            </button>
          ) : (
            <Link
              to="/crosswords"
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
            >
              Practice in today's puzzle →
            </Link>
          )}
          {step > 0 && step < 3 && (
            <button
              onClick={() => setStep(0)}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Reset
            </button>
          )}
          {step === 3 && (
            <button
              onClick={() => setStep(0)}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Try again from start
            </button>
          )}
        </div>
      </div>

      {/* ── CTA banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-center text-white">
        <h3 className="text-lg font-bold mb-2">Ready to apply what you've learned?</h3>
        <p className="text-indigo-100 text-sm mb-4">
          Today's puzzle uses all 8 clue types. Use the hints in-puzzle whenever you get stuck.
        </p>
        <Link
          to="/crosswords"
          className="inline-block px-6 py-2.5 bg-white text-indigo-700 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition"
        >
          Go to today's puzzle
        </Link>
      </div>
    </motion.div>
  );
};

export default Learn;
