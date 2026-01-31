// Simplified Vercel serverless function
// Direct implementation without importing Express app

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Simple health check
    if (req.url === '/api/health' || req.url === '/') {
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

    // For now, return a simple response for all other routes
    res.status(200).json({
        message: 'StoreMyBottle API - Route not implemented yet',
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};