// Vercel API endpoint - simplified approach
// Updated to fix entrypoint detection
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Simple health check for now
    if (req.url === '/api/health' || req.url === '/' || req.url === '/api') {
        res.status(200).json({
            status: 'ok',
            message: 'StoreMyBottle API is running on Vercel',
            timestamp: new Date().toISOString(),
            environment: 'production',
            url: req.url,
            method: req.method
        });
        return;
    }

    // For other routes, return a placeholder
    res.status(200).json({
        message: 'StoreMyBottle API - Endpoint not implemented yet',
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
}