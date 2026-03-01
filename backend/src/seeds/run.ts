import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from './seedDatabase';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learncrosswords';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected');

  await seedDatabase();

  await mongoose.disconnect();
  console.log('✓ Done — disconnected from MongoDB');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
