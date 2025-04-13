const { BlobServiceClient } = require('@azure/storage-blob');

// Get connection string from environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set');
}

// Create Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Get container client (replace 'constitutional-archive' with your actual container name)
const containerClient = blobServiceClient.getContainerClient('constitutional-archive');

console.log('Azure Storage initialized for container:', containerClient.containerName);

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
    try {
      // Verify container exists and we have access
      const exists = await containerClient.exists();
      if (!exists) {
        throw new Error(`Container ${containerClient.containerName} does not exist`);
      }
      
      // Test listing blobs
      const iterator = containerClient.listBlobsFlat().byPage({ maxPageSize: 1 });
      await iterator.next();
      
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
      
      process.exit(1);
    }
  }
};