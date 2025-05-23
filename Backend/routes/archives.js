//Backend/routes/archives.js
const express = require('express');
const router = express.Router();
const Archive = require('../models/Archive');
const { uploadFile, listDirectories ,deleteBlob} = require('../utils/azureStorage');
const authenticate = require('../middleware/auth');

// Get all archives
router.get('/', authenticate, async (req, res) => {
  try {
    const archives = await Archive.find()
    .sort({ createdAt: -1 }) // Sort by newest first
    .populate('createdBy');
    res.json(archives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add this route to archives.js
// Enhanced public file explorer endpoint
router.get('/explorer', async (req, res) => {
  try {
    const { path, limit = 50, page = 1, type, country, documentType, sort = 'name', order = 'asc' } = req.query;
    const skip = (page - 1) * limit;
    
    // Base search criteria for public files
    const searchCriteria = {
      accessLevel: 'public'
    };
    
    // Apply filters if provided
    if (type) searchCriteria.type = type;
    if (country) searchCriteria['metadata.countryCode'] = country;
    if (documentType) searchCriteria['metadata.documentType'] = documentType;
    
    // Handle path navigation
    if (path && path !== '/') {
      const pathParts = path.split('/').filter(part => part.trim() !== '');
      let currentDir = null;
      
      // Traverse the path to find the final directory
      for (const part of pathParts) {
        const dir = await Archive.findOne({
          name: part,
          type: 'directory',
          parentId: currentDir ? currentDir._id : null,
          accessLevel: 'public'
        });
        
        if (!dir) {
          return res.status(404).json({ message: 'Directory not found' });
        }
        currentDir = dir;
      }
      
      if (currentDir) {
        searchCriteria.parentId = currentDir._id;
      }
    } else {
      // If no path provided, show root level files
      searchCriteria.parentId = null;
    }
    
    // Get total count for pagination
    const totalCount = await Archive.countDocuments(searchCriteria);
    
    // Determine sort order
    const sortCriteria = {};
    if (sort === 'date') {
      sortCriteria['metadata.publicationDate'] = order === 'asc' ? 1 : -1;
    } else if (sort === 'name') {
      sortCriteria.name = order === 'asc' ? 1 : -1;
    } else if (sort === 'type') {
      sortCriteria.type = order === 'asc' ? 1 : -1;
    }
    
    // Always sort directories first
    const finalSort = {
      type: -1, // Directories first
      ...sortCriteria
    };
    
    // Execute search with pagination
    const items = await Archive.find(searchCriteria)
      .sort(finalSort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Enhanced data transformation
    const formattedItems = items.map(item => {
      const baseItem = {
        id: item._id,
        name: item.name,
        type: item.type,
        fileType: item.fileType,
        size: item.fileSize,
        url: item.contentUrl,
        metadata: item.metadata || {},
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        accessLevel: item.accessLevel,
        children: item.children || []
      };
      
      // Add type-specific properties
      if (item.type === 'Link' && item.fileType === 'application/video') {
        baseItem.thumbnail = `https://img.youtube.com/vi/${getYoutubeVideoId(item.contentUrl)}/hqdefault.jpg`;
        baseItem.isVideo = true;
      } else if (item.type === 'file') {
        baseItem.isDocument = true;
        baseItem.icon = getFileIcon(item.fileType);
      } else if (item.type === 'directory') {
        baseItem.isDirectory = true;
        baseItem.icon = 'folder';
      }
      
      // Add country-specific metadata if available
      if (item.metadata?.countryCode) {
        baseItem.country = {
          code: item.metadata.countryCode,
          name: getCountryName(item.metadata.countryCode)
        };
      }
      
      return baseItem;
    });
    
    // Get available filters for the current view
    const availableFilters = await getAvailableFilters(searchCriteria);
    
    res.json({
      path: path || '/',
      items: formattedItems,
      filters: availableFilters,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (err) {
    console.error('File explorer error:', err);
    res.status(500).json({ message: 'Failed to load file explorer' });
  }
});

// Helper function to get available filters
async function getAvailableFilters(baseCriteria) {
  const filters = {
    types: [],
    countries: [],
    documentTypes: []
  };
  
  try {
    // Get distinct types
    filters.types = await Archive.distinct('type', baseCriteria);
    
    // Get distinct countries
    filters.countries = await Archive.distinct('metadata.countryCode', {
      ...baseCriteria,
      'metadata.countryCode': { $exists: true }
    });
    
    // Get distinct document types
    filters.documentTypes = await Archive.distinct('metadata.documentType', {
      ...baseCriteria,
      'metadata.documentType': { $exists: true }
    });
    
    // Remove null/undefined values
    filters.countries = filters.countries.filter(Boolean);
    filters.documentTypes = filters.documentTypes.filter(Boolean);
    
    return filters;
  } catch (err) {
    console.error('Error getting filters:', err);
    return filters;
  }
}

// Helper function to get file icon based on type
function getFileIcon(fileType) {
  if (!fileType) return 'file';
  
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('word')) return 'word';
  if (fileType.includes('excel')) return 'excel';
  if (fileType.includes('powerpoint')) return 'powerpoint';
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('video')) return 'video';
  
  return 'file';
}

// Helper function to get country name from code
function getCountryName(code) {
  const countries = {
    'ZA': 'South Africa',
    'US': 'United States',
    'GB': 'United Kingdom'
    // Add more as needed
  };
  return countries[code] || code;
}
// Public video search endpoint - no authentication required
router.get('/videos/search', async (req, res) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Base search criteria for videos
    const searchCriteria = {
      type: 'Link',
      fileType: 'application/video',
      accessLevel: 'public' // Only return public videos
    };
    
    // Add text search if query is provided
    if (query) {
      searchCriteria['$or'] = [
        { name: { $regex: query, $options: 'i' } },
        { 'metadata.title': { $regex: query, $options: 'i' } },
        { 'metadata.keywords': { $regex: query, $options: 'i' } },
        { 'metadata.author': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const totalCount = await Archive.countDocuments(searchCriteria);
    
    // Execute search with pagination
    const videos = await Archive.find(searchCriteria)
      .sort({ 'metadata.publicationDate': -1 }) // Sort by publication date descending
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean for better performance with plain objects
    
    // Transform video data to match expected format in VideoTab.js
    const formattedVideos = videos.map(video => ({
      id: video._id,
      title: video.metadata?.title || video.name,
      url: video.contentUrl,
      thumbnail: video.metadata?.thumbnailUrl || `https://img.youtube.com/vi/${getYoutubeVideoId(video.contentUrl)}/hqdefault.jpg`,
      author: video.metadata?.author || 'Unknown',
      date: video.metadata?.publicationDate || video.createdAt,
      keywords: video.metadata?.keywords || []
    }));
    
    res.json({
      results: formattedVideos,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (err) {
    console.error('Video search error:', err);
    res.status(500).json({ message: 'Failed to search videos' });
  }
});

// Helper function to extract YouTube video ID from URL
function getYoutubeVideoId(url) {
  if (!url) return null;
  
  try {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }
  } catch (err) {
    console.error('Error extracting YouTube ID:', err);
  }
  
  return null;
}
// Update file metadata ,  This lets you send only the fields you want to change. It's flexible and safe.
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
// This function deletes the file from Azure and removes the reference from MongoDB 

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

    // Extract blob path from contentUrl
    const blobUrl = archive.contentUrl;
    const blobPath = blobUrl.split('.blob.core.windows.net/')[1]; // gets the container/path/blob

    // Delete from Azure
    await deleteBlob(blobPath);

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


    res.status(500).json({ error: 'Failed to delete file' });
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

// Get recent uploads with uploader info
router.get('/recent', authenticate, async (req, res) => {
  try {
    const recentFiles = await Archive.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'firstName lastName email role');
    
    res.json(recentFiles);
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
    console.log('✅ Upload successful. Sending response.');
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

const { BlobServiceClient } = require('@azure/storage-blob');

router.get('/api/download', async (req, res) => {
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