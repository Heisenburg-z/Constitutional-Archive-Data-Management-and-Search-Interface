// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import ConstitutionalArchiveHomepage from './ConstitutionalArchiveHomepage';
// import DocumentPreviewShowcase from './components/DocumentPreview';

// jest.mock('./components/DocumentPreview', () => ({
//   __esModule: true,
//   default: jest.fn(() => <div data-testid="document-preview-showcase">Document Preview Showcase</div>)
// }));

// // Mock environment variable
// process.env.REACT_APP_API_URL = 'https://test-api.example.com';

// // Common fetch response
// const mockFetchResponse = {
//   ok: true,
//   json: jest.fn().mockResolvedValue({
//     '@odata.count': 2,
//     value: [
//       {
//         metadata_storage_path: 'SGVsbG8gV29ybGQ=',
//         metadata_storage_name: 'South African Constitution.pdf',
//         content: 'This document contains information about property rights in the South African Constitution.',
//         metadata_content_type: 'application/pdf',
//         metadata_creation_date: '2023-01-15'
//       },
//       {
//         metadata_storage_path: 'R29vZGJ5ZSBXb3JsZA==',
//         metadata_storage_name: 'US First Amendment.docx',
//         content: 'This document describes freedom of speech principles in the US Constitution.',
//         metadata_content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         metadata_creation_date: '2023-02-10'
//       }
//     ]
//   })
// };

// beforeAll(() => {
//   global.atob = jest.fn(str => {
//     if (str === 'SGVsbG8gV29ybGQ=') return 'Hello World';
//     if (str === 'R29vZGJ5ZSBXb3JsZA==') return 'Goodbye World';
//     return '';
//   });
// });

// beforeEach(() => {
//   jest.clearAllMocks();
//   global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse));
// });

// describe('ConstitutionalArchiveHomepage', () => {
//   test('renders homepage sections', () => {
//     render(<ConstitutionalArchiveHomepage />);
    
//     expect(screen.getByRole('heading', { name: /Explore Constitutional History/i })).toBeInTheDocument();
//     expect(screen.getByPlaceholderText(/Search constitutional documents/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();

//     expect(screen.getByRole('heading', { name: /Featured Collections/i })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: /Recently Added Documents/i })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: /Browse By Category/i })).toBeInTheDocument();
    
//     const preview = screen.queryByTestId('document-preview-showcase');
//     if (preview) {
//       expect(preview).toBeInTheDocument();
//     }
//   });

//   test('updates input when typing', async () => {
//     render(<ConstitutionalArchiveHomepage />);
//     const input = screen.getByRole('textbox');
//     await userEvent.type(input, 'property rights');
//     expect(input).toHaveValue('property rights');
//   });

//   test('shows results after search', async () => {
//     render(<ConstitutionalArchiveHomepage />);
    
//     await userEvent.type(screen.getByRole('textbox'), 'property rights');
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));

//     await waitFor(() => {
//       expect(screen.getByText(/Results for:/i)).toBeInTheDocument();
//       expect(screen.getByText(/2 results/i)).toBeInTheDocument();
//       expect(screen.getByText(/South African Constitution\.pdf/i)).toBeInTheDocument();
//       expect(screen.getByText(/US First Amendment\.docx/i)).toBeInTheDocument();
//     });
//   });

//   test('handles empty search input', async () => {
//     render(<ConstitutionalArchiveHomepage />);
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));
//     expect(global.fetch).not.toHaveBeenCalled();
//     expect(screen.getByRole('heading', { name: /Featured Collections/i })).toBeInTheDocument();
//   });

//   test('handles fetch error', async () => {
//     global.fetch.mockRejectedValueOnce(new Error('Network error'));
//     render(<ConstitutionalArchiveHomepage />);

//     await userEvent.type(screen.getByRole('textbox'), 'property rights');
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));

//     await waitFor(() => {
//       expect(screen.getByText(/Failed to fetch search results/i)).toBeInTheDocument();
//     });
//   });

//   test('clears search results', async () => {
//     render(<ConstitutionalArchiveHomepage />);
    
//     await userEvent.type(screen.getByRole('textbox'), 'property rights');
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));
    
//     await waitFor(() => screen.getByText(/Results for:/i));

//     await userEvent.click(screen.getByRole('button', { name: /Clear Results/i }));

//     await waitFor(() => {
//       expect(screen.queryByText(/Results for:/i)).not.toBeInTheDocument();
//     });
//   });

//   test('clears input field', async () => {
//     render(<ConstitutionalArchiveHomepage />);
//     const input = screen.getByRole('textbox');
//     await userEvent.type(input, 'property rights');

//     // Use aria-label or testid if icon button has no accessible name
//     const clearButton = screen.getByLabelText(/Clear input/i);
//     await userEvent.click(clearButton);
//     expect(input).toHaveValue('');
//   });

//   test('handles non-OK API response', async () => {
//     global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
//     render(<ConstitutionalArchiveHomepage />);
    
//     await userEvent.type(screen.getByRole('textbox'), 'property rights');
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));

//     await waitFor(() => {
//       expect(screen.getByText(/Failed to fetch search results/i)).toBeInTheDocument();
//     });
//   });

//   test('correctly decodes blob paths', async () => {
//     render(<ConstitutionalArchiveHomepage />);
    
//     await userEvent.type(screen.getByRole('textbox'), 'property rights');
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));

//     await waitFor(() => {
//       const links = screen.getAllByRole('link', { name: /View Document/i });
//       expect(links[0]).toHaveAttribute('href', '/documents/1');
//       expect(links[1]).toHaveAttribute('href', '/documents/2');
//     });
//   });

//   test('renders DocumentPreviewShowcase', () => {
//     DocumentPreviewShowcase.mockImplementation(() =>
//       <div data-testid="document-preview-showcase">Document Preview Showcase</div>
//     );
//     render(<ConstitutionalArchiveHomepage />);
//     expect(screen.queryByTestId('document-preview-showcase')).toBeInTheDocument();
//   });

//   test('highlights search terms', async () => {
//     const highlightResponse = {
//       ok: true,
//       json: jest.fn().mockResolvedValue({
//         '@odata.count': 1,
//         value: [{
//           metadata_storage_path: 'SGVsbG8gV29ybGQ=',
//           metadata_storage_name: 'Document.pdf',
//           content: 'This document discusses property rights in detail.',
//           metadata_content_type: 'application/pdf',
//           metadata_creation_date: '2023-01-15'
//         }]
//       })
//     };
    
//     global.fetch.mockResolvedValueOnce(highlightResponse);
//     render(<ConstitutionalArchiveHomepage />);
    
//     await userEvent.type(screen.getByRole('textbox'), 'property rights');
//     await userEvent.click(screen.getByRole('button', { name: /Search/i }));

//     await waitFor(() => {
//       const matches = screen.getAllByText(/property/i);
//       expect(matches.length).toBeGreaterThan(0);
//     });
//   });
// });
