import { pool } from '../config/database';

interface LibraryCard {
  card_id: number;
  user_id: number;
  card_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'locked';
  created_at: string;
  updated_at: string;
}

interface LibraryCardWithUser extends LibraryCard {
  user_email: string;
  user_full_name: string;
  user_phone: string | null;
}

/**
 * Lay tat ca the doc gia
 */
export async function getAllLibraryCards(): Promise<LibraryCardWithUser[]> {
  const result = await pool.query<LibraryCardWithUser>(`
    SELECT 
      lc.card_id, lc.user_id, lc.card_number, 
      lc.issued_date as issue_date, 
      lc.expiry_date, lc.status, lc.created_at, lc.updated_at,
      u.email as user_email, u.full_name as user_full_name, u.phone as user_phone
    FROM library_cards lc
    JOIN users u ON lc.user_id = u.id
    ORDER BY lc.created_at DESC
  `);

  return result.rows;
}

/**
 * Lay the doc gia theo ID
 */
export async function getLibraryCardById(id: number): Promise<LibraryCardWithUser | null> {
  const result = await pool.query<LibraryCardWithUser>(
    `SELECT 
      lc.card_id, lc.user_id, lc.card_number, 
      lc.issued_date as issue_date, 
      lc.expiry_date, lc.status, lc.created_at, lc.updated_at,
      u.email as user_email, u.full_name as user_full_name, u.phone as user_phone
    FROM library_cards lc
    JOIN users u ON lc.user_id = u.id
    WHERE lc.card_id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Lay the doc gia theo user ID
 */
export async function getLibraryCardByUserId(userId: number): Promise<LibraryCardWithUser | null> {
  const result = await pool.query<LibraryCardWithUser>(
    `SELECT 
      lc.card_id, lc.user_id, lc.card_number, lc.issue_date, 
      lc.expiry_date, lc.status, lc.created_at, lc.updated_at,
      u.email as user_email, u.full_name as user_full_name, u.phone as user_phone
    FROM library_cards lc
    JOIN users u ON lc.user_id = u.id
    WHERE lc.user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

/**
 * Tao the doc gia moi
 */
export async function createLibraryCard(
  userId: number,
  expiryMonths: number = 12
): Promise<LibraryCardWithUser> {
  // Kiem tra user da co the chua
  const existingCard = await pool.query(
    'SELECT card_id FROM library_cards WHERE user_id = $1',
    [userId]
  );

  if (existingCard.rows.length > 0) {
    throw new Error('User da co the doc gia');
  }

  // Tao ma the tu dong: LIB + timestamp
  const cardNumber = 'LIB' + Date.now();

  // Tinh ngay het han
  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

  // Thử với card_no trước, nếu lỗi thì dùng card_number
  try {
    const result = await pool.query<LibraryCard>(
      `INSERT INTO library_cards (user_id, card_no, issue_date, expiry_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, cardNumber, issueDate, expiryDate, 'active']
    );

    const card = result.rows[0];
    const fullCard = await getLibraryCardById(card.card_id);
    return fullCard!;
  } catch (error) {
    // Nếu lỗi card_no, thử card_number và issued_date
    const result = await pool.query<LibraryCard>(
      `INSERT INTO library_cards (user_id, card_number, issued_date, expiry_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, cardNumber, issueDate, expiryDate, 'active']
    );

    const card = result.rows[0];
    const fullCard = await getLibraryCardById(card.card_id);
    return fullCard!;
  }
}

/**
 * Cap nhat the doc gia
 */
export async function updateLibraryCard(
  id: number,
  data: {
    expiry_date?: Date;
    status?: 'active' | 'expired' | 'locked';
  }
): Promise<LibraryCardWithUser> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.expiry_date) {
    updates.push(`expiry_date = $${paramCount++}`);
    values.push(data.expiry_date);
  }

  if (data.status) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query<LibraryCard>(
    `UPDATE library_cards 
     SET ${updates.join(', ')}
     WHERE card_id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay the doc gia');
  }

  const fullCard = await getLibraryCardById(id);
  return fullCard!;
}

/**
 * Gia han the doc gia
 */
export async function renewLibraryCard(
  id: number,
  additionalMonths: number = 12
): Promise<LibraryCardWithUser> {
  const card = await getLibraryCardById(id);
  
  if (!card) {
    throw new Error('Khong tim thay the doc gia');
  }

  // Tinh ngay het han moi tu ngay het han cu
  const currentExpiry = new Date(card.expiry_date);
  const now = new Date();
  
  // Neu da het han, gia han tu ngay hom nay
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseDate);
  newExpiry.setMonth(newExpiry.getMonth() + additionalMonths);

  return updateLibraryCard(id, {
    expiry_date: newExpiry,
    status: 'active'
  });
}

/**
 * Xoa the doc gia
 */
export async function deleteLibraryCard(id: number): Promise<void> {
  // Kiem tra xem co phieu muon dang hoat dong khong
  const loanCheck = await pool.query(
    `SELECT COUNT(*) as count 
     FROM loans 
     WHERE card_id = $1 AND status IN ('borrowed', 'reserved')`,
    [id]
  );

  const count = parseInt(loanCheck.rows[0].count);
  if (count > 0) {
    throw new Error('Khong the xoa the dang co phieu muon hoat dong');
  }

  const result = await pool.query(
    'DELETE FROM library_cards WHERE card_id = $1 RETURNING card_id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay the doc gia');
  }
}

/**
 * Cap nhat trang thai the het han tu dong
 */
export async function updateExpiredCards(): Promise<number> {
  const result = await pool.query(
    `UPDATE library_cards 
     SET status = 'expired', updated_at = CURRENT_TIMESTAMP
     WHERE expiry_date < CURRENT_DATE AND status = 'active'
     RETURNING card_id`
  );

  return result.rows.length;
}
