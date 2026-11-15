import { pool } from '../config/database';
import bcrypt from 'bcrypt';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'reader' | 'librarian' | 'admin';
  is_active: boolean;
  created_at: string;
}

/**
 * Lay danh sach tat ca users
 */
export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query<User>(
    `SELECT id, email, full_name, phone, role, is_active, created_at
     FROM users
     ORDER BY created_at DESC`
  );

  return result.rows;
}

/**
 * Lay danh sach users chua co the (chi readers)
 */
export async function getUsersWithoutCard(): Promise<User[]> {
  const result = await pool.query<User>(
    `SELECT u.id, u.email, u.full_name, u.phone, u.role, u.is_active, u.created_at
     FROM users u
     LEFT JOIN library_cards lc ON u.id = lc.user_id
     WHERE lc.card_id IS NULL 
       AND u.is_active = true 
       AND u.role = 'reader'
     ORDER BY u.created_at DESC`
  );

  return result.rows;
}

/**
 * Lay user theo ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Tao user moi (admin only)
 */
export async function createUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'reader' | 'librarian' | 'admin';
}): Promise<User> {
  // Kiem tra email da ton tai
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email da ton tai');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, email, full_name, phone, role, is_active, created_at`,
    [data.email, hashedPassword, data.full_name, data.phone || null, data.role]
  );

  return result.rows[0];
}

/**
 * Cap nhat thong tin user
 */
export async function updateUser(id: number, data: {
  full_name?: string;
  phone?: string;
  role?: 'reader' | 'librarian' | 'admin';
  is_active?: boolean;
}): Promise<User> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.full_name !== undefined) {
    updates.push(`full_name = $${paramCount++}`);
    values.push(data.full_name);
  }

  if (data.phone !== undefined) {
    updates.push(`phone = $${paramCount++}`);
    values.push(data.phone);
  }

  if (data.role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(data.role);
  }

  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(data.is_active);
  }

  if (updates.length === 0) {
    throw new Error('Khong co thong tin cap nhat');
  }

  values.push(id);

  const result = await pool.query<User>(
    `UPDATE users 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, email, full_name, phone, role, is_active, created_at`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay user');
  }

  return result.rows[0];
}

/**
 * Reset password user
 */
export async function resetUserPassword(id: number, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [hashedPassword, id]
  );

  if (result.rowCount === 0) {
    throw new Error('Khong tim thay user');
  }
}

/**
 * Xoa user (soft delete - vo hieu hoa)
 */
export async function deactivateUser(id: number): Promise<void> {
  // Kiem tra user co the doc gia hoac phieu muon khong
  const checkCard = await pool.query(
    'SELECT card_id FROM library_cards WHERE user_id = $1',
    [id]
  );

  if (checkCard.rows.length > 0) {
    throw new Error('Khong the vo hieu hoa user co the doc gia. Vui long xoa the truoc.');
  }

  // Soft delete
  const result = await pool.query(
    'UPDATE users SET is_active = false WHERE id = $1',
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error('Khong tim thay user');
  }
}
