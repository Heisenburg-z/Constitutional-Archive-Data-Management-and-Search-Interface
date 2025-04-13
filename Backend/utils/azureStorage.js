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
  uploadFile: async (buffer, fileName, contentType) => {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
      metadata: { uploadedBy: "ConstitutionalArchiveSystem" }
    });
    return blockBlobClient.url;
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