import client from './api';
import { User } from '../types';

export const authService = {
  register: async (email: string, username: string, password: string, firstName?: string, lastName?: string) => {
    const response = await client.post('/auth/register', {
      email,
      username,
      password,
      firstName,
      lastName,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/auth/me');
    return response.data;
  },
};
