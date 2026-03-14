const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDBs } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

// Security & Proxy Config
app.set('trust proxy', 1);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// ✅ IMPORTANT: Configure CORS to allow your Vercel frontend
app.use(cors({
    origin: ['https://frontend-gamma-lyart-12.vercel.app/', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 1. SERVE UPLOADS DIRECTORY (Keep this if needed)
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ❌ REMOVE this line - frontend is on Vercel, not Render
// app.use(express.static(path.join(__dirname, '../frontend')));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Connected', 
        timestamp: new Date(), 
        engine: 'Llama 3 via Featherless'
    });
});

// ✅ Simple root response for API
app.get('/', (req, res) => {
    res.json({ 
        message: 'CropAI Backend API',
        status: 'running',
        endpoints: {
            health: '/api/health',
            api: '/api/*'
        }
    });
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
connectDBs().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 CropAI Server Running on http://localhost:${PORT}`);
        console.log(`📂 Uploads enabled at: ${path.join(__dirname, 'uploads')}`);
    });
});