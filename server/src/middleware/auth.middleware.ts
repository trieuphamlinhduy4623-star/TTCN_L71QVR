import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware xac thuc JWT token
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Khong tim thay token xac thuc'
    });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Token khong hop le hoac da het han'
    });
    return;
  }

  req.user = decoded;
  next();
}
