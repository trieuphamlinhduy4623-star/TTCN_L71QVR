import type { Request } from 'express';

// Interface cho User trong database
export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: 'reader' | 'librarian' | 'admin';
  created_at: Date;
  is_active: boolean;
}

// User không bao gồm password (dùng khi trả về client)
export interface UserWithoutPassword {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'reader' | 'librarian' | 'admin';
  created_at: Date;
  is_active: boolean;
}

// Payload để tạo JWT token
export interface JwtPayload {
  userId: number;
  email: string;
  role: 'reader' | 'librarian' | 'admin';
}

// Request có thêm thông tin user sau khi authenticate
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Response chuẩn của API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
