import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let isMockDB = false;

// Mock data directory sits at /server/data/
const mockDataDir = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir, { recursive: true });
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('⚠️  No MONGODB_URI found in .env. Running with Mock JSON Database.');
    isMockDB = true;
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');

    await mongoose.connect(mongoURI, {
      // Modern Mongoose 8.x options (no deprecated flags needed)
      serverSelectionTimeoutMS: 10000,   // Fail fast after 10s if Atlas is unreachable
      socketTimeoutMS: 45000,            // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000,           // Initial connection timeout
      maxPoolSize: 10,                   // Max concurrent connections
      retryWrites: true,
      family: 4,                         // Force IPv4 — fixes most ECONNREFUSED issues on Windows
    });

    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`📂 Database: ${mongoose.connection.db.databaseName}`);
    isMockDB = false;

    // Mongoose connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('  COMMON FIXES FOR MongoDB Atlas Connection Errors:');
    console.warn('  1. Go to MongoDB Atlas → Network Access → Add IP Address');
    console.warn('     → Add "0.0.0.0/0" (Allow access from anywhere) OR your current IP');
    console.warn('  2. Check your MONGODB_URI in server/.env is correct');
    console.warn('  3. Make sure your cluster is not paused on Atlas dashboard');
    console.warn('  4. Try replacing "mongodb+srv://" with "mongodb://" for direct connection');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('⚠️  Falling back to local Mock JSON Database (fully functional).');
    console.warn('');
    isMockDB = true;
  }
};

export const getDbMode = () => isMockDB;
export { mockDataDir };
