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

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Verify Azure Storage connection
mongoose.connection.once('open', async () => {
  try {
    await require('./utils/azureStorage').verifyContainer();
    console.log('Azure Storage verified');
  } catch (error) {
    console.error('Storage verification failed:', error);
    process.exit(1);
  }
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/archives', require('./routes/archives'));
app.use('/api/auth', require('./routes/auth'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Server start
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});