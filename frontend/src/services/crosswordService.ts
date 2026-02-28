import client from './api';
import { Crossword, UserProgress } from '../types';

export const crosswordService = {
  getCrosswords: async (difficulty?: string, skip = 0, limit = 10) => {
    const response = await client.get('/crosswords', {
      params: { difficulty, skip, limit },
    });
    return response.data;
  },

  getCrosswordById: async (id: string): Promise<Crossword> => {
    const response = await client.get(`/crosswords/${id}`);
    return response.data;
  },

  submitCrossword: async (id: string, answers: Record<number, string>) => {
    const response = await client.post(`/crosswords/${id}/submit`, { answers });
    return response.data;
  },

  getHint: async (crosswordId: string, clueId: string, level: 1 | 2 | 3) => {
    const response = await client.post(`/crosswords/${crosswordId}/hints/${clueId}/${level}`);
    return response.data;
  },
};
