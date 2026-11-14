import { pool } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/hashPassword';
import { generateToken } from '../utils/jwt';
import type { User, UserWithoutPassword, JwtPayload } from '../types/index';

/**
 * Dang ky tai khoan moi
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<UserWithoutPassword> {
  // Kiem tra email da ton tai chua
  const checkResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (checkResult.rows.length > 0) {
    throw new Error('Email da duoc su dung');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Insert user moi vao database
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash, full_name, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, phone, role, created_at, is_active`,
    [email, passwordHash, fullName, phone || null, 'reader']
  );

  const user = result.rows[0];
  
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    is_active: user.is_active,
  };
}

/**
 * Dang nhap
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserWithoutPassword; token: string }> {
  // Tim user theo email
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Email hoac mat khau khong dung');
  }

  const user = result.rows[0];

  // Kiem tra tai khoan co bi vo hieu hoa khong
  if (!user.is_active) {
    throw new Error('Tai khoan da bi vo hieu hoa');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Email hoac mat khau khong dung');
  }

  // Tao JWT payload
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate token
  const token = generateToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      is_active: user.is_active,
    },
    token,
  };
}

/**
 * Lay thong tin user theo ID
 */
export async function getUserById(userId: number): Promise<UserWithoutPassword | null> {
  const result = await pool.query<User>(
    'SELECT id, email, full_name, phone, role, created_at, is_active FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as UserWithoutPassword;
}
