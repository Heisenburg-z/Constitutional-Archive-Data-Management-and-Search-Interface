const express = require('express');
const axios = require('axios');
const router = express.Router();

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const apiVersion = '2021-04-30-Preview';

console.log('=== SEARCH CONFIG ===');
console.log('Endpoint:', endpoint);
console.log('Index name:', indexName);
console.log('API version:', apiVersion);
console.log('API key exists:', !!apiKey);

// Autocomplete/suggestions endpoint
router.get('/', async (req, res) => {
  const q = req.query.q || '';
  console.log(`[SUGGESTIONS] Request received with query: "${q}"`);
  
  try {
    // Only call Azure if query has at least 2 characters
    if (q.length >= 2) {
      console.log(`[SUGGESTIONS] Query length >= 2, calling Azure Search`);
      
      const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/docs/suggest`;
      console.log(`[SUGGESTIONS] Using URL: ${url}`);
      
      console.log(`[SUGGESTIONS] Request params:`, {
        'api-version': apiVersion,
        search: q,
        $top: 5,
        suggesterName: 'metadata_storage_name'
      });
      
      try {
        console.log('[SUGGESTIONS] Sending request to Azure...');
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
        
        console.log('[SUGGESTIONS] Azure response status:', response.status);
        console.log('[SUGGESTIONS] Azure response data:', JSON.stringify(response.data, null, 2));
        
        // Check if response data structure is as expected
        if (!response.data || !response.data.value) {
          console.error('[SUGGESTIONS] Unexpected response structure:', response.data);
          throw new Error('Unexpected response structure from Azure Search');
        }
        
        // Extract and return Azure suggestions
        const suggestions = response.data.value.map(item => {
          if (!item.text) {
            console.warn('[SUGGESTIONS] Item missing text property:', item);
            return null;
          }
          return item.text;
        }).filter(Boolean);
        
        console.log('[SUGGESTIONS] Extracted suggestions:', suggestions);
        return res.json({ suggestions });
      } catch (axiosError) {
        console.error('[SUGGESTIONS] Azure request failed:', axiosError.message);
        if (axiosError.response) {
          console.error('[SUGGESTIONS] Response status:', axiosError.response.status);
          console.error('[SUGGESTIONS] Response data:', JSON.stringify(axiosError.response.data, null, 2));
        } else if (axiosError.request) {
          console.error('[SUGGESTIONS] No response received, request details:', axiosError.request);
        }
        throw axiosError; // Re-throw to be caught by outer try-catch
      }
    } else {
      console.log(`[SUGGESTIONS] Query length < 2, returning popular suggestions`);
    }

    // Return popular suggestions for empty/short queries
    const popularSuggestions = [
      'First Amendment',
      'Property Rights',
      'Judicial Review', 
      'Bill of Rights',
      'Constitutional Amendments'
    ];
    
    console.log('[SUGGESTIONS] Returning popular suggestions:', popularSuggestions);
    res.json({ suggestions: popularSuggestions });

  } catch (err) {
    console.error('[SUGGESTIONS] Error processing request:', err.message);
    console.error('[SUGGESTIONS] Error stack:', err.stack);
    
    // Fallback suggestions
    const fallbackSuggestions = [
      'Constitution',
      'Amendment',
      'Court Decision',
      'Legal Analysis',
      'Historical Document'
    ];
    
    console.log('[SUGGESTIONS] Returning fallback suggestions:', fallbackSuggestions);
    res.json({ suggestions: fallbackSuggestions });
  }
});

// Add an error handler for this route
router.use((err, req, res, next) => {
  console.error('[SUGGESTIONS ERROR HANDLER] Caught error:', err.message);
  
  const fallbackSuggestions = [
    'Constitution',
    'Amendment',
    'Court Decision',
    'Legal Analysis',
    'Historical Document'
  ];
  
  res.status(500).json({
    error: 'Suggestions service error',
    suggestions: fallbackSuggestions
  });
});

// Helper middleware to verify the Azure Search configuration
router.get('/check-config', async (req, res) => {
  try {
    // Validate environment variables
    const configStatus = {
      endpoint: !!endpoint,
      apiKey: !!apiKey,
      indexName: !!indexName,
      endpointValue: endpoint || 'missing',
      indexNameValue: indexName || 'missing'
    };
    
    // Test connection to Azure Search
    if (endpoint && apiKey && indexName) {
      try {
        const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/stats`;
        const response = await axios.get(url, {
          params: { 'api-version': apiVersion },
          headers: { 'api-key': apiKey }
        });
        configStatus.connectionTest = 'success';
        configStatus.indexStats = response.data;
      } catch (err) {
        configStatus.connectionTest = 'failed';
        configStatus.connectionError = err.message;
        if (err.response) {
          configStatus.statusCode = err.response.status;
          configStatus.responseData = err.response.data;
        }
      }
    }
    
    res.json(configStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;