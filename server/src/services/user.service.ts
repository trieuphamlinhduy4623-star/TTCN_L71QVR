import { pool } from '../config/database';

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
