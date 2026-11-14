import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { pool } from './config/database';
import authRoutes from './routes/auth.routes';
import testRoutes from './routes/test.routes';
import categoryRoutes from './routes/category.routes';
import authorRoutes from './routes/author.routes';

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
  console.log('   - DELETE /api/categories/:id (admin)');
  console.log('   AUTHORS:');
  console.log('   - GET    /api/authors');
  console.log('   - GET    /api/authors/:id');
  console.log('   - POST   /api/authors (librarian, admin)');
  console.log('   - PUT    /api/authors/:id (librarian, admin)');
  console.log('   - DELETE /api/authors/:id (admin)');
});

export { pool };
