import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Database pool connected');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});
