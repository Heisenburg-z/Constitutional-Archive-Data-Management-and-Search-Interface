// src/utils/fileUtils.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  formatFileSize,
  getFileIcon,
  generateReportContent,
  downloadReport 
} from './fileUtils';
import { 
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileText,
  FileArchive,
  File
} from 'lucide-react';

//import { getFileIcon } from '../utils/fileUtils';

// Mock the Lucide React components to verify they're being used correctly
jest.mock('lucide-react', () => ({
  FileSpreadsheet: ({ className, size }) => <div data-testid="file-spreadsheet" className={className} data-size={size}>FileSpreadsheet</div>,
  FileImage: ({ className, size }) => <div data-testid="file-image" className={className} data-size={size}>FileImage</div>,
  FileVideo: ({ className, size }) => <div data-testid="file-video" className={className} data-size={size}>FileVideo</div>,
  FileText: ({ className, size }) => <div data-testid="file-text" className={className} data-size={size}>FileText</div>,
  FileArchive: ({ className, size }) => <div data-testid="file-archive" className={className} data-size={size}>FileArchive</div>,
  File: ({ className, size }) => <div data-testid="file-generic" className={className} data-size={size}>File</div>
}));

// Mock document methods for the downloadReport function
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

// Create a proper mock link element
const createMockLink = () => ({
  href: '',
  download: '',
  click: mockClick
});

document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return createMockLink();
  }
  return {};
});

describe('formatFileSize', () => {
  test('should return "0 Bytes" for 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('should format bytes correctly', () => {
    expect(formatFileSize(1024)).toBe(1);
    expect(formatFileSize(1536)).toBe(1.5);
    expect(formatFileSize(1048576)).toBe(1);
    expect(formatFileSize(1572864)).toBe(1.5);
    expect(formatFileSize(1073741824)).toBe(1);
  });

  test('should handle small byte values', () => {
    expect(formatFileSize(512)).toBe(512);
    expect(formatFileSize(1023)).toBe(1023);
  });
});

describe('getFileIcon', () => {
  test('should return valid React element for application mime type', () => {
    const result = getFileIcon('application/pdf');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-blue-400');
    expect(result.props.size).toBe(40);
  });

  test('should return valid React element for image mime type', () => {
    const result = getFileIcon('image/png');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-green-400');
  });

  test('should return valid React element for video mime type', () => {
    const result = getFileIcon('video/mp4');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-red-400');
  });

  test('should return valid React element for text mime type', () => {
    const result = getFileIcon('text/plain');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-purple-400');
  });

  test('should return valid React element for zip mime type', () => {
    const result = getFileIcon('zip/compressed');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-yellow-400');
  });

  test('should return generic file icon for unknown mime type', () => {
    const result = getFileIcon('unknown/type');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-gray-400');
  });

  test('should handle null or undefined mime type', () => {
    const result1 = getFileIcon(null);
    expect(React.isValidElement(result1)).toBe(true);
    expect(result1.props.className).toContain('text-gray-400');
    
    const result2 = getFileIcon(undefined);
    expect(React.isValidElement(result2)).toBe(true);
    expect(result2.props.className).toContain('text-gray-400');
  });

  test('should handle empty string mime type', () => {
    const result = getFileIcon('');
    expect(React.isValidElement(result)).toBe(true);
    expect(result.props.className).toContain('text-gray-400');
  });
});
describe('generateReportContent', () => {
  // Mock date to have consistent test results
  const originalDate = global.Date;
  const mockDate = new Date('2023-01-01T12:00:00Z');

  beforeEach(() => {
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return mockDate;
        }
        return new originalDate(...args);
      }
      static now() {
        return mockDate.getTime();
      }
      toLocaleString() {
        return mockDate.toLocaleString();
      }
      toLocaleDateString() {
        return mockDate.toLocaleDateString();
      }
      toISOString() {
        return mockDate.toISOString();
      }
    };
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  test('should generate correct report content with full data', () => {
    const mockDocuments = [
      { 
        _id: 'dir1',
        name: 'Directory 1', 
        type: 'directory',
        children: ['file1', 'file2'],
        metadata: { region: 'North America', countryCode: 'US' }
      },
      { 
        _id: 'dir2',
        name: 'Directory 2', 
        type: 'directory',
        children: [],
        metadata: { region: 'Europe', countryCode: 'UK' }
      },
      { 
        _id: 'file1',
        name: 'Document 1.pdf', 
        type: 'file',
        parentId: 'dir1',
        fileSize: 1024,
        metadata: { documentType: 'PDF' }
      },
      { 
        _id: 'file2',
        name: 'Image.jpg', 
        type: 'file',
        parentId: 'dir1',
        fileSize: 2048,
        metadata: { documentType: 'Image' }
      }
    ];

    const mockUsers = [
      {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        lastLogin: '2022-12-31T12:00:00Z'
      }
    ];

    const mockUserProfile = {
      firstName: 'Admin',
      lastName: 'User'
    };

    const report = generateReportContent(mockDocuments, mockUsers, mockUserProfile);
    
    // Check that the report contains expected sections
    expect(report).toContain('=== Constitutional Archive Report ===');
    expect(report).toContain('Total Directories: 2');
    expect(report).toContain('Total Documents: 2');
    expect(report).toContain('Total Users: 1');
    expect(report).toContain('- Directory 1 (2 items, North America, US)');
    expect(report).toContain('- Directory 2 (0 items, Europe, UK)');
    expect(report).toContain('- John Doe (john@example.com):');
    expect(report).toContain('Report generated by: Admin User');
  });

  test('should handle directories without metadata', () => {
    const mockDocuments = [
      { 
        _id: 'dir1',
        name: 'Directory Without Metadata', 
        type: 'directory',
        children: []
      }
    ];

    const report = generateReportContent(mockDocuments, [], null);
    expect(report).toContain('- Directory Without Metadata (0 items, No region, No code)');
  });

  test('should handle files without metadata', () => {
    const mockDocuments = [
      { 
        _id: 'file1',
        name: 'File Without Metadata.txt', 
        type: 'file',
        parentId: 'unknown',
        fileSize: 100
      }
    ];

    const report = generateReportContent(mockDocuments, [], null);
    expect(report).toContain('- File Without Metadata.txt (Unknown type,');
    expect(report).toContain('in Unknown directory)');
  });

  test('should handle files without fileSize', () => {
    const mockDocuments = [
      { 
        _id: 'file1',
        name: 'File Without Size.txt', 
        type: 'file',
        parentId: 'unknown'
      }
    ];

    const report = generateReportContent(mockDocuments, [], null);
    expect(report).toContain('Total Storage Used: 0 Bytes');
  });

  test('should handle more than 10 files (only show first 10)', () => {
    const mockDocuments = Array.from({ length: 15 }, (_, i) => ({
      _id: `file${i + 1}`,
      name: `File ${i + 1}.txt`,
      type: 'file',
      fileSize: 100,
      metadata: { documentType: 'Text' }
    }));

    const report = generateReportContent(mockDocuments, [], null);
    expect(report).toContain('- File 1.txt');
    expect(report).toContain('- File 10.txt');
    expect(report).not.toContain('- File 11.txt');
  });

  test('should handle empty data', () => {
    const report = generateReportContent([], [], null);
    
    expect(report).toContain('Total Directories: 0');
    expect(report).toContain('Total Documents: 0');
    expect(report).toContain('Total Users: 0');
    expect(report).toContain('Total Storage Used: 0 Bytes');
    expect(report).toContain('Report generated by: System');
  });

  test('should handle users without lastLogin', () => {
    const mockUsers = [
      {
        _id: 'user1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
        // No lastLogin property
      }
    ];

    const report = generateReportContent([], mockUsers, null);
    expect(report).toContain('- Jane Smith (jane@example.com):');
    // Should handle the missing lastLogin gracefully
  });
});

describe('downloadReport', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Reset the createElement mock for each test
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick
        };
      }
      return {};
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should create and click a download link with correct content', () => {
    const mockContent = 'Test report content';
    
    downloadReport(mockContent);
    
    // Verify URL.createObjectURL was called with a Blob
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = URL.createObjectURL.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    //expect(blobArg.type).toBe('text/plain');
    
    // Verify link was created with correct attributes
    expect(document.createElement).toHaveBeenCalledWith('a');
    const createdLink = document.createElement.mock.results[0].value;
    //expect(createdLink.href).toBe('mock-url');
    expect(createdLink.download).toMatch(/Constitutional_Archive_Report_\d{4}-\d{2}-\d{2}\.txt/);
    
    // Verify link was appended, clicked, and removed
    expect(mockAppendChild).toHaveBeenCalledWith(createdLink);
    expect(mockClick).toHaveBeenCalledTimes(1);
    
    // Fast-forward timer to trigger the setTimeout callback
    jest.advanceTimersByTime(100);
    
   // expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    expect(mockRemoveChild).toHaveBeenCalledWith(createdLink);
  });

  test('should handle blob creation and cleanup correctly', () => {
    const mockContent = 'Another test content';
    
    downloadReport(mockContent);
    
    // Verify the blob was created with correct content
    const blobArg = URL.createObjectURL.mock.calls[0][0];
    expect(blobArg.size).toBeGreaterThan(0);
    
    // Advance timers to ensure cleanup happens
    jest.advanceTimersByTime(150);
    
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRemoveChild).toHaveBeenCalledTimes(1);
  });
});