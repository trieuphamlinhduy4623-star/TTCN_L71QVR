import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { pool } from './config/database';
import authRoutes from './routes/auth.routes';
import testRoutes from './routes/test.routes';
import categoryRoutes from './routes/category.routes';
import authorRoutes from './routes/author.routes';
import bookRoutes from './routes/book.routes';
import inventoryRoutes from './routes/inventory.routes';
import libraryCardRoutes from './routes/libraryCard.routes';
import userRoutes from './routes/user.routes';
import settingRoutes from './routes/setting.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Library Management System API Server is running...',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      test: '/api/test',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'success',
      message: 'Database connected',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/library-cards', libraryCardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint khong ton tai'
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Loi server'
  });
});

app.listen(port, () => {
  console.log('Server is running at http://localhost:' + port);
  console.log('API Documentation:');
  console.log('   AUTH:');
  console.log('   - POST   /api/auth/register');
  console.log('   - POST   /api/auth/login');
  console.log('   - GET    /api/auth/profile');
  console.log('   TEST RBAC:');
  console.log('   - GET    /api/test/reader');
  console.log('   - GET    /api/test/librarian');
  console.log('   - GET    /api/test/admin');
  console.log('   CATEGORIES:');
  console.log('   - GET    /api/categories');
  console.log('   - GET    /api/categories/:id');
  console.log('   - POST   /api/categories (librarian, admin)');
  console.log('   - PUT    /api/categories/:id (librarian, admin)');
  console.log('   - DELETE /api/categories/:id (librarian, admin)');
  console.log('   AUTHORS:');
  console.log('   - GET    /api/authors');
  console.log('   - GET    /api/authors/:id');
  console.log('   - POST   /api/authors (librarian, admin)');
  console.log('   - PUT    /api/authors/:id (librarian, admin)');
  console.log('   - DELETE /api/authors/:id (librarian, admin)');
  console.log('   BOOKS:');
  console.log('   - GET    /api/books');
  console.log('   - GET    /api/books/:id');
  console.log('   - POST   /api/books (librarian, admin)');
  console.log('   - PUT    /api/books/:id (librarian, admin)');
  console.log('   - DELETE /api/books/:id (librarian, admin)');
  console.log('   INVENTORY:');
  console.log('   - GET    /api/inventory/stats');
  console.log('   - GET    /api/inventory');
  console.log('   - GET    /api/inventory/low-stock');
  console.log('   - POST   /api/inventory/:id/add (librarian, admin)');
  console.log('   - PUT    /api/inventory/:id/adjust (librarian, admin)');
  console.log('   LIBRARY CARDS:');
  console.log('   - GET    /api/library-cards (librarian, admin)');
  console.log('   - GET    /api/library-cards/:id (librarian, admin)');
  console.log('   - POST   /api/library-cards (librarian, admin)');
  console.log('   - PUT    /api/library-cards/:id (librarian, admin)');
  console.log('   - POST   /api/library-cards/:id/renew (librarian, admin)');
  console.log('   - DELETE /api/library-cards/:id (admin)');
  console.log('   USERS:');
  console.log('   - GET    /api/users (admin)');
  console.log('   - GET    /api/users/:id (admin)');
  console.log('   - POST   /api/users (admin)');
  console.log('   - PUT    /api/users/:id (admin)');
  console.log('   - POST   /api/users/:id/reset-password (admin)');
  console.log('   - DELETE /api/users/:id (admin)');
  console.log('   SETTINGS:');
  console.log('   - GET    /api/settings (admin)');
  console.log('   - GET    /api/settings/:key (admin)');
  console.log('   - PUT    /api/settings/:key (admin)');
  console.log('   - POST   /api/settings/batch (admin)');
});

export { pool };
