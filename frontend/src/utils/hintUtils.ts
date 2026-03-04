import { ClueType, PuzzleClue } from '../types';

// ── Extended clue type metadata ───────────────────────────────────────────────
// Superset of the minimal CLUE_TYPE_META in DailyPuzzle.tsx.
// Used by HintPanel and the /learn page.

export interface ClueTypeMeta {
  label: string;              // short badge label: "anagram"
  color: string;              // Tailwind text class
  bg: string;                 // Tailwind bg class
  fullName: string;           // "Anagram"
  description: string;        // 2–3 sentences for the learn page
  howToSpot: string;          // one-sentence tip
  indicatorExamples: string[]; // 3–5 common indicator words/phrases
}

export const CLUE_TYPE_META: Record<ClueType, ClueTypeMeta> = {
  ANAG: {
    label: 'anagram',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    fullName: 'Anagram',
    description:
      'The letters of one or more words in the clue are scrambled to make the answer. ' +
      'An indicator word always signals that rearrangement is happening. ' +
      'The rest of the clue gives you a straight definition of the answer.',
    howToSpot: 'Look for words suggesting disorder, confusion, or change near a group of letters.',
    indicatorExamples: ['mixed up', 'scrambled', 'confused', 'broken', 'tangled', 'carelessly', 'unusual'],
  },
  HID: {
    label: 'hidden',
    color: 'text-green-700',
    bg: 'bg-green-100',
    fullName: 'Hidden Word',
    description:
      'The answer is concealed inside consecutive letters within the clue text itself — ' +
      'you simply need to find it running forwards through the phrase. ' +
      'A containment indicator tells you to look inside.',
    howToSpot: 'Look for words suggesting concealment, containment, or partial existence.',
    indicatorExamples: ['hidden in', 'conceals', 'within', 'inside', 'some of', 'part of', 'contains'],
  },
  HIDR: {
    label: 'hidden↩',
    color: 'text-teal-700',
    bg: 'bg-teal-100',
    fullName: 'Hidden Reversed',
    description:
      'Like a hidden word clue, but the answer runs backwards through the clue text. ' +
      'Both a reversal indicator and a containment indicator are always present. ' +
      'Write out the phrase, reverse it, and look for the answer inside.',
    howToSpot: 'Look for a containment word AND a reversal word together in the same clue.',
    indicatorExamples: ['returns from', 'going back in', 'retreating within', 'back in', 'reversed in'],
  },
  SND: {
    label: 'sounds like',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    fullName: 'Homophone',
    description:
      'The answer sounds like another word or phrase when spoken aloud. ' +
      'An auditory indicator is always present to flag this. ' +
      'Say the wordplay part out loud — the sound of it gives you the answer.',
    howToSpot: 'Look for words referencing speech, hearing, or being told something.',
    indicatorExamples: ["we're told", 'reportedly', 'sounds like', 'one hears', 'by the sound of it', 'out loud'],
  },
  ACRO: {
    label: 'acrostic',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    fullName: 'Acrostic',
    description:
      'Take the first letter of each specified word to spell the answer. ' +
      'An indicator points to the beginnings of the words. ' +
      'Count the words carefully — their initials must match the answer length.',
    howToSpot: 'Look for words that reference starts, leaders, beginnings, or initials.',
    indicatorExamples: ['initially', 'leaders of', 'starters', 'first of', 'openers', 'capitals of', 'heads of'],
  },
  CHAR: {
    label: 'charade',
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    fullName: 'Charade',
    description:
      'The answer is built by joining two or more shorter words or meaningful parts back-to-back. ' +
      'There is usually no explicit indicator — the wordplay is built into the structure of the clue itself. ' +
      'Try splitting the answer into two real words that both appear (sometimes disguised) in the clue.',
    howToSpot: 'Try splitting the answer at every point into two words that are each described in the clue.',
    indicatorExamples: ['(no indicator — parts are described directly in the clue)'],
  },
  ALT: {
    label: 'alternate',
    color: 'text-pink-700',
    bg: 'bg-pink-100',
    fullName: 'Alternate Letters',
    description:
      'Take every other letter from a phrase in the clue — either odd-positioned or even-positioned letters — ' +
      'to spell the answer. An indicator signals that letters are taken regularly or in turn.',
    howToSpot: 'Look for words suggesting regularity, alternation, or odd/even patterns.',
    indicatorExamples: ['regularly', 'alternately', 'odd letters of', 'even letters of', 'every other', 'in turn'],
  },
  LAST: {
    label: 'last letters',
    color: 'text-rose-700',
    bg: 'bg-rose-100',
    fullName: 'Last Letters',
    description:
      'Take the last letter of each specified word to spell the answer. ' +
      'An indicator references endings, tails, or finals. ' +
      'Count the words — their final letters must match the answer length.',
    howToSpot: 'Look for words pointing to ends, conclusions, or tails.',
    indicatorExamples: ['finally', 'at the end', 'in conclusion', 'finals of', 'endings of', 'tails of', 'last of'],
  },
};

// ── Hint result type ──────────────────────────────────────────────────────────

export interface HintResult {
  level: 1 | 2 | 3;
  text: string;
}

// ── getHint — pure function ───────────────────────────────────────────────────

/**
 * Returns a hint for a given clue at the specified level.
 * Level 1: Clue type explanation
 * Level 2: Structural reveal (indicator + definition position)
 * Level 3: First letter of the answer
 */
export function getHint(clue: PuzzleClue, level: 1 | 2 | 3): HintResult {
  const meta = CLUE_TYPE_META[clue.clueType];

  if (!meta) {
    return { level, text: 'Hint unavailable for this clue type.' };
  }

  switch (level) {
    case 1:
      return {
        level: 1,
        text: `This is a ${meta.fullName} clue. ${meta.description}`,
      };

    case 2: {
      const parts: string[] = [];

      if (clue.clueType === 'CHAR') {
        parts.push('This is a charade — there is no indicator word. Each part of the clue directly describes a piece of the answer joined together.');
      } else if (clue.indicatorWord) {
        parts.push(`The indicator word is "${clue.indicatorWord}".`);
      } else {
        parts.push('Look carefully — the indicator is embedded in the phrasing of the clue.');
      }

      if (clue.definitionStart === true) {
        parts.push('The definition comes at the start of the clue.');
      } else if (clue.definitionStart === false) {
        parts.push('The definition comes at the end of the clue.');
      } else {
        parts.push('The definition is either the first or last part of the clue.');
      }

      return { level: 2, text: parts.join(' ') };
    }

    case 3: {
      if (!clue.answer || clue.answer.length === 0) {
        return { level: 3, text: 'First letter unavailable.' };
      }
      const firstLetter = clue.answer[0].toUpperCase();
      return {
        level: 3,
        text: `The answer starts with the letter "${firstLetter}".`,
      };
    }
  }
}
