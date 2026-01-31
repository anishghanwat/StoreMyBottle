import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

// CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
    ],
    credentials: true
}));

// Middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Simple test routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'GET test works' });
});

app.post('/api/test', (req, res) => {
    res.json({ message: 'POST test works' });
});

// Bottle routes
app.get('/api/bottles/venue/:venueId', (req, res) => {
    res.json({ message: 'GET bottles by venue works', venueId: req.params.venueId });
});

app.post('/api/bottles', (req, res) => {
    res.json({ message: 'POST bottle works', body: req.body });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: 'connected' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Clean server running on port ${PORT}`);
});