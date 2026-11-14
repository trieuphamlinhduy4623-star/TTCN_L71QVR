import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index';

/**
 * Middleware kiem tra vai tro nguoi dung (RBAC)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Ban can dang nhap de truy cap'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Ban khong co quyen truy cap chuc nang nay'
      });
      return;
    }

    next();
  };
}
