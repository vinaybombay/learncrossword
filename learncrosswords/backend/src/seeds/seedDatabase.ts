import User from '../models/User';
import Crossword from '../models/Crossword';
import UserProgress from '../models/UserProgress';

// Sample cryptic crossword puzzles inspired by Economic Times format
const sampleCrosswords = [
  {
    title: 'Monday Challenge',
    description: 'Start your week with an easy cryptic puzzle',
    difficulty: 'easy',
    gridSize: 7,
    gridData: [
      '.C.A.T.',
      'O.A.R.E',
      '.T.E.S.',
      'E.I.E..',
      '.S.V.A.',
      'T.E.A.R',
      '.A.S.E.'
    ],
    clues: [
      {
        number: 1,
        direction: 'across',
        text: 'Feline animal (3)',
        answer: 'CAT',
        length: 3,
      },
      {
        number: 2,
        direction: 'across',
        text: 'Boat tool (3)',
        answer: 'OAR',
        length: 3,
      },
      {
        number: 3,
        direction: 'across',
        text: 'Examinations (5)',
        answer: 'TESTS',
        length: 5,
      },
      {
        number: 4,
        direction: 'down',
        text: 'Opposite of odd (4)',
        answer: 'EVEN',
        length: 4,
      },
      {
        number: 5,
        direction: 'down',
        text: 'Save or rescue (5)',
        answer: 'SERVE',
        length: 5,
      },
    ],
    hints: [
      {
        clueId: '1',
        level: 1,
        content: 'Meows and purrs',
      },
      {
        clueId: '1',
        level: 2,
        content: 'Whiskers, nine lives',
      },
      {
        clueId: '2',
        level: 1,
        content: 'Used in rowing',
      },
      {
        clueId: '2',
        level: 2,
        content: 'Rhymes with "car"',
      },
    ],
    pointsReward: 100,
    estimatedTime: 10,
    category: 'Beginner',
  },
  {
    title: 'Weekend Puzzle',
    description: 'A medium-difficulty cryptic puzzle for the weekend',
    difficulty: 'medium',
    gridSize: 9,
    gridData: [
      '.C.A.B.S.',
      'O.A.R.E.T',
      '.T.E.S.E.',
      'E.I.E.D.E',
      '.S.V.A.T.',
      'T.E.A.R.S',
      '.A.S.E.L.',
      'M.O.D.L.E',
      '.S.T.U.E.'
    ],
    clues: [
      {
        number: 1,
        direction: 'across',
        text: 'Taxis (4)',
        answer: 'CABS',
        length: 4,
      },
      {
        number: 2,
        direction: 'across',
        text: 'Rowing implement (3)',
        answer: 'OAR',
        length: 3,
      },
      {
        number: 3,
        direction: 'across',
        text: 'Cryptic clue type (5)',
        answer: 'TESTS',
        length: 5,
      },
      {
        number: 4,
        direction: 'across',
        text: 'Mode of transport (7)',
        answer: 'VEHICLE',
        length: 7,
      },
      {
        number: 5,
        direction: 'down',
        text: 'Water drops (5)',
        answer: 'TEARS',
        length: 5,
      },
    ],
    hints: [
      {
        clueId: '1',
        level: 1,
        content: 'Yellow vehicles in cities',
      },
      {
        clueId: '1',
        level: 2,
        content: 'Rhymes with "dabs"',
      },
      {
        clueId: '1',
        level: 3,
        content: 'Plural of cab',
      },
    ],
    pointsReward: 200,
    estimatedTime: 20,
    category: 'Intermediate',
  },
  {
    title: 'Expert Challenge',
    description: 'For experienced crossword solvers only',
    difficulty: 'hard',
    gridSize: 11,
    gridData: [
      '.C.A.B.S.T.',
      'O.A.R.E.T.A',
      '.T.E.S.E.R.',
      'E.I.E.D.E.N',
      '.S.V.A.T.E.',
      'T.E.A.R.S.D',
      '.A.S.E.L.L.',
      'M.O.D.L.E.O',
      '.S.T.U.E.S.',
      'P.L.A.Y.E.R',
      '.D.A.S.H.S.'
    ],
    clues: [
      {
        number: 1,
        direction: 'across',
        text: 'Cryptic: Angry cat ate confused (8)',
        answer: 'DETONATED',
        length: 9,
      },
      {
        number: 2,
        direction: 'across',
        text: 'Cryptic: Designer remorse leads to sadness (5)',
        answer: 'TEARS',
        length: 5,
      },
      {
        number: 3,
        direction: 'across',
        text: 'Cryptic: Scrambled notes produce music (5)',
        answer: 'TONES',
        length: 5,
      },
      {
        number: 4,
        direction: 'down',
        text: 'Cryptic: Rearranged art speaks (5)',
        answer: 'ORATES',
        length: 6,
      },
      {
        number: 5,
        direction: 'down',
        text: 'Cryptic: Candle holder moves quickly (4)',
        answer: 'DASHES',
        length: 6,
      },
    ],
    hints: [
      {
        clueId: '1',
        level: 1,
        content: 'Think about anagrams',
      },
      {
        clueId: '1',
        level: 2,
        content: 'Something "cat" can do',
      },
      {
        clueId: '1',
        level: 3,
        content: 'Anagram of DETONATED',
      },
    ],
    pointsReward: 500,
    estimatedTime: 45,
    category: 'Advanced',
  },
];

export async function seedDatabase() {
  try {
    // Check if crosswords already exist
    const existingCount = await Crossword.countDocuments();
    if (existingCount > 0) {
      console.log('Database already seeded');
      return;
    }

    // Insert sample crosswords
    await Crossword.insertMany(sampleCrosswords);
    console.log('✓ Sample crosswords inserted');

    // Create a sample user for testing
    const sampleUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      totalPoints: 300,
      level: 2,
      currentStreak: 5,
      longestStreak: 10,
    });

    await sampleUser.save();
    console.log('✓ Sample user created');

  } catch (error) {
    console.error('Seeding error:', error);
  }
}
