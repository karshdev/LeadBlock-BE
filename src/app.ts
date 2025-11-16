import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import leadRoutes from './routes/leadRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { UserModel } from './models/User';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize default admin user
  UserModel.createDefaultAdmin().catch(console.error);

  // Public routes
  app.use('/api/auth', authRoutes);

  // Protected routes
  app.use('/api/leads', leadRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
};

