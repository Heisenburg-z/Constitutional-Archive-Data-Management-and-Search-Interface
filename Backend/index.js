
// server/index.js - Fixed and improved
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');

// Import routes
const suggestionsRouter = require('./routes/suggestions');
const archivesRoutes = require('./routes/archives');
const usersRouter = require('./routes/users').router;
const authRouter = require('./routes/auth');
const searchRouter = require('./routes/search');

// Fixed CORS configuration
const corsOptions = {
  origin: [
    'https://thankful-cliff-0c6d2f510.6.azurestaticapps.net',
    'http://localhost:3000',
    process.env.FRONTEND_URL // Add from env if available
  ].filter(Boolean), // Filter out undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const status = {
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    status: 'OK'
  };
  res.status(200).json(status);
});

// Route registration (MUST come after CORS setup)
app.use('/api/users', usersRouter);
app.use('/api/archives', archivesRoutes.router);
app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/suggestions', suggestionsRouter);

// Public routes - no authentication required
app.use('/api/public/archives', archivesRoutes.publicRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Improved startup sequence
async function initializeApp() {
  // Start server first
  const port = process.env.PORT || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });

  // Set up graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB connection options
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Verify Azure Storage
    const azureStorage = require('./utils/azureStorage');
    await azureStorage.verifyContainer();
    console.log('Azure Storage verified');

  } catch (error) {
    console.error('Non-fatal service error:', error);
    // Don't exit process - server remains running with limited functionality
  }
}

// Start the application
initializeApp();