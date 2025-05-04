const { BlobServiceClient } = require('@azure/storage-blob');

console.log("Initializing Azure Storage...");

// Get connection string from environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set');
}

// Create Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Container configuration
const containerName = 'constitutional-archive';
const containerClient = blobServiceClient.getContainerClient(containerName);

console.log('Azure Storage initialized for container:', containerName);

// Configure CORS settings for the blob service
async function configureCors() {
  try {
    await blobServiceClient.setProperties({
      cors: [
        {
          allowedOrigins: ['*'], // For development, replace with your domain in production
          allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          allowedHeaders: ['*'],
          exposedHeaders: ['*'],
          maxAgeInSeconds: 86400 // 24 hours
        }
      ]
    });
    console.log('CORS configuration updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to configure CORS:', error);
    return false;
  }
}

// Function to get blob stream
async function getBlobStream(blobPath) {
  try {
    console.log(`Attempting to download blob: ${blobPath}`);
    
    const blobClient = containerClient.getBlobClient(blobPath);
    
    // Verify blob exists first
    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`Blob not found: ${blobPath}`);
      return null;
    }
    
    const downloadResponse = await blobClient.download(0);
    
    if (!downloadResponse.readableStreamBody) {
      console.error('No stream body received for blob:', blobPath);
      return null;
    }
    
    // Get blob properties for headers
    const properties = await blobClient.getProperties();
    
    return {
      stream: downloadResponse.readableStreamBody,
      properties: {
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        metadata: properties.metadata,
        lastModified: properties.lastModified,
        etag: properties.etag
      }
    };
  } catch (error) {
    console.error(`Error in getBlobStream for ${blobPath}:`, error);
    return null;
  }
}

// Verify blob access
async function verifyBlobAccess(blobPath) {
  try {
    const blobClient = containerClient.getBlobClient(blobPath);
    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`Blob access verification failed: ${blobPath} does not exist`);
      return false;
    }
    
    // Verify we have read permissions
    try {
      await blobClient.getProperties();
      return true;
    } catch (error) {
      console.error(`Blob access denied for ${blobPath}:`, error);
      return false;
    }
  } catch (error) {
    console.error('Blob access verification failed:', error);
    return false;
  }
}

// Enhanced download function with proper headers
async function downloadBlob(blobPath) {
  try {
    const blobClient = containerClient.getBlobClient(blobPath);
    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`Blob not found for download: ${blobPath}`);
      return null;
    }

    const properties = await blobClient.getProperties();
    const downloadResponse = await blobClient.download();

    return {
      stream: downloadResponse.readableStreamBody,
      properties: {
        contentType: properties.contentType || 'application/octet-stream',
        contentLength: properties.contentLength,
        contentDisposition: `attachment; filename="${encodeURIComponent(blobPath.split('/').pop())}"`,
        lastModified: properties.lastModified,
        etag: properties.etag
      }
    };
  } catch (error) {
    console.error(`Download failed for ${blobPath}:`, error);
    return null;
  }
}

module.exports = {
  // Upload file with support for directory structure
  uploadFile: async (buffer, fileName, contentType, parentPath = '') => {
    try {
      // Create blob path that includes parent directory structure
      const blobPath = parentPath ? `${parentPath}/${fileName}` : fileName;
      
      console.log(`Uploading file to: ${blobPath}`);
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      
      const uploadResponse = await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { 
          blobContentType: contentType,
          blobContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`
        },
        metadata: { 
          uploadedBy: "ConstitutionalArchiveSystem",
          originalName: fileName,
          parentPath: parentPath || "root"
        }
      });
      
      console.log(`Upload successful. ETag: ${uploadResponse.etag}`);
      
      return blockBlobClient.url;
    } catch (error) {
      console.error("Azure upload error:", error);
      throw new Error(`File upload to Azure failed: ${error.message}`);
    }
  },

  // List all directories in the container
  listDirectories: async () => {
    try {
      const directories = new Set();
      
      // Add the root directory
      directories.add('');
      
      // List all blobs to extract directories from their paths
      for await (const blob of containerClient.listBlobsFlat()) {
        const blobName = blob.name;
        const pathParts = blobName.split('/');
        
        // Skip the file name (last part)
        pathParts.pop();
        
        // Build up directory paths
        let currentPath = '';
        for (const part of pathParts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          directories.add(currentPath);
        }
      }
      
      return Array.from(directories);
    } catch (error) {
      console.error("Error listing directories:", error);
      throw new Error(`Failed to list directories: ${error.message}`);
    }
  },

  deleteBlob: async (blobPath) => {
    try {
      // blobPath should be the path _inside_ the container, e.g. "folder/file.pdf"
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      const deleteResponse = await blockBlobClient.deleteIfExists();
      console.log(`✅ Blob deleted: ${blobPath}`, deleteResponse);
    } catch (err) {
      console.error('Azure delete error:', err);
      throw err;
    }
  },

  // Get blob properties and metadata
  getBlobInfo: async (blobPath) => {
    try {
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      const properties = await blockBlobClient.getProperties();
      
      return {
        url: blockBlobClient.url,
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        metadata: properties.metadata,
        lastModified: properties.lastModified
      };
    } catch (error) {
      console.error("Error getting blob info:", error);
      throw new Error(`Failed to get blob info: ${error.message}`);
    }
  },

  verifyContainer: async () => {
    console.log(`Verifying container ${containerName}...`);
    try {
      // Create container if it doesn't exist
      const createResponse = await containerClient.createIfNotExists({
        access: 'blob' // Set public access level
      });
      
      if (createResponse.succeeded) {
        console.log(`Container ${containerName} created successfully`);
      } else {
        console.log(`Container ${containerName} already exists`);
      }

      // Configure CORS settings
      await configureCors();

      // Verify container accessibility by getting properties
      const properties = await containerClient.getProperties();
      console.log('Container properties:', {
        publicAccess: properties.publicAccess,
        leaseStatus: properties.leaseStatus,
        lastModified: properties.lastModified
      });

      console.log('Azure Storage connection verified successfully');
      return true;
    } catch (error) {
      console.error('Azure Storage Connection Error:');
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
      
      if (error.requestId) {
        console.error('Request ID:', error.requestId);
      }
      
      if (error.details?.errorCode) {
        console.error('Detailed Error Code:', error.details.errorCode);
      }
      
      throw new Error(`Container verification failed: ${error.message}`);
    }
  },

  // Utility functions
  verifyBlobAccess,
  downloadBlob,
  getBlobStream,
  configureCors
};