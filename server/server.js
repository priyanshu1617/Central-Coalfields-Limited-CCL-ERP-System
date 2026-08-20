import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB, getDbMode } from './config/db.js';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import Employee from './models/Employee.js';
import dbHelper from './utils/dbHelper.js';

// Load Env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow sharing of uploaded images/documents
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger Middleware
app.use(morgan('dev'));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Directory static assets
const uploadsDir = path.resolve('uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: getDbMode() ? 'Mock-JSON' : 'MongoDB-Atlas' });
});

// Root-level Alias Redirects (Preserving POST method & body data using HTTP 307)
app.post('/register', (req, res) => {
  res.redirect(307, '/api/auth/register');
});
app.post('/login', (req, res) => {
  res.redirect(307, '/api/auth/login');
});
app.get('/register', (req, res) => {
  res.redirect(301, 'http://localhost:5174/register');
});
app.get('/login', (req, res) => {
  res.redirect(301, 'http://localhost:5174/login');
});

// Bind API Routes
app.use('/api', apiRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  // Self-seed validation for seamless out-of-the-box operation
  try {
    const list = await dbHelper.find(Employee);
    if (list.length === 0) {
      console.log('⚠️ Database is empty. Running automatic seed generator...');
      // Start seeding process dynamically by spawning/running the seeder
      import('./utils/seed.js');
    }
  } catch (error) {
    console.error('Self-seed checking error:', error);
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 CCL ERP Backend Server running on http://localhost:${PORT}`);
    });
  }
};

if (!process.env.VERCEL) {
  startServer();
}
export default app;
