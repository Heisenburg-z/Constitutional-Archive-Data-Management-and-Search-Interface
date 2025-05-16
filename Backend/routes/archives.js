// Backend/routes/archives.js
const express = require('express');
const router = express.Router();
const publicRouter = express.Router(); // Create a separate router for public endpoints
const Archive = require('../models/Archive');
const { uploadFile, listDirectories, deleteBlob, BlobServiceClient } = require('../utils/azureStorage');
const authenticate = require('../middleware/auth');

// PUBLIC ROUTES (no authentication)

// Public route for accessing archives
publicRouter.get('/', async (req, res) => {
  try {
    const { type, search, parentId, accessLevel } = req.query;
    
    // Build public query object
    const query = {
      accessLevel: 'public', // Enforce public access
      ...(type && { type }),
      ...(parentId ? { parentId } : parentId === '' ? { parentId: { $in: [null, undefined] } } : {})
    };

    // Add search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { 'metadata.title': searchRegex },
        { 'metadata.keywords': { $in: [searchRegex] } }
      ];
    }

    // Get public results without sensitive data
    const archives = await Archive.find(query)
      .select('-createdBy -internalNotes -accessLevel') // Exclude sensitive fields
      .sort({ createdAt: -1 });

    res.json(archives);
  } catch (err) {
    console.error('Public archives error:', err);
    res.status(500).json({ message: 'Error fetching public documents' });
  }
});

// PRIVATE ROUTES (require authentication)

// Get all archives with search and filter capabilities
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, search, parentId } = req.query;
    
    // Build query object
    const query = {};
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    // Add parentId filter if provided
    if (parentId) {
      query.parentId = parentId;
    } else if (parentId === '') {
      // If parentId is empty string, get root items (no parent)
      query.parentId = { $in: [null, undefined] };
    }
    
    // Add search functionality if search parameter is provided
    if (search) {
      // Create a case-insensitive regex search for name or metadata title
      const searchRegex = new RegExp(search, 'i');
      
      // Search in name, metadata.title, and metadata.keywords
      query.$or = [
        { name: searchRegex },
        { 'metadata.title': searchRegex },
        { 'metadata.keywords': { $in: [searchRegex] } }
      ];
    }
    
    // Execute query and populate creator info
    const archives = await Archive.find(query)
      .populate('createdBy')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(archives);
  } catch (err) {
    console.error('Archives search error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update file metadata
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const archiveId = req.params.id;
    const { metadata, accessLevel, name } = req.body;

    const updatedArchive = await Archive.findByIdAndUpdate(
      archiveId,
      {
        ...(metadata && { metadata }),
        ...(accessLevel && { accessLevel }),
        ...(name && { name })
      },
      { new: true }
    );

    if (!updatedArchive) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({ message: 'Metadata updated', archive: updatedArchive });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update metadata' });
  }
});

// Delete file from archive
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const archiveId = req.params.id;
    const archive = await Archive.findById(archiveId);

    if (!archive) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Verify user has permission to delete (admin or owner)
    if (req.user.role !== 'admin' && archive.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }

    // Extract blob path from contentUrl if it's a file
    if (archive.type === 'file' && archive.contentUrl) {
      const blobUrl = archive.contentUrl;
      const blobPath = blobUrl.split('.blob.core.windows.net/')[1]; // gets the container/path/blob
      await deleteBlob(blobPath);
    }

    // Remove archive document
    await Archive.findByIdAndDelete(archiveId);

    // Remove reference from parent directory if needed
    if (archive.parentId) {
      await Archive.findByIdAndUpdate(archive.parentId, {
        $pull: { children: archive._id }
      });
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);

    let errorMessage = 'Failed to delete file';
    if (error.message.includes('BlobNotFound')) {
      errorMessage = 'File not found in storage';
    } else if (error.message.includes('unauthorized')) {
      errorMessage = 'Unauthorized to perform this action';
    }

    res.status(500).json({ error: errorMessage });
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
    
    // Validate name
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Directory name is required' });
    }

    // Check if directory with same name already exists in this location
    const existingDir = await Archive.findOne({
      name,
      parentId: parentId || null,
      type: 'directory'
    });

    if (existingDir) {
      return res.status(400).json({ message: 'A directory with this name already exists in this location' });
    }

    const newDirectory = new Archive({
      name,
      parentId: parentId || null,
      type: 'directory',
      metadata: metadata || {},
      accessLevel: accessLevel || 'public',
      createdBy: req.user._id,
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
    console.error('Error creating directory:', err);
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
    
    // Check if file with same name already exists in this location
    const existingFile = await Archive.findOne({
      name,
      parentId: parentId || null,
      type: 'file'
    });

    if (existingFile) {
      return res.status(400).json({ message: 'A file with this name already exists in this location' });
    }

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

    res.status(200).json({
      message: 'Upload successful',
      archive: savedArchive
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      details: error.message
    });
  }
});

// Public download file route (available to both routers)
const downloadHandler = async (req, res) => {
  try {
    const blobPath = req.query.path;
    if (!blobPath) {
      return res.status(400).send('File path is required');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobPath);

    const exists = await blobClient.exists();
    if (!exists) {
      return res.status(404).send('File not found');
    }

    const properties = await blobClient.getProperties();
    const downloadResponse = await blobClient.download();

    res.set({
      'Content-Type': properties.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${blobPath.split('/').pop()}"`,
      'Content-Length': properties.contentLength
    });

    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Download failed');
  }
};

// Add download route to both routers
router.get('/download', downloadHandler);
publicRouter.get('/download', downloadHandler);

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

// Export both routers
module.exports = { 
  router, 
  publicRoutes: publicRouter
};