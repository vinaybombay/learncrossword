import api from './api';
import { Puzzle } from '../types';

export const puzzleService = {
  /**
   * Get the daily puzzle(s).
   * - With difficulty: returns the single puzzle for that difficulty.
   * - Without: returns an array of all difficulties for today.
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
};
