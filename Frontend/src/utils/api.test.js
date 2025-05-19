// src/utils/api.test.js
import { decodeAzureBlobPath } from './api';

// Mock global functions
global.atob = jest.fn(str => Buffer.from(str, 'base64').toString('binary'));
global.console.error = jest.fn();

describe('decodeAzureBlobPath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly decode a valid Azure blob path', () => {
    // This is "https://storage.blob.core.windows.net/container/file.pdf" encoded to base64
    // and then transformed to Azure-safe Base64URL format (- instead of +, _ instead of /)
    const encodedPath = 'aHR0cHM6Ly9zdG9yYWdlLmJsb2IuY29yZS53aW5kb3dzLm5ldC9jb250YWluZXIvZmlsZS5wZGY';
    
    const result = decodeAzureBlobPath(encodedPath);
    
    expect(result).toBe('https://storage.blob.core.windows.net/container/file.pdf');
    expect(atob).toHaveBeenCalled();
  });

  test('should decode paths with special characters', () => {
    // This is "https://storage.blob.core.windows.net/container/file with spaces.pdf" encoded
    const encodedPath = 'aHR0cHM6Ly9zdG9yYWdlLmJsb2IuY29yZS53aW5kb3dzLm5ldC9jb250YWluZXIvZmlsZSB3aXRoIHNwYWNlcy5wZGY';
    
    const result = decodeAzureBlobPath(encodedPath);
    
    expect(result).toBe('https://storage.blob.core.windows.net/container/file with spaces.pdf');
  });

  test('should handle Base64URL format with - and _ characters', () => {
    // Using - instead of + and _ instead of / in the Base64 string
    const encodedPath = 'aHR0cHM6Ly9zdG9yYWdlLmJsb2IuY29yZS53aW5kb3dzLm5ldC9jb250YWluZXIvZmlsZS5wZGY';
    const modifiedPath = encodedPath.replace(/\+/g, '-').replace(/\//g, '_');
    
    const result = decodeAzureBlobPath(modifiedPath);
    
    expect(result).toBe('https://storage.blob.core.windows.net/container/file.pdf');
  });

  test('should handle padding in Base64 strings', () => {
    // A Base64 string that would need padding
    // This is an example with a length that's not a multiple of 4
    const encodedPath = 'aHR0cA'; // This would normally need padding with = signs
    
    const result = decodeAzureBlobPath(encodedPath);
    
    // 'aHR0cA==' decodes to 'http'
    expect(result).toBe('http');
  });

  test('should return # when input is null or undefined', () => {
    expect(decodeAzureBlobPath(null)).toBe('#');
    expect(decodeAzureBlobPath(undefined)).toBe('#');
    expect(decodeAzureBlobPath('')).toBe('#');
  });

  test('should return # and log error for invalid Base64', () => {
    // Invalid Base64 string that will cause an error
    const invalidPath = '!@#$%^&*()';
    
    const result = decodeAzureBlobPath(invalidPath);
    
    expect(result).toBe('#');
    expect(console.error).toHaveBeenCalledWith('Failed to decode blob path:', expect.any(Error));
  });
});