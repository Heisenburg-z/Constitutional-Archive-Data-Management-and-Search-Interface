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
    // Only call Azure if query has at least 2 characters
    if (q.length >= 2) {
      const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/docs/suggest`;
      
      const response = await axios.get(url, {
        params: {
          'api-version': apiVersion,
          search: q,
          $top: 5,
          suggesterName: 'metadata_storage_name' // Using your existing suggester
        },
        headers: {
          'api-key': apiKey,
          'Accept': 'application/json'
        }
      });

      // Extract and return Azure suggestions
      const suggestions = response.data.value.map(item => item.text);
      return res.json({ suggestions });
    }

    // Return popular suggestions for empty/short queries
    const popularSuggestions = [
      'First Amendment',
      'Property Rights',
      'Judicial Review', 
      'Bill of Rights',
      'Constitutional Amendments'
    ];

    res.json({ suggestions: popularSuggestions });

  } catch (err) {
    console.error('Suggestions error:', err.message);
    
    // Fallback suggestions
    const fallbackSuggestions = [
      'Constitution',
      'Amendment',
      'Court Decision',
      'Legal Analysis',
      'Historical Document'
    ];
    
    res.json({ suggestions: fallbackSuggestions });
  }
});

module.exports = router;