const { createProxyMiddleware } = require('http-proxy-middleware');
const setupProxy = require('./setupProxy');

// Mock http-proxy-middleware
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn()
}));

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('setupProxy', () => {
  let mockApp;
  let mockProxyMiddleware;
  let proxyConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Express app
    mockApp = {
      use: jest.fn()
    };

    // Mock proxy middleware
    mockProxyMiddleware = jest.fn();
    createProxyMiddleware.mockReturnValue(mockProxyMiddleware);

    // Mock console methods
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('proxy setup', () => {
    test('should call app.use with correct path and middleware', () => {
      setupProxy(mockApp);

      expect(mockApp.use).toHaveBeenCalledWith('/api', mockProxyMiddleware);
      expect(mockApp.use).toHaveBeenCalledTimes(1);
    });

    test('should create proxy middleware with correct configuration', () => {
      setupProxy(mockApp);

      expect(createProxyMiddleware).toHaveBeenCalledTimes(1);
      
      const config = createProxyMiddleware.mock.calls[0][0];
      
      expect(config.target).toBe('https://constitutional-archive-data-management-api-cvcscmdvcmfscweq.southafricanorth-01.azurewebsites.net');
      expect(config.changeOrigin).toBe(true);
      expect(config.pathRewrite).toEqual({
        '^/api': '/api'
      });
      expect(typeof config.onError).toBe('function');
      expect(typeof config.onProxyRes).toBe('function');
    });
  });

  describe('onError handler', () => {
    let onErrorHandler;
    let mockReq, mockRes;

    beforeEach(() => {
      setupProxy(mockApp);
      proxyConfig = createProxyMiddleware.mock.calls[0][0];
      onErrorHandler = proxyConfig.onError;

      mockReq = {
        method: 'GET',
        path: '/api/test'
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should log proxy error to console', () => {
      const testError = new Error('Connection failed');
      
      onErrorHandler(testError, mockReq, mockRes);

      expect(console.error).toHaveBeenCalledWith('Proxy error:', testError);
    });

    test('should return 500 status with error message', () => {
      const testError = new Error('Connection timeout');
      
      onErrorHandler(testError, mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Proxy error connecting to API server',
        message: 'The API server might be down or misconfigured'
      });
    });

    test('should handle different types of errors', () => {
      const networkError = new Error('ECONNREFUSED');
      const timeoutError = new Error('ETIMEDOUT');
      const genericError = new Error('Unknown error');

      // Test network error
      onErrorHandler(networkError, mockReq, mockRes);
      expect(console.error).toHaveBeenCalledWith('Proxy error:', networkError);

      // Test timeout error
      onErrorHandler(timeoutError, mockReq, mockRes);
      expect(console.error).toHaveBeenCalledWith('Proxy error:', timeoutError);

      // Test generic error
      onErrorHandler(genericError, mockReq, mockRes);
      expect(console.error).toHaveBeenCalledWith('Proxy error:', genericError);

      expect(mockRes.status).toHaveBeenCalledTimes(3);
      expect(mockRes.json).toHaveBeenCalledTimes(3);
    });
  });

  describe('onProxyRes handler', () => {
    let onProxyResHandler;
    let mockReq, mockRes, mockProxyRes;

    beforeEach(() => {
      setupProxy(mockApp);
      proxyConfig = createProxyMiddleware.mock.calls[0][0];
      onProxyResHandler = proxyConfig.onProxyRes;

      mockReq = {
        method: 'GET',
        path: '/api/users'
      };

      mockRes = {};

      mockProxyRes = {
        statusCode: 200
      };
    });

    test('should log successful proxy requests', () => {
      onProxyResHandler(mockProxyRes, mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith('[Proxy] GET /api/users -> 200');
    });

    test('should log different HTTP methods and paths', () => {
      const testCases = [
        { method: 'POST', path: '/api/documents', statusCode: 201 },
        { method: 'PUT', path: '/api/documents/123', statusCode: 200 },
        { method: 'DELETE', path: '/api/documents/456', statusCode: 204 },
        { method: 'GET', path: '/api/search', statusCode: 404 }
      ];

      testCases.forEach(({ method, path, statusCode }) => {
        const req = { method, path };
        const proxyRes = { statusCode };
        
        onProxyResHandler(proxyRes, req, mockRes);
        expect(console.log).toHaveBeenCalledWith(`[Proxy] ${method} ${path} -> ${statusCode}`);
      });
    });

    test('should handle various status codes', () => {
      const statusCodes = [200, 201, 400, 401, 403, 404, 500, 502, 503];
      
      statusCodes.forEach(statusCode => {
        const proxyRes = { statusCode };
        const req = { method: 'GET', path: '/api/test' };
        
        onProxyResHandler(proxyRes, req, mockRes);
        expect(console.log).toHaveBeenCalledWith(`[Proxy] GET /api/test -> ${statusCode}`);
      });
    });
  });

  describe('integration scenarios', () => {
    test('should handle the complete proxy setup flow', () => {
      // Setup proxy
      setupProxy(mockApp);

      // Verify app.use was called correctly
      expect(mockApp.use).toHaveBeenCalledWith('/api', mockProxyMiddleware);

      // Verify proxy middleware was created with all required config
      expect(createProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.stringContaining('constitutional-archive-data-management-api'),
          changeOrigin: true,
          pathRewrite: { '^/api': '/api' },
          onError: expect.any(Function),
          onProxyRes: expect.any(Function)
        })
      );
    });

    test('should work with undefined app parameter', () => {
      expect(() => setupProxy()).toThrow();
    });

    test('should work with null app parameter', () => {
      expect(() => setupProxy(null)).toThrow();
    });
  });

  describe('configuration validation', () => {
    test('should have correct target URL format', () => {
      setupProxy(mockApp);
      const config = createProxyMiddleware.mock.calls[0][0];
      
      expect(config.target).toMatch(/^https:\/\/.+\.azurewebsites\.net$/);
    });

    test('should have correct pathRewrite configuration', () => {
      setupProxy(mockApp);
      const config = createProxyMiddleware.mock.calls[0][0];
      
      expect(config.pathRewrite).toEqual({ '^/api': '/api' });
    });

    test('should have changeOrigin set to true', () => {
      setupProxy(mockApp);
      const config = createProxyMiddleware.mock.calls[0][0];
      
      expect(config.changeOrigin).toBe(true);
    });
  });

  describe('error handling edge cases', () => {
    let onErrorHandler;

    beforeEach(() => {
      setupProxy(mockApp);
      onErrorHandler = createProxyMiddleware.mock.calls[0][0].onError;
    });

    test('should handle error with missing response object', () => {
      const mockReq = { method: 'GET', path: '/api/test' };
      const mockError = new Error('Test error');
      
      expect(() => onErrorHandler(mockError, mockReq, null)).toThrow();
    });

    test('should handle error with malformed request object', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const mockError = new Error('Test error');
      
      onErrorHandler(mockError, {}, mockRes);
      
      expect(console.error).toHaveBeenCalledWith('Proxy error:', mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('logging edge cases', () => {
    let onProxyResHandler;

    beforeEach(() => {
      setupProxy(mockApp);
      onProxyResHandler = createProxyMiddleware.mock.calls[0][0].onProxyRes;
    });

    test('should handle missing request properties', () => {
      const mockProxyRes = { statusCode: 200 };
      const mockReq = {}; // Missing method and path
      const mockRes = {};
      
      expect(() => onProxyResHandler(mockProxyRes, mockReq, mockRes)).not.toThrow();
    });

    test('should handle missing status code', () => {
      const mockProxyRes = {}; // Missing statusCode
      const mockReq = { method: 'GET', path: '/api/test' };
      const mockRes = {};
      
      expect(() => onProxyResHandler(mockProxyRes, mockReq, mockRes)).not.toThrow();
    });
  });
});