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

module.exports = {
  // Upload file with support for directory structure
  uploadFile: async (buffer, fileName, contentType, parentPath = '') => {
    try {
      // Create blob path that includes parent directory structure
      const blobPath = parentPath ? `${parentPath}/${fileName}` : fileName;
      
      console.log(`Uploading file to: ${blobPath}`);
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      
      const uploadResponse = await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
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
      const createResponse = await containerClient.createIfNotExists();
      
      if (createResponse.succeeded) {
        console.log(`Container ${containerName} created successfully`);
      } else {
        console.log(`Container ${containerName} already exists`);
      }

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
      
      // Throw error instead of exiting to allow proper error handling upstream
      throw new Error(`Container verification failed: ${error.message}`);
    }
  }
};