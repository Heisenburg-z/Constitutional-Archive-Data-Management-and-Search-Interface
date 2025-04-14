//- Auth login
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'your-secret-key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password123') {
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
