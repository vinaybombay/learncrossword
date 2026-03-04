import api from './api';
import { Puzzle, SubmitResult, PuzzleProgress } from '../types';

export const puzzleService = {
  /**
   * Get the daily puzzle(s).
   * - With difficulty: returns the single puzzle for that difficulty.
   * - Without: returns an array of all difficulties for today.
   * NOTE: solution is NOT included in the response (server-side only).
   */
  getDailyPuzzle: async (difficulty?: 'beginner' | 'intermediate' | 'advanced'): Promise<Puzzle> => {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    const { data } = await api.get<Puzzle>(`/puzzles/daily${params}`);
    return data;
  },

  getDailyPuzzles: async (): Promise<Puzzle[]> => {
    const { data } = await api.get<Puzzle[]>('/puzzles/daily');
    return data;
  },

  getPuzzleArchive: async (): Promise<Puzzle[]> => {
    const { data } = await api.get<Puzzle[]>('/puzzles/archive');
    return data;
  },

  getPuzzleBySlug: async (slug: string): Promise<Puzzle> => {
    const { data } = await api.get<Puzzle>(`/puzzles/${slug}`);
    return data;
  },

  // ── Progress & submission (requires authentication) ─────────────────────────

  /**
   * Submit final answers for checking.
   * Server checks against solution, records progress, and updates user stats.
   */
  submitPuzzle: async (
    slug: string,
    answers: Record<string, string>
  ): Promise<SubmitResult> => {
    const { data } = await api.post<SubmitResult>(`/puzzles/${slug}/submit`, { answers });
    return data;
  },

  /**
   * Auto-save in-progress answers (does not mark as completed).
   * Safe to call frequently (debounced in UI).
   */
  savePuzzleProgress: async (
    slug: string,
    answers: Record<string, string>
  ): Promise<void> => {
    await api.post(`/puzzles/${slug}/progress`, { answers });
  },

  /**
   * Get previously saved progress for a puzzle (to restore state on reload).
   * Returns null if no progress exists.
   */
  getPuzzleProgress: async (slug: string): Promise<PuzzleProgress | null> => {
    const { data } = await api.get<PuzzleProgress | null>(`/puzzles/${slug}/progress`);
    return data;
  },
};
