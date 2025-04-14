// 3.js - File
const express = require('express');
const multer = require('multer');
const { adminAuth } = require('./1');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', adminAuth, upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', file: req.file });
});

router.delete('/delete/:id', adminAuth, (req, res) => {
  res.json({ message: `File with id ${req.params.id} deleted` });
});

module.exports = router;
