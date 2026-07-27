import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';
import dbHelper from '../utils/dbHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ccl-secret-key-12345';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelper.findById(Employee, decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found with this token' });
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token expired or invalid' });
  }
};
export { JWT_SECRET };
