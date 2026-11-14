import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index.js';

// Lấy secret key từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Thời gian hết hạn của token (24 giờ)
const JWT_EXPIRY = '24h';

/**
 * Tạo JWT token từ payload
 * @param payload - Thông tin user (userId, email, role)
 * @returns JWT token string
 */
export function generateToken(payload: JwtPayload): string {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  return token;
}

/**
 * Xác thực và giải mã JWT token
 * @param token - JWT token cần verify
 * @returns JwtPayload nếu hợp lệ, null nếu không hợp lệ
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    // Token không hợp lệ hoặc đã hết hạn
    return null;
  }
}
