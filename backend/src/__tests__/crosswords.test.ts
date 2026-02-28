import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { createTestUser, createTestCrossword } from '../test/helpers';

const BASE = '/api/crosswords';

describe('GET /api/crosswords', () => {
  it('returns 200 with crosswords array and total', async () => {
    await createTestCrossword();
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.crosswords)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('returns empty array when no crosswords exist', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body.crosswords).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('filters by difficulty', async () => {
    await createTestCrossword(); // 'easy'
    const res = await request(app).get(`${BASE}?difficulty=easy`);
    expect(res.status).toBe(200);
    expect(res.body.crosswords.length).toBeGreaterThanOrEqual(1);
    res.body.crosswords.forEach((c: any) => expect(c.difficulty).toBe('easy'));
  });

  it('returns empty array for a difficulty with no puzzles', async () => {
    await createTestCrossword(); // easy
    const res = await request(app).get(`${BASE}?difficulty=hard`);
    expect(res.status).toBe(200);
    expect(res.body.crosswords).toHaveLength(0);
  });
});

describe('GET /api/crosswords/:id', () => {
  it('returns 200 with full crossword data', async () => {
    const { crosswordId } = await createTestCrossword();
    const res = await request(app).get(`${BASE}/${crosswordId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Puzzle');
    expect(res.body).toHaveProperty('clues');
    expect(res.body).toHaveProperty('gridData');
  });

  it('returns 404 for a valid but non-existent ObjectId', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`${BASE}/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 for a completely invalid id format', async () => {
    const res = await request(app).get(`${BASE}/not-an-id`);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/crosswords/:id/submit', () => {
  it('returns 401 without authentication', async () => {
    const { crosswordId } = await createTestCrossword();
    const res = await request(app)
      .post(`${BASE}/${crosswordId}/submit`)
      .send({ answers: {} });
    expect(res.status).toBe(401);
  });

  it('returns 200 with completed=true for fully correct answers', async () => {
    const { token } = await createTestUser();
    const { crosswordId } = await createTestCrossword();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: { 1: 'CAT' } });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.correctCount).toBe(1);
    expect(res.body.pointsEarned).toBeGreaterThan(0);
  });

  it('returns 200 with completed=false for wrong answers', async () => {
    const { token } = await createTestUser();
    const { crosswordId } = await createTestCrossword();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: { 1: 'DOG' } });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
    expect(res.body.correctCount).toBe(0);
  });

  it('returns 200 with completed=false for empty answers', async () => {
    const { token } = await createTestUser();
    const { crosswordId } = await createTestCrossword();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: {} });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it('returns 404 for a non-existent crossword', async () => {
    const { token } = await createTestUser();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`${BASE}/${fakeId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: {} });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/crosswords/:id/hints/:clueId/:level', () => {
  it('returns 401 without authentication', async () => {
    const { crosswordId, clueId } = await createTestCrossword();
    const res = await request(app).post(`${BASE}/${crosswordId}/hints/${clueId}/1`);
    expect(res.status).toBe(401);
  });

  it('returns 200 with hint content for level 1', async () => {
    const { token } = await createTestUser();
    const { crosswordId, clueId } = await createTestCrossword();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/hints/${clueId}/1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hint');
    expect(typeof res.body.hint).toBe('string');
    expect(res.body.hint).toBe('A household pet');
  });

  it('returns 200 with correct content for level 2 hint', async () => {
    const { token } = await createTestUser();
    const { crosswordId, clueId } = await createTestCrossword();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/hints/${clueId}/2`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.hint).toBe('It meows');
  });

  it('returns 404 for a non-existent hint level', async () => {
    const { token } = await createTestUser();
    const { crosswordId, clueId } = await createTestCrossword();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/hints/${clueId}/99`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 for a non-existent clue id', async () => {
    const { token } = await createTestUser();
    const { crosswordId } = await createTestCrossword();
    const fakeClueId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`${BASE}/${crosswordId}/hints/${fakeClueId}/1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
