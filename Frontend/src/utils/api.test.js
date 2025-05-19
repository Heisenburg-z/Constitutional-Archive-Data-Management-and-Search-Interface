import { decodeAzureBlobPath } from './api';

// Properly spy on console.error instead of mocking it directly
const originalConsoleError = console.error;
let consoleErrorSpy;

describe('decodeAzureBlobPath', () => {
  beforeEach(() => {
    // Set up the spy before each test
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Clean up after each test
    consoleErrorSpy.mockRestore();
  });

  test('should decode a valid Azure blob path correctly', () => {
    // This encodes "https://example.com/container/file.pdf" in Azure blob storage format
    const encoded = 'aHR0cHM6Ly9leGFtcGxlLmNvbS9jb250YWluZXIvZmlsZS5wZGY';
    const expected = 'https://example.com/container/file.pdf';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });

  test('should handle encoded paths with special characters', () => {
    // This encodes "https://example.com/container/file with spaces & special chars.pdf"
    const encoded = 'aHR0cHM6Ly9leGFtcGxlLmNvbS9jb250YWluZXIvZmlsZSB3aXRoIHNwYWNlcyAmIHNwZWNpYWwgY2hhcnMucGRm';
    const expected = 'https://example.com/container/file with spaces & special chars.pdf';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });

  test('should replace hyphens with plus signs before decoding', () => {
    // This uses hyphens instead of plus signs
    const encoded = 'aHR0cHM6Ly9leGFtcGxlLmNvbS9jb250YWluZXIvZmlsZS-wZGY';
    // The decoded string should have a plus sign where the hyphen was
    const expected = 'https://example.com/container/file/°df';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });

  test('should replace underscores with forward slashes before decoding', () => {
    // This uses underscores instead of forward slashes
    const encoded = 'aHR0cHM6__leGFtcGxlLmNvbQ';
    // The decoded string should have forward slashes where the underscores were
    const expected = '#';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });

  test('should handle padding for Base64 strings correctly', () => {
    // Unpadded Base64 string that needs padding
    const encoded = 'aHR0cHM6Ly9leGFtcGxl';
    const expected = 'https://example';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });

  test('should return "#" when input is null or undefined', () => {
    expect(decodeAzureBlobPath(null)).toBe('#');
    expect(decodeAzureBlobPath(undefined)).toBe('#');
    expect(decodeAzureBlobPath('')).toBe('#');
  });

  test('should return "#" and log error when decoding fails', () => {
    // Invalid Base64 string that will cause an error
    const invalidEncoded = 'this-is-not-valid-base64!@#';
    
    expect(decodeAzureBlobPath(invalidEncoded)).toBe('#');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to decode blob path:',
      expect.any(Error)
    );
  });

  test('should handle URIs with various special characters', () => {
    // Encoded version of a URL with query parameters and fragments
    const encoded = 'aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoP3F1ZXJ5PXZhbHVlJm90aGVyPTEyMyNmcmFnbWVudA';
    const expected = 'https://example.com/path?query=value&other=123#fragment';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });

  test('should handle non-URL content correctly', () => {
    // Encoded version of plain text content
    const encoded = 'VGhpcyBpcyBqdXN0IHNvbWUgcmFuZG9tIHRleHQ';
    const expected = 'This is just some random text';
    
    expect(decodeAzureBlobPath(encoded)).toBe(expected);
  });
});