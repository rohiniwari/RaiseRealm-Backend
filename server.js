require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const commentRoutes = require('./routes/commentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const impactRoutes = require('./routes/impactRoutes');
const aiRoutes = require('./routes/aiRoutes');


const app = express();

const PORT = process.env.PORT || 5000;

// CORS configuration - allow all Vercel and Netlify frontends
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://raiserealm.vercel.app',
    'https://www.raiserealm.vercel.app',
    'https://raise-realm-frontend-git-master-rohini-tiwari-s-projects.vercel.app',
    'https://raise-realm-frontend-1a2yto1s4-rohini-tiwari-s-projects.vercel.app',
    'https://raise-realm-frontend-56xw0xr6b-rohini-tiwari-s-projects.vercel.app',
    'https://raise-realm-frontend.vercel.app',
    'https://raise-realm.netlify.app',
    'https://www.raise-realm.netlify.app'
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/ai', aiRoutes);


// Root endpoint - returns a simple message
app.get('/', (req, res) => {
  res.json({ 
    message: 'RaiseRealm Backend API is Running',
    version: '1.0.0'
  });
});

// Health check endpoint

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabaseUrlExists: !!process.env.SUPABASE_URL,
    supabaseKeyExists: !!process.env.SUPABASE_ANON_KEY
  });
});

// -----------------------------------------------------------------------
// Serve frontend when running in production and when build exists
// -----------------------------------------------------------------------
// Only serve frontend if the dist folder actually exists

const distPath = path.join(__dirname, '../frontend/dist');
const distExists = fs.existsSync(distPath);

if (distExists) {
  console.log('Frontend dist found, serving static files...');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    // if the request starts with /api we should let the API routes handle it
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('Frontend dist not found. API-only mode.');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RaiseRealm API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
