// 4.js - Main App
const express = require('express');
const app = express();
const PORT = 3000;

const authRoutes = require('./2');
const fileRoutes = require('./3');

app.use(express.json());

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
