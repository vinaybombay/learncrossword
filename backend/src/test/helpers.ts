import request from 'supertest';
import app from '../app';
import Crossword from '../models/Crossword';

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

/**
 * Seed a minimal crossword.
 * Returns { crosswordId, clueId } — clueId is the clue subdoc's ObjectId string,
 * which is what the hints endpoint expects in the URL.
 */
export async function createTestCrossword(): Promise<{ crosswordId: string; clueId: string }> {
  // Create without hints first so we can get the clue's _id
  const crossword = await Crossword.create({
    title: 'Test Puzzle',
    description: 'A test puzzle',
    difficulty: 'easy',
    gridSize: 3,
    gridData: ['CAT', '...', '...'],
    clues: [
      {
        number: 1,
        direction: 'across',
        text: 'Feline (3)',
        answer: 'CAT',
        length: 3,
      },
    ],
    hints: [],
    pointsReward: 100,
    estimatedTime: 5,
    category: 'animals',
  });

  // Use the clue subdocument's real ObjectId for the hints
  const clueId = (crossword.clues[0]._id as any).toString();
  crossword.hints.push({ clueId: clueId as any, level: 1, content: 'A household pet' } as any);
  crossword.hints.push({ clueId: clueId as any, level: 2, content: 'It meows' } as any);
  crossword.hints.push({ clueId: clueId as any, level: 3, content: 'C_T' } as any);
  await crossword.save();

  return { crosswordId: (crossword._id as any).toString(), clueId };
}
