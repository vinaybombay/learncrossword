import client from './api';
import { UserStats } from '../types';

export const userService = {
  getUserProgress: async (userId: string) => {
    const response = await client.get(`/users/${userId}/progress`);
    return response.data;
  },

  getUserStats: async (userId: string): Promise<UserStats> => {
    const response = await client.get(`/users/${userId}/stats`);
    return response.data;
  },

  updateUserProfile: async (userId: string, firstName?: string, lastName?: string, avatar?: string) => {
    const response = await client.put(`/users/${userId}/profile`, {
      firstName,
      lastName,
      avatar,
    });
    return response.data;
  },
};
