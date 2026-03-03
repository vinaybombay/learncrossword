import request from 'supertest';
import app from '../app';

/**
 * Register a user and return the JWT token + userId.
 */
export async function createTestUser(
  email = 'test@example.com',
  username = 'testuser',
  password = 'Password123'
): Promise<{ token: string; userId: string }> {
  const res = await request(app).post('/api/auth/register').send({
    email,
    username,
    password,
    firstName: 'Test',
    lastName: 'User',
  });

  if (res.status !== 201) {
    throw new Error(`createTestUser failed: ${JSON.stringify(res.body)}`);
  }

  return { token: res.body.token, userId: res.body.user.id };
}
