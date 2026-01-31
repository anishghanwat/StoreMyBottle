// Simple health check function for testing
module.exports = (req, res) => {
    res.json({
        status: 'ok',
        message: 'StoreMyBottle API is running on Vercel',
        timestamp: new Date().toISOString(),
        environment: 'production'
    });
};