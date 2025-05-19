const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Setup proxy for development environment
 * This allows the React app to make API calls without running into CORS issues
 * 
 * @param {object} app - Express app instance
 */
module.exports = function(app) {
  // Proxy API requests to your backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://constitutional-archive-data-management-api-cvcscmdvcmfscweq.southafricanorth-01.azurewebsites.net', // Change this to match your backend server URL
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No rewrite needed if API routes already start with /api
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({
          error: 'Proxy error connecting to API server',
          message: 'The API server might be down or misconfigured'
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log successful proxy requests in development for debugging
        console.log(`[Proxy] ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
      }
    })
  );
};