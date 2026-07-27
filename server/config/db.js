import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMockDB = false;
const mockDataDir = path.resolve('data');

if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir, { recursive: true });
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('⚠️ No MONGODB_URI found in environment variables. Falling back to Mock JSON Database.');
    isMockDB = true;
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    isMockDB = false;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.warn('⚠️ Falling back to Mock JSON Database.');
    isMockDB = true;
  }
};

export const getDbMode = () => isMockDB;
export { mockDataDir };
