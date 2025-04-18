const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const endpoint   = process.env.AZURE_SEARCH_ENDPOINT;        // e.g. https://…search.windows.net
const apiKey     = process.env.AZURE_SEARCH_API_KEY;         // your admin key
const indexName  = process.env.AZURE_SEARCH_INDEX_NAME;      // e.g. azureblob-index
const apiVersion = '2021-04-30-Preview';                     // or your service’s current version

router.get('/', async (req, res) => {
  const q = req.query.q || '';
  try {
    // Build the URL
    const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/docs`;
    // Call Azure Search REST API :contentReference[oaicite:0]{index=0}
    const response = await axios.get(url, {
      params: {
        'api-version': apiVersion,
        search: q,
        $top: 10,
        includeTotalCount: true
      },
      headers: {
        'api-key': apiKey,
        'Accept':  'application/json'
      }
    });

    // Forward the same structure your frontend expects
    return res.json({
      value: response.data.value,
      '@odata.count': response.data['@odata.count']
    });
  } catch (err) {
    console.error('Search error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// Note: This code assumes you have already set up the necessary environment variables  