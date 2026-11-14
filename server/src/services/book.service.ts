import { pool } from '../config/database';

interface Book {
  book_id: number;
  title: string;
  isbn: string | null;
  publisher: string | null;
  publish_year: number | null;
  category_id: number | null;
  description: string | null;
  quantity: number;
  available_quantity: number;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

interface BookWithDetails extends Book {
  category_name: string | null;
  authors: Array<{ author_id: number; author_name: string }>;
}

/**
 * Lay tat ca sach
 */
export async function getAllBooks(): Promise<BookWithDetails[]> {
  const booksResult = await pool.query<Book>(
    `SELECT b.book_id, b.title, b.isbn, b.publisher, b.publish_year, 
            b.category_id, b.description, b.quantity, b.available_quantity, 
            b.cover_image, b.created_at, b.updated_at,
            c.category_name
     FROM books b
     LEFT JOIN categories c ON b.category_id = c.category_id
     ORDER BY b.created_at DESC`
  );

  // Lay tac gia cho moi cuon sach
  const books: BookWithDetails[] = [];
  for (const book of booksResult.rows) {
    const authorsResult = await pool.query(
      `SELECT a.author_id, a.author_name
       FROM book_authors ba
       JOIN authors a ON ba.author_id = a.author_id
       WHERE ba.book_id = $1`,
      [book.book_id]
    );

    books.push({
      ...book,
      authors: authorsResult.rows
    });
  }

  return books;
}

/**
 * Lay sach theo ID
 */
export async function getBookById(id: number): Promise<BookWithDetails | null> {
  const bookResult = await pool.query<Book>(
    `SELECT b.book_id, b.title, b.isbn, b.publisher, b.publish_year, 
            b.category_id, b.description, b.quantity, b.available_quantity, 
            b.cover_image, b.created_at, b.updated_at,
            c.category_name
     FROM books b
     LEFT JOIN categories c ON b.category_id = c.category_id
     WHERE b.book_id = $1`,
    [id]
  );

  if (bookResult.rows.length === 0) {
    return null;
  }

  const book = bookResult.rows[0];

  // Lay tac gia
  const authorsResult = await pool.query(
    `SELECT a.author_id, a.author_name
     FROM book_authors ba
     JOIN authors a ON ba.author_id = a.author_id
     WHERE ba.book_id = $1`,
    [id]
  );

  return {
    ...book,
    authors: authorsResult.rows
  };
}

/**
 * Them sach moi
 */
export async function createBook(bookData: {
  title: string;
  isbn?: string;
  publisher?: string;
  publish_year?: number;
  category_id?: number;
  description?: string;
  quantity: number;
  cover_image?: string;
  author_ids: number[];
}): Promise<BookWithDetails> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Them sach
    const bookResult = await client.query<Book>(
      `INSERT INTO books (title, isbn, publisher, publish_year, category_id, description, quantity, available_quantity, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        bookData.title,
        bookData.isbn || null,
        bookData.publisher || null,
        bookData.publish_year || null,
        bookData.category_id || null,
        bookData.description || null,
        bookData.quantity,
        bookData.quantity, // available_quantity ban dau bang quantity
        bookData.cover_image || null
      ]
    );

    const book = bookResult.rows[0];

    // Them tac gia
    if (bookData.author_ids && bookData.author_ids.length > 0) {
      for (const authorId of bookData.author_ids) {
        await client.query(
          'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
          [book.book_id, authorId]
        );
      }
    }

    await client.query('COMMIT');

    // Lay lai sach voi thong tin day du
    const fullBook = await getBookById(book.book_id);
    return fullBook!;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cap nhat sach
 */
export async function updateBook(
  id: number,
  bookData: {
    title: string;
    isbn?: string;
    publisher?: string;
    publish_year?: number;
    category_id?: number;
    description?: string;
    quantity: number;
    cover_image?: string;
    author_ids: number[];
  }
): Promise<BookWithDetails> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Cap nhat thong tin sach
    const bookResult = await client.query<Book>(
      `UPDATE books 
       SET title = $1, isbn = $2, publisher = $3, publish_year = $4, 
           category_id = $5, description = $6, quantity = $7, 
           cover_image = $8, updated_at = CURRENT_TIMESTAMP
       WHERE book_id = $9
       RETURNING *`,
      [
        bookData.title,
        bookData.isbn || null,
        bookData.publisher || null,
        bookData.publish_year || null,
        bookData.category_id || null,
        bookData.description || null,
        bookData.quantity,
        bookData.cover_image || null,
        id
      ]
    );

    if (bookResult.rows.length === 0) {
      throw new Error('Khong tim thay sach');
    }

    // Xoa tac gia cu
    await client.query('DELETE FROM book_authors WHERE book_id = $1', [id]);

    // Them tac gia moi
    if (bookData.author_ids && bookData.author_ids.length > 0) {
      for (const authorId of bookData.author_ids) {
        await client.query(
          'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
          [id, authorId]
        );
      }
    }

    await client.query('COMMIT');

    // Lay lai sach voi thong tin day du
    const fullBook = await getBookById(id);
    return fullBook!;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Xoa sach
 */
export async function deleteBook(id: number): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Kiem tra xem sach co dang duoc muon khong
    const loanCheck = await client.query(
      `SELECT COUNT(*) as count 
       FROM loan_items li
       JOIN loans l ON li.loan_id = l.loan_id
       WHERE li.book_id = $1 AND l.status IN ('borrowed', 'reserved')`,
      [id]
    );

    const count = parseInt(loanCheck.rows[0].count);
    if (count > 0) {
      throw new Error('Khong the xoa sach dang duoc muon hoac dat truoc');
    }

    // Xoa lien ket tac gia
    await client.query('DELETE FROM book_authors WHERE book_id = $1', [id]);

    // Xoa sach
    const result = await client.query(
      'DELETE FROM books WHERE book_id = $1 RETURNING book_id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Khong tim thay sach');
    }

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
