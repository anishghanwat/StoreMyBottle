// Input validation middleware
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// Common validation schemas
export const schemas = {
    uuid: z.string().uuid('Invalid UUID format'),
    positiveNumber: z.number().positive('Must be a positive number'),
    nonEmptyString: z.string().min(1, 'Cannot be empty').max(255, 'Too long (max 255 characters)'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format'),
    pegSize: z.number().refine(val => [30, 45, 60].includes(val), 'Peg size must be 30, 45, or 60 ml'),
    paymentStatus: z.enum(['pending', 'paid', 'cancelled']),
    userRole: z.enum(['customer', 'bartender', 'admin']),

    // Venue validation
    venue: z.object({
        name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
        address: z.string().min(1, 'Address is required').max(500, 'Address too long')
    }),

    // Bottle validation
    bottle: z.object({
        venue_id: z.string().uuid('Invalid venue ID'),
        name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
        brand: z.string().min(1, 'Brand is required').max(255, 'Brand too long'),
        price: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
        total_ml: z.number().int('Total ML must be an integer').positive('Total ML must be positive').max(10000, 'Total ML too high'),
        is_active: z.boolean().optional()
    }),

    // Purchase validation
    purchase: z.object({
        bottle_id: z.string().uuid('Invalid bottle ID')
    }),

    // Redemption validation
    redemption: z.object({
        purchase_id: z.string().uuid('Invalid purchase ID'),
        peg_size_ml: z.number().refine(val => [30, 45, 60].includes(val), 'Peg size must be 30, 45, or 60 ml')
    }),

    // QR scan validation
    qrScan: z.object({
        qr_data: z.string().min(1, 'QR data is required')
    }),

    // Pagination validation
    pagination: z.object({
        page: z.number().int().positive().optional().default(1),
        limit: z.number().int().positive().max(100).optional().default(20)
    }),

    // ID parameter validation
    idParam: z.object({
        id: z.string().uuid('Invalid ID format')
    }),

    // Venue ID parameter validation
    venueIdParam: z.object({
        venueId: z.string().uuid('Invalid venue ID format')
    })
};

// Validation middleware factory
export function validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));

                res.status(400).json({
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: errors,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(400).json({
                    error: 'Invalid request data',
                    code: 'INVALID_DATA',
                    timestamp: new Date().toISOString()
                });
            }
        }
    };
}

// Validate URL parameters
export function validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));

                res.status(400).json({
                    error: 'Invalid URL parameters',
                    code: 'INVALID_PARAMS',
                    details: errors,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(400).json({
                    error: 'Invalid URL parameters',
                    code: 'INVALID_PARAMS',
                    timestamp: new Date().toISOString()
                });
            }
        }
    };
}

// Validate query parameters
export function validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Convert string query params to appropriate types
            const query: any = { ...req.query };
            if (query.page) query.page = parseInt(query.page as string, 10);
            if (query.limit) query.limit = parseInt(query.limit as string, 10);

            const validated = schema.parse(query);
            req.query = validated as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));

                res.status(400).json({
                    error: 'Invalid query parameters',
                    code: 'INVALID_QUERY',
                    details: errors,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(400).json({
                    error: 'Invalid query parameters',
                    code: 'INVALID_QUERY',
                    timestamp: new Date().toISOString()
                });
            }
        }
    };
}

// Sanitize string inputs
export function sanitizeStrings(req: Request, res: Response, next: NextFunction) {
    function sanitizeValue(value: any): any {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            return value
                .trim()
                .replace(/[<>]/g, '') // Remove < and > to prevent XSS
                .replace(/[\x00-\x1f\x7f]/g, ''); // Remove control characters
        }
        if (typeof value === 'object' && value !== null) {
            const sanitized: any = Array.isArray(value) ? [] : {};
            for (const key in value) {
                sanitized[key] = sanitizeValue(value[key]);
            }
            return sanitized;
        }
        return value;
    }

    // Only sanitize body (query and params are handled by validation middleware)
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }

    next();
}