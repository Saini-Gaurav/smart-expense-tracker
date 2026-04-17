import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload & { id: string };
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is invalid or user no longer exists.' });
    }
    const u = user as { _id: typeof user._id; name: string; email: string; currency?: string };
    req.user = {
      _id: u._id,
      name: u.name,
      email: u.email,
      currency: u.currency,
    };
    return next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    return next(error);
  }
};
