import client from './api';

export const leaderboardService = {
  getLeaderboard: async (skip = 0, limit = 50) => {
    const response = await client.get('/leaderboard', {
      params: { skip, limit },
    });
    return response.data;
  },

  getWeeklyLeaderboard: async (skip = 0, limit = 50) => {
    const response = await client.get('/leaderboard/weekly', {
      params: { skip, limit },
    });
    return response.data;
  },

  getFriendsLeaderboard: async () => {
    const response = await client.get('/leaderboard/friends');
    return response.data;
  },
};
