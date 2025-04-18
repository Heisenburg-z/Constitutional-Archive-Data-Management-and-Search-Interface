const express = require('express');
const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');
const router = express.Router();

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey   = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;  // e.g., 'my-index'"


const client = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));

router.get('/', async (req, res) => {
  const q = req.query.q || '';
  try {
    const results = [];
    const searchResults = client.search(q, {
      top: 10,
      queryType: 'simple'
      // For semantic: add semanticConfigurationName & queryType: 'semantic'
    });

    for await (const r of searchResults.results) {
      results.push({
        id:      r.document.id,
        name:    r.document.name,
        snippet: r.document.content?.substring(0,200) + '…',
        url:     r.document.contentUrl,
        ...r.document.metadata
      });
    }
    res.json(results);
  } catch (err) {
    console.error('Search failed:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
// This route handles search requests to the Azure Search service.
// It uses the Azure Search SDK to perform the search and returns the results in JSON format.
// The search query is passed as a query parameter 'q'.
// The results include the document ID, name, snippet of content, URL, and any metadata associated with the document.