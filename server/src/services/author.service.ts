import { pool } from '../config/database';

interface Author {
  author_id: number;
  author_name: string;
  biography: string | null;
  nationality: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Lay tat ca tac gia
 */
export async function getAllAuthors(): Promise<Author[]> {
  const result = await pool.query<Author>(
    'SELECT author_id, author_name, biography, nationality, created_at, updated_at FROM authors ORDER BY author_name ASC'
  );
  return result.rows;
}

/**
 * Lay tac gia theo ID
 */
export async function getAuthorById(id: number): Promise<Author | null> {
  const result = await pool.query<Author>(
    'SELECT author_id, author_name, biography, nationality, created_at, updated_at FROM authors WHERE author_id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Them tac gia moi
 */
export async function createAuthor(authorName: string, biography?: string, nationality?: string): Promise<Author> {
  const result = await pool.query<Author>(
    'INSERT INTO authors (author_name, biography, nationality) VALUES ($1, $2, $3) RETURNING author_id, author_name, biography, nationality, created_at, updated_at',
    [authorName, biography || null, nationality || null]
  );

  return result.rows[0];
}

/**
 * Cap nhat tac gia
 */
export async function updateAuthor(id: number, authorName: string, biography?: string, nationality?: string): Promise<Author> {
  const result = await pool.query<Author>(
    'UPDATE authors SET author_name = $1, biography = $2, nationality = $3, updated_at = CURRENT_TIMESTAMP WHERE author_id = $4 RETURNING author_id, author_name, biography, nationality, created_at, updated_at',
    [authorName, biography || null, nationality || null, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay tac gia');
  }

  return result.rows[0];
}

/**
 * Xoa tac gia
 */
export async function deleteAuthor(id: number): Promise<void> {
  // Kiem tra xem co sach nao cua tac gia nay khong
  const checkResult = await pool.query(
    'SELECT COUNT(*) as count FROM book_authors WHERE author_id = $1',
    [id]
  );

  const count = parseInt(checkResult.rows[0].count);
  if (count > 0) {
    throw new Error(`Khong the xoa tac gia dang co ${count} cuon sach`);
  }

  const result = await pool.query(
    'DELETE FROM authors WHERE author_id = $1 RETURNING author_id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay tac gia');
  }
}
