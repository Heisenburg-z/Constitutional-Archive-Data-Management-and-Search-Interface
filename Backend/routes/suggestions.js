// routes/suggestions.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const apiVersion = '2021-04-30-Preview';

// Autocomplete/suggestions endpoint
router.get('/', async (req, res) => {
  const q = req.query.q || '';
  
  try {
    // Build the URL for suggestions
    const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/docs/suggest`;
    
    const response = await axios.get(url, {
      params: {
        'api-version': apiVersion,
        search: q,
        $top: 5,
        suggesterName: 'sg' // Make sure you have a suggester configured in Azure Search
      },
      headers: {
        'api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    // Extract suggestions from response
    const suggestions = response.data.value.map(item => item.text);
    
    // Add popular suggestions if query is empty
    if (q.length === 0) {
      suggestions.push(
        'First Amendment',
        'Property Rights',
        'Judicial Review',
        'Bill of Rights',
        'Constitutional Amendments'
      );
    }

    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions error:', err.message);
    // Fallback to local suggestions if Azure fails
    res.json({ 
      suggestions: [
        'Constitution',
        'Amendment',
        'Court Decision',
        'Legal Analysis',
        'Historical Document'
      ] 
    });
  }
});

module.exports = router;