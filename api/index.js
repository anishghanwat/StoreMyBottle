// Vercel serverless function entry point
// This proxies all requests to the Express app

const app = require('../backend/dist/app.js');

module.exports = app;