require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const fileUpload = require('express-fileupload');
const { verifyContainer } = require('./utils/azureStorage');

// Middleware
app.use(express.json());
app.use(fileUpload());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// After MongoDB connection
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected');
  try {
    await require('./utils/azureStorage').verifyContainer();
    console.log('Server ready to accept requests');
  } catch (error) {
    console.error('Server initialization failed');
    process.exit(1);
  }
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/archives', require('./routes/archives'));


// Add after express.json() middleware
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}));

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
// Error handler (comes last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});