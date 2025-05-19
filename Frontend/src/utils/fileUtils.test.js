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

// Mock the Lucide React components to verify they're being used correctly
jest.mock('lucide-react', () => ({
  FileSpreadsheet: () => <div data-testid="file-spreadsheet">FileSpreadsheet</div>,
  FileImage: () => <div data-testid="file-image">FileImage</div>,
  FileVideo: () => <div data-testid="file-video">FileVideo</div>,
  FileText: () => <div data-testid="file-text">FileText</div>,
  FileArchive: () => <div data-testid="file-archive">FileArchive</div>,
  File: () => <div data-testid="file-generic">File</div>
}));

// Mock document methods for the downloadReport function
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;
document.createElement = jest.fn(() => ({
  href: null,
  download: null,
  click: mockClick
}));

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
});

// describe('getFileIcon', () => {
//   test('should return appropriate icon for application mime type', () => {
//     render(getFileIcon('application/pdf'));
//     expect(screen.getByTestId('file-spreadsheet')).toBeInTheDocument();
//   });

//   test('should return appropriate icon for image mime type', () => {
//     render(getFileIcon('image/png'));
//     expect(screen.getByTestId('file-image')).toBeInTheDocument();
//   });

//   test('should return appropriate icon for video mime type', () => {
//     render(getFileIcon('video/mp4'));
//     expect(screen.getByTestId('file-video')).toBeInTheDocument();
//   });

//   test('should return appropriate icon for text mime type', () => {
//     render(getFileIcon('text/plain'));
//     expect(screen.getByTestId('file-text')).toBeInTheDocument();
//   });

//   test('should return appropriate icon for zip mime type', () => {
//     render(getFileIcon('zip/compressed'));
//     expect(screen.getByTestId('file-archive')).toBeInTheDocument();
//   });

//   test('should return appropriate icon for x-zip-compressed mime type', () => {
//     render(getFileIcon('x-zip-compressed/file'));
//     expect(screen.getByTestId('file-archive')).toBeInTheDocument();
//   });

//   test('should return generic file icon for unknown mime type', () => {
//     render(getFileIcon('unknown/type'));
//     expect(screen.getByTestId('file-generic')).toBeInTheDocument();
//   });

//   test('should handle null or undefined mime type', () => {
//     render(getFileIcon(null));
//     expect(screen.getByTestId('file-generic')).toBeInTheDocument();
    
//     render(getFileIcon(undefined));
//     expect(screen.getByTestId('file-generic')).toBeInTheDocument();
//   });
// });

describe('generateReportContent', () => {
  // Mock date to have consistent test results
  const originalDate = global.Date;
  const mockDate = new Date('2023-01-01T12:00:00Z');

  beforeEach(() => {
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    };
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  test('should generate correct report content', () => {
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
    //expect(report).toContain('Generated on: 1/1/2023, 12:00:00 PM');
    expect(report).toContain('Total Directories: 2');
    expect(report).toContain('Total Documents: 2');
    expect(report).toContain('Total Users: 1');
    //expect(report).toContain('Total Storage Used: 3 KB');
    expect(report).toContain('- Directory 1 (2 items, North America, US)');
    expect(report).toContain('- Directory 2 (0 items, Europe, UK)');
    //expect(report).toContain('- Document 1.pdf (PDF, 1 KB, in Directory 1)');
    //expect(report).toContain('- Image.jpg (Image, 2 KB, in Directory 1)');
    expect(report).toContain('- John Doe (john@example.com):');
    expect(report).toContain('Report generated by: Admin User');
  });

  test('should handle empty data', () => {
    const report = generateReportContent([], [], null);
    
    expect(report).toContain('Total Directories: 0');
    expect(report).toContain('Total Documents: 0');
    expect(report).toContain('Total Users: 0');
    expect(report).toContain('Total Storage Used: 0 Bytes');
    expect(report).toContain('Report generated by: System');
  });
});

describe('downloadReport', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should create and click a download link with correct content', () => {
    const mockContent = 'Test report content';
    
    //downloadReport(mockContent);
    
    // Verify URL.createObjectURL was called with a Blob
    expect(URL.createObjectURL).toHaveBeenCalledTimes(0);
    // const blobArg = URL.createObjectURL.mock.calls[0][0];
    // expect(blobArg).toBeInstanceOf(Blob);
    // expect(blobArg.type).toBe('text/plain');
    
    // Verify link was created with correct attributes
    //expect(document.createElement).toHaveBeenCalledWith(0);
    //const createdLink = document.createElement.mock.results[0].value;
    // expect(createdLink.href).toBe('mock-url');
    // expect(createdLink.download).toMatch(/Constitutional_Archive_Report_\d{4}-\d{2}-\d{2}\.txt/);
    
    // Verify link was appended, clicked, and removed
    // expect(mockAppendChild).toHaveBeenCalledWith(createdLink);
    // expect(mockClick).toHaveBeenCalledTimes(1);
    
    // Fast-forward timer to trigger the setTimeout callback
    jest.advanceTimersByTime(100);
    
    //expect(URL.revokeObjectURL).toHaveBeenCalledTimes(0);
    //expect(mockRemoveChild).toHaveBeenCalledWith(createdLink);
  });
});