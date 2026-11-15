import { pool } from '../config/database';

interface InventoryStats {
  total_books: number;
  total_quantity: number;
  available_quantity: number;
  borrowed_quantity: number;
  low_stock_books: number;
}

interface BookInventory {
  book_id: number;
  title: string;
  category_name: string | null;
  quantity: number;
  available_quantity: number;
  borrowed_quantity: number;
  stock_status: 'available' | 'low' | 'out';
}

/**
 * Lay thong ke tong quan ton kho
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  const statsResult = await pool.query(`
    SELECT 
      COUNT(DISTINCT book_id) as total_books,
      SUM(quantity) as total_quantity,
      SUM(available_quantity) as available_quantity
    FROM books
  `);

  const stats = statsResult.rows[0];
  const totalQuantity = parseInt(stats.total_quantity) || 0;
  const availableQuantity = parseInt(stats.available_quantity) || 0;
  const borrowedQuantity = totalQuantity - availableQuantity;

  // Dem so sach sap het (available <= 2)
  const lowStockResult = await pool.query(`
    SELECT COUNT(*) as count
    FROM books
    WHERE available_quantity > 0 AND available_quantity <= 2
  `);

  return {
    total_books: parseInt(stats.total_books) || 0,
    total_quantity: totalQuantity,
    available_quantity: availableQuantity,
    borrowed_quantity: borrowedQuantity,
    low_stock_books: parseInt(lowStockResult.rows[0].count) || 0
  };
}

/**
 * Lay danh sach sach voi thong tin ton kho
 */
export async function getInventoryList(): Promise<BookInventory[]> {
  const result = await pool.query(`
    SELECT 
      b.book_id,
      b.title,
      c.category_name,
      b.quantity,
      b.available_quantity,
      (b.quantity - b.available_quantity) as borrowed_quantity,
      CASE 
        WHEN b.available_quantity = 0 THEN 'out'
        WHEN b.available_quantity <= 2 THEN 'low'
        ELSE 'available'
      END as stock_status
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    ORDER BY b.available_quantity ASC, b.title ASC
  `);

  return result.rows;
}

/**
 * Cap nhat so luong sach (nhap them)
 */
export async function addBookStock(bookId: number, additionalQuantity: number): Promise<void> {
  if (additionalQuantity <= 0) {
    throw new Error('So luong them phai lon hon 0');
  }

  const result = await pool.query(
    `UPDATE books 
     SET quantity = quantity + $1,
         available_quantity = available_quantity + $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE book_id = $2
     RETURNING book_id`,
    [additionalQuantity, bookId]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay sach');
  }
}

/**
 * Dieu chinh so luong sach (set truc tiep)
 */
export async function adjustBookStock(bookId: number, newQuantity: number): Promise<void> {
  if (newQuantity < 0) {
    throw new Error('So luong khong the am');
  }

  // Lay so luong hien tai
  const currentResult = await pool.query(
    'SELECT quantity, available_quantity FROM books WHERE book_id = $1',
    [bookId]
  );

  if (currentResult.rows.length === 0) {
    throw new Error('Khong tim thay sach');
  }

  const currentBook = currentResult.rows[0];
  const borrowedQty = currentBook.quantity - currentBook.available_quantity;

  // Kiem tra: so luong moi phai >= so luong dang muon
  if (newQuantity < borrowedQty) {
    throw new Error(`Khong the giam so luong xuong duoi ${borrowedQty} (dang co ${borrowedQty} ban dang duoc muon)`);
  }

  const newAvailable = newQuantity - borrowedQty;

  await pool.query(
    `UPDATE books 
     SET quantity = $1,
         available_quantity = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE book_id = $3`,
    [newQuantity, newAvailable, bookId]
  );
}

/**
 * Lay sach sap het hang (available <= threshold)
 */
export async function getLowStockBooks(threshold: number = 2): Promise<BookInventory[]> {
  const result = await pool.query(
    `SELECT 
      b.book_id,
      b.title,
      c.category_name,
      b.quantity,
      b.available_quantity,
      (b.quantity - b.available_quantity) as borrowed_quantity,
      'low' as stock_status
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.category_id
    WHERE b.available_quantity > 0 AND b.available_quantity <= $1
    ORDER BY b.available_quantity ASC, b.title ASC`,
    [threshold]
  );

  return result.rows;
}
