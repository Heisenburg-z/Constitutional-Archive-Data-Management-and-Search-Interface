//Backend/routes/archives.js
const express = require('express');
const router = express.Router();
const Archive = require('../models/Archive');
const { uploadFile, listDirectories } = require('../utils/azureStorage');
const authenticate = require('../middleware/auth');

// Get all archives
router.get('/', authenticate, async (req, res) => {
  try {
    const archives = await Archive.find().populate('createdBy');
    res.json(archives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get directories for parent selection
router.get('/directories', authenticate, async (req, res) => {
  try {
    // Get all directories from database
    const directories = await Archive.find({ 
      type: 'directory',
      ...(req.query.parentId ? { parentId: req.query.parentId } : {})
    }).sort({ name: 1 });
    
    // Build tree structure for nested directories
    if (!req.query.parentId) {
      // Return root level directories
      const rootDirs = directories.filter(dir => !dir.parentId);
      
      // Add children property to each directory
      const dirsWithChildren = rootDirs.map(dir => {
        const childDirs = directories.filter(
          childDir => childDir.parentId && childDir.parentId.toString() === dir._id.toString()
        );
        
        return {
          ...dir.toObject(),
          children: childDirs
        };
      });
      
      return res.json(dirsWithChildren);
    }
    
    // If parentId is provided, return direct children
    res.json(directories);
    
  } catch (err) {
    console.error('Error fetching directories:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new directory
router.post('/directory', authenticate, async (req, res) => {
  try {
    const { name, parentId, metadata, accessLevel } = req.body;
    
    const newDirectory = new Archive({
      name,
      parentId: parentId || null,
      type: 'directory',
      metadata,
      accessLevel: accessLevel || 'public',
      createdBy:req.user._id,
      createdAt: new Date()
    });
    
    const savedDirectory = await newDirectory.save();
    
    // Update parent's children array if parent exists
    if (parentId) {
      await Archive.findByIdAndUpdate(
        parentId,
        { $push: { children: savedDirectory._id } }
      );
    }
    
    res.status(201).json(savedDirectory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload file to archive and save metadata
router.post('/upload', authenticate, async (req, res) => {
  try {
    if (!req.files?.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { data, name, mimetype } = req.files.file;
    const { parentId, metadata: metadataJson, accessLevel } = req.body;
    
    // Parse metadata
    const metadata = metadataJson ? JSON.parse(metadataJson) : {};
    
    // Get the parent path for Azure Storage
    let parentPath = '';
    
    if (parentId) {
      // Fetch the parent directory and build the full path
      parentPath = await buildDirectoryPath(parentId);
    }
    
    // Upload file to Azure with the correct path
    const contentUrl = await uploadFile(data, name, mimetype, parentPath);
    
    // Create archive document in MongoDB
    const newArchive = new Archive({
      name,
      type: 'file',
      parentId: parentId || null,
      metadata,
      contentUrl,
      fileType: mimetype,
      fileSize: data.byteLength,
      accessLevel: accessLevel || 'public',
      createdBy: req.user._id,
      createdAt: new Date()
    });
    
    const savedArchive = await newArchive.save();
    
    // Update parent's children array if parent exists
    if (parentId) {
      await Archive.findByIdAndUpdate(
        parentId,
        { $push: { children: savedArchive._id } }
      );
    }
    
    res.status(201).json(savedArchive);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      details: error.message
    });
  }
});

// Helper function to build the full path for a directory
async function buildDirectoryPath(directoryId) {
  try {
    const pathParts = [];
    let currentDirId = directoryId;
    
    // Limit the recursion to prevent infinite loops
    for (let i = 0; i < 10; i++) {
      if (!currentDirId) break;
      
      const directory = await Archive.findById(currentDirId);
      if (!directory) break;
      
      // Add directory name to the path
      pathParts.unshift(directory.name);
      
      // Move up to parent
      currentDirId = directory.parentId;
    }
    
    return pathParts.join('/');
  } catch (error) {
    console.error('Error building directory path:', error);
    throw error;
  }
}

module.exports = router;