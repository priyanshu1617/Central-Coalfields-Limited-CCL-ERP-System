import app from '../server/server.js';
import { connectDB } from '../server/config/db.js';

let dbConnected = false;

export default async (req, res) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  return app(req, res);
};
