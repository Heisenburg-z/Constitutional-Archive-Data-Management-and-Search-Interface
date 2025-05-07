const express = require('express');
const axios = require('axios');
const router = express.Router();

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const apiVersion = '2021-04-30-Preview';

// Debug configuration at startup
console.log('\n=== AZURE SEARCH SUGGESTIONS SERVICE INITIALIZATION ===');
console.log('Endpoint:', endpoint);
console.log('Index name:', indexName);
console.log('API version:', apiVersion);
console.log('API key exists:', !!apiKey);
console.log('Current time:', new Date().toISOString(), '\n');

// Middleware to log all incoming requests
router.use((req, res, next) => {
  console.log(`\n[SUGGESTIONS] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.log('[SUGGESTIONS] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[SUGGESTIONS] Query params:', JSON.stringify(req.query, null, 2));
  next();
});

// Autocomplete/suggestions endpoint
router.get('/', async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 8);
  const q = (req.query.q || '').trim();
  
  console.log(`\n[SUGGESTIONS][${requestId}] STARTING REQUEST PROCESSING`);
  console.log(`[SUGGESTIONS][${requestId}] Query: "${q}" (length: ${q.length})`);

  try {
    // Only call Azure if query has at least 2 characters
    if (q.length >= 2) {
      console.log(`[SUGGESTIONS][${requestId}] Query length >= 2, proceeding with Azure Search`);
      
      const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/docs/suggest`;
      const params = {
        'api-version': apiVersion,
        search: q,
        $top: 5,
        suggesterName: 'metadata_storage_name'
      };

      console.log(`[SUGGESTIONS][${requestId}] Constructed URL: ${url}`);
      console.log(`[SUGGESTIONS][${requestId}] Request params:`, JSON.stringify(params, null, 2));

      try {
        console.log(`[SUGGESTIONS][${requestId}] Sending request to Azure Search...`);
        const startTime = Date.now();
        
        const response = await axios.get(url, {
          params: params,
          headers: {
            'api-key': apiKey,
            'Accept': 'application/json',
            'x-ms-client-request-id': requestId
          },
          timeout: 5000 // 5 second timeout
        });

        const responseTime = Date.now() - startTime;
        console.log(`[SUGGESTIONS][${requestId}] Azure response received in ${responseTime}ms`);
        console.log(`[SUGGESTIONS][${requestId}] Response status: ${response.status}`);
        
        // Deep clone the response data for logging (to prevent circular reference issues)
        const responseData = JSON.parse(JSON.stringify(response.data));
        console.log(`[SUGGESTIONS][${requestId}] Full response data:`, JSON.stringify(responseData, null, 2));

        // Validate response structure
        if (!responseData) {
          console.error(`[SUGGESTIONS][${requestId}] ERROR: Empty response from Azure`);
          throw new Error('Empty response from Azure Search');
        }

        if (!Array.isArray(responseData.value)) {
          console.error(`[SUGGESTIONS][${requestId}] ERROR: Unexpected response structure - value is not an array`);
          console.error(`[SUGGESTIONS][${requestId}] Response value type:`, typeof responseData.value);
          throw new Error('Unexpected response structure from Azure Search');
        }

        // Enhanced suggestion extraction
        const suggestions = responseData.value.map((item, index) => {
          console.log(`[SUGGESTIONS][${requestId}] Processing item ${index}:`, JSON.stringify(item, null, 2));

          // Try multiple possible fields for the suggestion text
          const possibleFields = ['text', '@search.text', 'metadata_storage_name', 'name', 'title', 'content'];
          let suggestionText = '';

          for (const field of possibleFields) {
            if (item[field]) {
              suggestionText = item[field];
              console.log(`[SUGGESTIONS][${requestId}] Found suggestion in field "${field}":`, suggestionText);
              break;
            }
          }

          if (!suggestionText) {
            console.warn(`[SUGGESTIONS][${requestId}] WARNING: No suggestion text found in item ${index}`);
            console.warn(`[SUGGESTIONS][${requestId}] Item keys:`, Object.keys(item));
            return null;
          }

          // Clean up the suggestion text
          suggestionText = suggestionText.toString().trim();
          if (suggestionText.length > 100) {
            suggestionText = suggestionText.substring(0, 100) + '...';
          }

          return suggestionText;
        }).filter(Boolean);

        console.log(`[SUGGESTIONS][${requestId}] Extracted suggestions:`, suggestions);

        if (suggestions.length === 0) {
          console.warn(`[SUGGESTIONS][${requestId}] WARNING: No valid suggestions extracted from response`);
        }

        return res.json({
          suggestions: suggestions,
          debug: { requestId, responseTime: `${responseTime}ms` }
        });

      } catch (axiosError) {
        console.error(`[SUGGESTIONS][${requestId}] ERROR: Azure request failed`);
        console.error(`[SUGGESTIONS][${requestId}] Error message:`, axiosError.message);

        if (axiosError.response) {
          console.error(`[SUGGESTIONS][${requestId}] Response status:`, axiosError.response.status);
          console.error(`[SUGGESTIONS][${requestId}] Response headers:`, axiosError.response.headers);
          console.error(`[SUGGESTIONS][${requestId}] Response data:`, JSON.stringify(axiosError.response.data, null, 2));
        } else if (axiosError.request) {
          console.error(`[SUGGESTIONS][${requestId}] No response received. Request details:`, {
            method: axiosError.request.method,
            path: axiosError.request.path,
            headers: axiosError.request.headers
          });
        }

        console.error(`[SUGGESTIONS][${requestId}] Stack trace:`, axiosError.stack);
        throw axiosError;
      }
    }

    // Return popular suggestions for empty/short queries
    console.log(`[SUGGESTIONS][${requestId}] Query length < 2, returning popular suggestions`);
    const popularSuggestions = [
      'First Amendment',
      'Property Rights',
      'Judicial Review', 
      'Bill of Rights',
      'Constitutional Amendments'
    ];
    
    return res.json({ 
      suggestions: popularSuggestions,
      debug: { requestId, source: 'popular-suggestions' }
    });

  } catch (err) {
    console.error(`\n[SUGGESTIONS][${requestId}] CRITICAL ERROR IN REQUEST PROCESSING`);
    console.error(`[SUGGESTIONS][${requestId}] Error:`, err.message);
    console.error(`[SUGGESTIONS][${requestId}] Stack:`, err.stack);
    
    // Fallback suggestions
    const fallbackSuggestions = [
      'Constitution',
      'Amendment',
      'Court Decision',
      'Legal Analysis',
      'Historical Document'
    ];
    
    console.log(`[SUGGESTIONS][${requestId}] Returning fallback suggestions`);
    res.status(500).json({
      error: 'Suggestions service error',
      suggestions: fallbackSuggestions,
      debug: {
        requestId,
        error: err.message,
        source: 'fallback-suggestions'
      }
    });
  } finally {
    console.log(`[SUGGESTIONS][${requestId}] REQUEST PROCESSING COMPLETE\n`);
  }
});

// Configuration check endpoint
router.get('/check-config', async (req, res) => {
  const checkId = Math.random().toString(36).substring(2, 8);
  console.log(`\n[CONFIG CHECK][${checkId}] Starting configuration check`);

  try {
    const configStatus = {
      endpointConfigured: !!endpoint,
      apiKeyConfigured: !!apiKey,
      indexNameConfigured: !!indexName,
      endpointValue: endpoint ? endpoint.replace(/[^\/]+$/, '***') : 'missing',
      indexNameValue: indexName || 'missing',
      apiVersion: apiVersion,
      timestamp: new Date().toISOString(),
      requestId: checkId
    };

    console.log(`[CONFIG CHECK][${checkId}] Basic config status:`, configStatus);

    // Test connection to Azure Search if all config is present
    if (endpoint && apiKey && indexName) {
      try {
        const url = `${endpoint}/indexes/${encodeURIComponent(indexName)}/stats`;
        console.log(`[CONFIG CHECK][${checkId}] Testing connection to: ${url}`);

        const startTime = Date.now();
        const response = await axios.get(url, {
          params: { 'api-version': apiVersion },
          headers: { 'api-key': apiKey }
        });

        const responseTime = Date.now() - startTime;
        configStatus.connectionTest = {
          status: 'success',
          responseTime: `${responseTime}ms`,
          statusCode: response.status
        };

        console.log(`[CONFIG CHECK][${checkId}] Connection test successful (${responseTime}ms)`);
      } catch (err) {
        configStatus.connectionTest = {
          status: 'failed',
          error: err.message
        };

        if (err.response) {
          configStatus.connectionTest.statusCode = err.response.status;
          configStatus.connectionTest.responseData = err.response.data;
        }

        console.error(`[CONFIG CHECK][${checkId}] Connection test failed:`, err.message);
      }
    }

    res.json(configStatus);
  } catch (err) {
    console.error(`[CONFIG CHECK][${checkId}] Error during configuration check:`, err);
    res.status(500).json({ 
      error: err.message,
      requestId: checkId
    });
  } finally {
    console.log(`[CONFIG CHECK][${checkId}] Configuration check complete\n`);
  }
});

module.exports = router;