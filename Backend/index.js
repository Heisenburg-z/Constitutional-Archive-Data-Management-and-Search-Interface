require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
const suggestionsRouter = require('./routes/suggestions');



// Fixed CORS configuration
const corsOptions = {
  origin: [
    'https://thankful-cliff-0c6d2f510.6.azurestaticapps.net',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

// Improved startup sequence
async function initializeApp() {
  // Start server first
  const port = process.env.PORT || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Verify Azure Storage
    const azureStorage = require('./utils/azureStorage');
    await azureStorage.verifyContainer();
    console.log('Azure Storage verified');

  } catch (error) {
    console.error('Non-fatal service error:', error);
    // Don't exit process - server remains running
  }
}

// Route registration (MUST come after CORS setup)
app.use('/api/users', require('./routes/users').router);
app.use('/api/archives', require('./routes/archives'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/search', require('./routes/search'));
// Add this with your other route registrations
app.use('/api/suggestions', suggestionsRouter);
// Add public route
app.use('/api/public/archives', require('./routes/archives').publicRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start the application
initializeApp();