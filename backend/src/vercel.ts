// Vercel-specific entry point
// This exports the Express app without starting the server

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware } from '@clerk/express';

// Import configurations
import { env } from './config/env';
import { testConnection } from './config/database';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/security.middleware';

// Import routes
import paymentRoutes from './routes/payment.routes';
import redemptionRoutes from './routes/redemption.routes';
import venueRoutes from './routes/venue.routes';
import bottleRoutes from './routes/bottle.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: env.nodeEnv === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'https://localhost:5173',
            'https://localhost:5174',
            'https://localhost:5175'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-auth-token']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Clerk authentication middleware
app.use(clerkMiddleware());

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bottles', bottleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'StoreMyBottle API is running',
        status: 'ok',
        version: '1.0.0',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
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

// Export the Express app (don't start server - Vercel handles that)
export default app;