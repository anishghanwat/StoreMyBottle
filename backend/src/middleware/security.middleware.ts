// Security middleware
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Rate limiting configuration
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(windowMs / 1000),
            timestamp: new Date().toISOString()
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Skip rate limiting in test environment or development with bypass
        skip: (req) => env.nodeEnv === 'test' || (env.nodeEnv === 'development' && process.env.BYPASS_AUTH === 'true')
    });
};

// Different rate limits for different endpoints
export const rateLimiters = {
    // General API rate limit
    general: createRateLimiter(15 * 60 * 1000, env.nodeEnv === 'development' ? 1000 : 100), // 1000 requests per 15 minutes in dev

    // Stricter rate limit for authentication endpoints
    auth: createRateLimiter(15 * 60 * 1000, env.nodeEnv === 'development' ? 200 : 20), // 200 requests per 15 minutes in dev

    // Payment endpoints - more lenient in development
    payment: createRateLimiter(15 * 60 * 1000, env.nodeEnv === 'development' ? 100 : 10), // 100 requests per 15 minutes in dev

    // Moderate rate limit for admin endpoints
    admin: createRateLimiter(15 * 60 * 1000, env.nodeEnv === 'development' ? 500 : 50), // 500 requests per 15 minutes in dev
};

// Security headers middleware
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for API
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Request ID middleware for tracing
export function requestId(req: Request, res: Response, next: NextFunction) {
    const id = req.headers['x-request-id'] as string ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);

    next();
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const requestId = req.headers['x-request-id'];

    // Log request
    console.log(JSON.stringify({
        type: 'request',
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        timestamp: new Date().toISOString()
    }));

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(JSON.stringify({
            type: 'response',
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString()
        }));
    });

    next();
}

// Error handling middleware
export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const requestId = req.headers['x-request-id'];

    // Log error
    console.error(JSON.stringify({
        type: 'error',
        requestId,
        error: error.message,
        stack: env.nodeEnv === 'development' ? error.stack : undefined,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    }));

    // Don't expose internal errors in production
    const message = env.nodeEnv === 'production'
        ? 'Internal server error'
        : error.message;

    res.status(500).json({
        error: message,
        code: 'INTERNAL_ERROR',
        requestId,
        timestamp: new Date().toISOString()
    });
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
    const requestId = req.headers['x-request-id'];

    res.status(404).json({
        error: `Cannot ${req.method} ${req.path}`,
        code: 'NOT_FOUND',
        requestId,
        timestamp: new Date().toISOString()
    });
}