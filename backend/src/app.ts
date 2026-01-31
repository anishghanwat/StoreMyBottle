import express, { Request, Response } from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { testConnection } from './config/database';
import { env } from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import venueRoutes from './routes/venue.routes';
import bottleRoutes from './routes/bottle.routes';
import paymentRoutes from './routes/payment.routes';
import redemptionRoutes from './routes/redemption.routes';
import adminRoutes from './routes/admin.routes';

// Import security middleware
import {
  securityHeaders,
  requestId,
  requestLogger,
  errorHandler,
  notFoundHandler
} from './middleware/security.middleware';
import { sanitizeStrings } from './middleware/validation.middleware';

const app = express();

// Security headers (must be first)
app.use(securityHeaders);

// Request ID for tracing
app.use(requestId);

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: env.nodeEnv === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeStrings);

// Request logging (after body parsing)
if (env.nodeEnv !== 'test') {
  app.use(requestLogger);
}

// Clerk authentication middleware
app.use(clerkMiddleware());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bottles', bottleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'StoreMyBottle API is running',
    status: 'ok',
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbConnected = await testConnection();

    const health = {
      message: 'StoreMyBottle API is running',
      status: 'ok',
      version: '1.0.0',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        clerk: 'configured'
      }
    };

    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      services: {
        database: 'error',
        clerk: 'unknown'
      },
      error: env.nodeEnv === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Service unavailable'
    });
  }
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server 
const server = app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
});

// Handle server errors
server.on('error', (error: Error) => {
  console.error('Server error:', error);
  process.exit(1);
});

export default app;