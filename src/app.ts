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
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000','https://leadblock-fe.vercel.app/'];
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  // Root route
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'LeadBlocks API Server',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        leads: '/api/leads',
      },
    });
  });

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

