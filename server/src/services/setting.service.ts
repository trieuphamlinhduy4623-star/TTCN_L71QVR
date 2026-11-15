import { pool } from '../config/database';

interface Setting {
  key: string;
  value: string;
  description: string;
}

/**
 * Lay tat ca settings
 */
export async function getAllSettings(): Promise<Setting[]> {
  const result = await pool.query<Setting>('SELECT * FROM settings ORDER BY key');
  return result.rows;
}

/**
 * Lay setting theo key
 */
export async function getSettingByKey(key: string): Promise<Setting | null> {
  const result = await pool.query<Setting>(
    'SELECT * FROM settings WHERE key = $1',
    [key]
  );
  return result.rows[0] || null;
}

/**
 * Lay gia tri setting (trả về string)
 */
export async function getSettingValue(key: string): Promise<string | null> {
  const setting = await getSettingByKey(key);
  return setting ? setting.value : null;
}

/**
 * Lay gia tri setting dang number
 */
export async function getSettingNumber(key: string, defaultValue: number = 0): Promise<number> {
  const value = await getSettingValue(key);
  return value ? parseInt(value) : defaultValue;
}

/**
 * Cap nhat setting
 */
export async function updateSetting(key: string, value: string): Promise<Setting> {
  const result = await pool.query<Setting>(
    `UPDATE settings SET value = $1 WHERE key = $2 RETURNING *`,
    [value, key]
  );

  if (result.rows.length === 0) {
    throw new Error('Khong tim thay setting');
  }

  return result.rows[0];
}

/**
 * Cap nhat nhieu settings cung luc
 */
export async function updateMultipleSettings(settings: { key: string; value: string }[]): Promise<Setting[]> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const updatedSettings: Setting[] = [];
    
    for (const { key, value } of settings) {
      const result = await client.query<Setting>(
        'UPDATE settings SET value = $1 WHERE key = $2 RETURNING *',
        [value, key]
      );
      
      if (result.rows.length > 0) {
        updatedSettings.push(result.rows[0]);
      }
    }
    
    await client.query('COMMIT');
    return updatedSettings;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
