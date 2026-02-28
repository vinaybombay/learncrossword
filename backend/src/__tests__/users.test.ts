import request from 'supertest';
import app from '../app';
import { createTestUser, createTestCrossword } from '../test/helpers';

const BASE = '/api/users';

describe('GET /api/users/:id/progress', () => {
  it('returns 200 with progress array for the authenticated user', async () => {
    const { token, userId } = await createTestUser();
    const res = await request(app)
      .get(`${BASE}/${userId}/progress`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 403 when accessing another user\'s progress', async () => {
    const { token } = await createTestUser('alice@example.com', 'alice');
    const { userId: otherUserId } = await createTestUser('bob@example.com', 'bob');

    const res = await request(app)
      .get(`${BASE}/${otherUserId}/progress`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without authentication', async () => {
    const { userId } = await createTestUser();
    const res = await request(app).get(`${BASE}/${userId}/progress`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:id/stats', () => {
  it('returns 200 with stats object', async () => {
    const { token, userId } = await createTestUser();
    const res = await request(app)
      .get(`${BASE}/${userId}/stats`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPoints');
    expect(res.body).toHaveProperty('level');
    expect(res.body).toHaveProperty('currentStreak');
    expect(res.body).toHaveProperty('longestStreak');
    expect(res.body).toHaveProperty('completedCrosswords');
    expect(res.body).toHaveProperty('totalAttempts');
    expect(res.body).toHaveProperty('completionRate');
  });

  it('returns 403 when accessing another user\'s stats', async () => {
    const { token } = await createTestUser('alice@example.com', 'alice');
    const { userId: otherUserId } = await createTestUser('bob@example.com', 'bob');

    const res = await request(app)
      .get(`${BASE}/${otherUserId}/stats`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns initial stats values for a new user', async () => {
    const { token, userId } = await createTestUser();
    const res = await request(app)
      .get(`${BASE}/${userId}/stats`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalPoints).toBe(0);
    expect(res.body.level).toBe(1);
    expect(res.body.completedCrosswords).toBe(0);
    expect(res.body.totalAttempts).toBe(0);
  });
});

describe('PUT /api/users/:id/profile', () => {
  it('returns 200 with updated profile data', async () => {
    const { token, userId } = await createTestUser();
    const res = await request(app)
      .put(`${BASE}/${userId}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated', lastName: 'Name', avatar: 'avatar_url' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ firstName: 'Updated', lastName: 'Name', avatar: 'avatar_url' });
  });

  it('returns 403 when updating another user\'s profile', async () => {
    const { token } = await createTestUser('alice@example.com', 'alice');
    const { userId: otherId } = await createTestUser('bob@example.com', 'bob');

    const res = await request(app)
      .put(`${BASE}/${otherId}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Hacker' });
    expect(res.status).toBe(403);
  });

  it('returns 401 without authentication', async () => {
    const { userId } = await createTestUser();
    const res = await request(app)
      .put(`${BASE}/${userId}/profile`)
      .send({ firstName: 'NoAuth' });
    expect(res.status).toBe(401);
  });
});
