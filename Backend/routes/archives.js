const express = require('express');
const router = express.Router();
const Archive = require('../models/Archive');
const { uploadFile } = require('../utils/azureStorage');

// Get all archives
router.get('/', async (req, res) => {
  try {
    const archives = await Archive.find().populate('createdBy');
    res.json(archives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload file to archive

router.post('/upload', async (req, res) => {
    try {
      if (!req.files?.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const { data, name, mimetype } = req.files.file;
      const contentUrl = await uploadFile(data, name, mimetype);
  
      const newArchive = new Archive({
        ...req.body,
        contentUrl,
        fileType: mimetype,
        fileSize: data.byteLength,
        type: 'file'
      });
  
      await newArchive.save();
      res.status(201).json(newArchive);
  
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'File upload failed',
        details: error.message
      });
    }
  });
module.exports = router;