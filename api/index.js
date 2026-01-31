// Vercel serverless function entry point
// This proxies all requests to the Express app

const path = require('path');

// Import the compiled Express app
const app = require('../backend/dist/app.js');

// Export the default export (the Express app)
module.exports = app.default || app;