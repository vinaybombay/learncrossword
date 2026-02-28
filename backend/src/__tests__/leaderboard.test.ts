import request from 'supertest';
import app from '../app';
import { createTestUser } from '../test/helpers';

const BASE = '/api/leaderboard';

describe('GET /api/leaderboard', () => {
  it('returns 200 with leaderboard array and total', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('includes registered users on the leaderboard', async () => {
    await createTestUser('leadertest@example.com', 'leadertest');
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    const usernames = res.body.leaderboard.map((u: any) => u.username);
    expect(usernames).toContain('leadertest');
  });

  it('respects the limit query parameter', async () => {
    // Create 3 users
    await createTestUser('u1@example.com', 'user1');
    await createTestUser('u2@example.com', 'user2');
    await createTestUser('u3@example.com', 'user3');

    const res = await request(app).get(`${BASE}?limit=2`);
    expect(res.status).toBe(200);
    expect(res.body.leaderboard.length).toBeLessThanOrEqual(2);
  });

  it('each entry has rank, username, totalPoints, level fields', async () => {
    await createTestUser('ranked@example.com', 'ranked');
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    const entry = res.body.leaderboard[0];
    expect(entry).toHaveProperty('rank');
    expect(entry).toHaveProperty('username');
    expect(entry).toHaveProperty('totalPoints');
    expect(entry).toHaveProperty('level');
  });

  it('pagination: skip moves the starting rank', async () => {
    await createTestUser('p1@example.com', 'paginate1');
    await createTestUser('p2@example.com', 'paginate2');

    const res = await request(app).get(`${BASE}?skip=1&limit=10`);
    expect(res.status).toBe(200);
    if (res.body.leaderboard.length > 0) {
      expect(res.body.leaderboard[0].rank).toBe(2);
    }
  });
});

describe('GET /api/leaderboard/weekly', () => {
  it('returns 200', async () => {
    const res = await request(app).get(`${BASE}/weekly`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/leaderboard/friends', () => {
  it('returns 200 with a message', async () => {
    const res = await request(app).get(`${BASE}/friends`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
