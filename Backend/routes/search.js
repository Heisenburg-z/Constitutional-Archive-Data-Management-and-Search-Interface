// backend/routes/search.js
const express = require('express');
const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
const router = express.Router();

const endpoint  = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey    = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME; // "azureblob-index"
const client    = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

router.get('/', async (req, res) => {
  const q = req.query.q || '';
  try {
    // Kick off the paged iterable
    const paged = client.search(q, {
      top: 10,
      queryType: 'simple',
      includeTotalCount: true
    });

    // Grab the total count if you asked for it
    let count;
    if (paged.getCount) {
      count = await paged.getCount();
    }

    // Collect all documents
    const hits = [];
    for await (const page of paged.byPage()) {
      for (const r of page) {
        const doc = r.document;
        hits.push({
          id:      doc.metadata_storage_path,
          name:    doc.metadata_storage_name,
          snippet: (doc.content || '').substring(0, 200) + '…',
          url:     doc.metadata_storage_path
        });
      }
    }

    // Return in the same shape your frontend expects
    return res.json({
      value: hits,
      '@odata.count': count ?? hits.length
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// This code defines an Express.js route for searching documents in an Azure Search index.
// It uses the Azure Search SDK to perform the search and return results in a specific format.
// The route handles GET requests to the root path ('/') and accepts a query parameter 'q' for the search term.
// It retrieves the search results, including document metadata, and formats them into a JSON response.
// The code also includes error handling to log any search errors and return a 500 status with the error message.
// The search results include the document ID, name, a snippet of the content, and the URL to the document.
// The search is limited to the top 10 results, and the total count of results can be included in the response.
// The Azure Search client is initialized with the endpoint, index name, and API key from environment variables.
// The route is exported for use in the main application file.