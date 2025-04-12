// utils/azureStorage.js
const { ContainerClient } = require('@azure/storage-blob');


// Use this exact format
const sasUrl = process.env.BLOB_SAS_URL;
const containerClient = new ContainerClient(sasUrl);

console.log('Container name:', containerClient.containerName); // Add this


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
      const response = await containerClient.listBlobsFlat().byPage({ maxPageSize: 1 }).next();
      console.log('Azure Blob Storage connection established successfully');
      return true;
    } catch (error) {
      console.error('Azure Connection Error:');
      console.error(`Message: ${error.message}`);
      console.error(`Code: ${error.code}`);
      console.error(`Request ID: ${error.requestId}`);
      process.exit(1);
    }
  }
};
// module.exports = { verifyContainer };
