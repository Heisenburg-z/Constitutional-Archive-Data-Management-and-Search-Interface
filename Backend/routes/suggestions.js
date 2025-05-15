const express = require('express');
const axios = require('axios');
const router = express.Router();
const Archive = require('../models/Archive');
const authenticate = require('../middleware/auth');

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
    // Only proceed if query has at least 2 characters
    if (q.length < 2) {
      console.log(`[SUGGESTIONS][${requestId}] Query length < 2, returning empty suggestions`);
      return res.json({ suggestions: [] });
    }

    // Create a case-insensitive regex search pattern for MongoDB search
    const searchRegex = new RegExp(q, 'i');

    // Initialize arrays for different suggestion types
    let azureSuggestions = [];
    let videoSuggestions = [];
    let keywordSuggestions = [];

    // Get Azure Search suggestions if configured
    if (endpoint && apiKey && indexName) {
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
        
        // Deep clone the response data for logging
        const responseData = JSON.parse(JSON.stringify(response.data));

        // Validate response structure
        if (responseData && Array.isArray(responseData.value)) {
          azureSuggestions = responseData.value.map((item) => {
            // Try multiple possible fields for the suggestion text
            const possibleFields = ['text', '@search.text', 'metadata_storage_name', 'name', 'title', 'content'];
            let suggestionText = '';

            for (const field of possibleFields) {
              if (item[field]) {
                suggestionText = item[field];
                break;
              }
            }

            // Clean up the suggestion text
            return suggestionText.toString().trim();
          }).filter(text => text.length > 0);
        }

        console.log(`[SUGGESTIONS][${requestId}] Azure suggestions:`, azureSuggestions);
      } catch (axiosError) {
        console.error(`[SUGGESTIONS][${requestId}] ERROR: Azure request failed`);
        console.error(`[SUGGESTIONS][${requestId}] Error message:`, axiosError.message);
        // Continue with other suggestion methods even if Azure fails
      }
    }

    // Search in video metadata from MongoDB
    try {
      const videoQuery = {
        type: 'Link',
        $or: [
          { name: searchRegex },
          { 'metadata.title': searchRegex },
          { 'metadata.keywords': { $in: [searchRegex] } }
        ],
        $and: [
          { 
            $or: [
              { contentUrl: { $regex: /youtube\.com/ } },
              { contentUrl: { $regex: /youtu\.be/ } }
            ]
          }
        ]
      };
      
      const videoResults = await Archive.find(videoQuery)
        .select('name metadata.title metadata.keywords')
        .limit(5);
      
      // Extract video suggestions from results
      videoSuggestions = videoResults.map(video => {
        return video.metadata?.title || video.name;
      }).filter(text => text.length > 0);
      
      // Extract keywords from videos that match the search
      const keywordSet = new Set();
      videoResults.forEach(video => {
        if (video.metadata?.keywords) {
          video.metadata.keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(q.toLowerCase())) {
              keywordSet.add(keyword);
            }
          });
        }
      });
      keywordSuggestions = Array.from(keywordSet);

      console.log(`[SUGGESTIONS][${requestId}] Video suggestions:`, videoSuggestions);
      console.log(`[SUGGESTIONS][${requestId}] Keyword suggestions:`, keywordSuggestions);
    } catch (mongoError) {
      console.error(`[SUGGESTIONS][${requestId}] ERROR: MongoDB query failed`);
      console.error(`[SUGGESTIONS][${requestId}] Error message:`, mongoError.message);
      // Continue with other suggestion methods even if MongoDB fails
    }

    // Combine all suggestions, remove duplicates, and limit to 10
    const allSuggestions = [...new Set([
      ...azureSuggestions,
      ...videoSuggestions,
      ...keywordSuggestions
    ])].slice(0, 10);

    console.log(`[SUGGESTIONS][${requestId}] Final combined suggestions:`, allSuggestions);
    
    return res.json({
      suggestions: allSuggestions,
      debug: { requestId }
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

// Configuration check endpoint (kept from original)
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