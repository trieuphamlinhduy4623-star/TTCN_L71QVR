import bcrypt from 'bcrypt';

// Số vòng lặp để tạo salt (10 là chuẩn, càng cao càng bảo mật nhưng chậm hơn)
const SALT_ROUNDS = 10;

/**
 * Băm mật khẩu bằng bcrypt
 * @param password - Mật khẩu gốc
 * @returns Mật khẩu đã được băm
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

/**
 * Kiểm tra mật khẩu có khớp với hash không
 * @param password - Mật khẩu gốc cần kiểm tra
 * @param hash - Mật khẩu đã băm trong database
 * @returns true nếu khớp, false nếu không khớp
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}
