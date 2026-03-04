import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { startPuzzleScheduler } from './cron/puzzleScheduler';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learncrosswords');
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectDatabase();
    if (process.env.NODE_ENV !== 'test') {
      startPuzzleScheduler();
    }
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
