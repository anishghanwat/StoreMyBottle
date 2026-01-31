// Environment variable validation and configuration
import { config } from 'dotenv';

// Load environment variables
config();

interface Config {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    clerkSecretKey: string;
    clerkPublishableKey: string;
    allowBartenderUserIds?: string[];
    allowAdminUserIds?: string[];
    logLevel: string;
}

function validateEnv(): Config {
    const requiredEnvVars = [
        'DATABASE_URL',
        'CLERK_SECRET_KEY',
        'CLERK_PUBLISHABLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        console.error('Available environment variables:', Object.keys(process.env).filter(key => !key.includes('PASSWORD')).join(', '));
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate NODE_ENV
    const nodeEnv = process.env.NODE_ENV || 'production';
    if (!['development', 'production', 'test'].includes(nodeEnv)) {
        console.warn(`Invalid NODE_ENV: ${nodeEnv}, defaulting to production`);
    }

    // Validate PORT
    const port = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
        console.warn(`Invalid PORT: ${process.env.PORT}, defaulting to 3000`);
    }

    // Parse development user IDs (only in development)
    let allowBartenderUserIds: string[] | undefined;
    let allowAdminUserIds: string[] | undefined;

    if (nodeEnv === 'development') {
        if (process.env.ALLOW_BARTENDER_USER_IDS) {
            allowBartenderUserIds = process.env.ALLOW_BARTENDER_USER_IDS
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length > 0);
        }

        if (process.env.ALLOW_ADMIN_USER_IDS) {
            allowAdminUserIds = process.env.ALLOW_ADMIN_USER_IDS
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length > 0);
        }
    }

    console.log(`Environment validated: NODE_ENV=${nodeEnv}, PORT=${port}`);

    return {
        port: isNaN(port) ? 3000 : port,
        nodeEnv: ['development', 'production', 'test'].includes(nodeEnv) ? nodeEnv : 'production',
        databaseUrl: process.env.DATABASE_URL!,
        clerkSecretKey: process.env.CLERK_SECRET_KEY!,
        clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
        allowBartenderUserIds,
        allowAdminUserIds,
        logLevel: process.env.LOG_LEVEL || 'info'
    };
}

export const env = validateEnv();

// Warn about development-only features in production
if (env.nodeEnv === 'production') {
    if (env.allowBartenderUserIds || env.allowAdminUserIds) {
        console.warn('WARNING: Development user ID bypasses are enabled in production!');
    }
}