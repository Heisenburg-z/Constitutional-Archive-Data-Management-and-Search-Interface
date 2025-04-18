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
    // Start the search (async iterable)
    const iterator = client.search(q, {
      top: 10,
      queryType: 'simple'
      // includeTotalCount: true // optional
        // filter: "metadata_storage_name eq 'example.txt'" // optional 
    });

    const hits = [];
    // ⚡️ iterate over the iterable directly
    // Note: The iterator is async, so we need to use for await
    for await (const result of iterator) {
      const doc = result.document;
      hits.push({
        id:      doc.metadata_storage_path,
        name:    doc.metadata_storage_name,
        snippet: (doc.content || '').substring(0, 200) + '…',
        url:     doc.metadata_storage_path
      });
    }

    // Return in the format your React code expects
    res.json({
      value: hits,
      '@odata.count': hits.length
    });
    // console.log('Search results:', hits);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
// This route handles search requests to the Azure Search service.
// It uses the Azure Search SDK to perform the search and returns the results in JSON format.
// The search query is passed as a query parameter 'q'.
// The results include the document ID, name, snippet of content, URL, and any metadata associated with the document.