require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: [
    'https://thankful-cliff-0c6d2f510.6.azurestaticapps.net',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const status = {
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    status: 'OK'
  };
  res.status(200).json(status);
});

// Database connection with storage verification
async function initializeApp() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2. Verify Azure Storage
    const azureStorage = require('./utils/azureStorage');
    await azureStorage.verifyContainer();
    console.log('Azure Storage verified');

    // 3. Start server only after successful connections
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port} (accessible from outside)`);
    });

  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1); // Exit with failure code
  }
}

// Route registration (after middleware, before server start)
app.use('/api/users', require('./routes/users'));
app.use('/api/archives', require('./routes/archives'));
app.use('/api/auth', require('./routes/auth'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start the application
initializeApp();