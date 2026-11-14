import { pool } from '../config/database';

interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Lay tat ca the loai
 */
export async function getAllCategories(): Promise<Category[]> {
  const result = await pool.query<Category>(
    'SELECT category_id, category_name, description, created_at, updated_at FROM categories ORDER BY category_name ASC'
  );
  return result.rows;
}

/**
 * Lay the loai theo ID
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await pool.query<Category>(
    'SELECT category_id, category_name, description, created_at, updated_at FROM categories WHERE category_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Them the loai moi
 */
export async function createCategory(categoryName: string, description?: string): Promise<Category> {
  // Kiem tra ten da ton tai chua
  const checkResult = await pool.query(
    'SELECT category_id FROM categories WHERE category_name = $1',
    [categoryName]
  );

  if (checkResult.rows.length > 0) {
    throw new Error('Ten the loai da ton tai');
  }

  const result = await pool.query<Category>(
    'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING category_id, category_name, description, created_at, updated_at',
    [categoryName, description || null]
  );

  return result.rows[0];
}

/**
 * Cap nhat the loai
 */
export async function updateCategory(id: number, categoryName: string, description?: string): Promise<Category> {
  // Kiem tra ten da ton tai chua (tru chinh no)
  const checkResult = await pool.query(
    'SELECT category_id FROM categories WHERE category_name = $1 AND category_id != $2',
    [categoryName, id]
  );

  if (checkResult.rows.length > 0) {
    throw new Error('Ten the loai da ton tai');
  }

  const result = await pool.query<Category>(
    'UPDATE categories SET category_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE category_id = $3 RETURNING category_id, category_name, description, created_at, updated_at',
    [categoryName, description || null, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay the loai');
  }

  return result.rows[0];
}

/**
 * Xoa the loai
 */
export async function deleteCategory(id: number): Promise<void> {
  // Kiem tra xem co sach nao dang dung the loai nay khong
  const checkResult = await pool.query(
    'SELECT COUNT(*) as count FROM books WHERE category_id = $1',
    [id]
  );

  const count = parseInt(checkResult.rows[0].count);
  if (count > 0) {
    throw new Error(`Khong the xoa the loai dang duoc su dung boi ${count} cuon sach`);
  }

  const result = await pool.query(
    'DELETE FROM categories WHERE category_id = $1 RETURNING category_id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay the loai');
  }
}
