import React from 'react';
import { History, User, Download, Trash2, Edit, FileText, Calendar } from 'lucide-react';

const DocumentSubmissionLog = ({
  documents = [],
  handleDownloadDocument = () => {},
  handleEditMetadata = () => {},
  setDocumentToDelete = () => {},
  downloadingDocs = {},
  isDeleting = false
}) => {
  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (!Array.isArray(documents)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500">Error: Document data is not available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Document Submission Log</h2>
          <p className="text-sm text-gray-500">
            {documents.length === 0 
              ? "No documents submitted yet" 
              : "Track all document submissions with upload details"}
          </p>
        </div>
      </div>
      
      {sortedDocuments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Document
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Submitted By
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Submission Date
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDocuments.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {doc.name}
                      {doc.metadata?.title && (
                        <div className="text-xs text-gray-500 mt-1">
                          {doc.metadata.title}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {doc.createdBy?.firstName} {doc.createdBy?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.createdBy?.email}
                        </div>
                        {doc.createdBy?.role === 'admin' && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doc.type === 'file' ? 'bg-blue-100 text-blue-800' : 
                      doc.type === 'directory' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      disabled={downloadingDocs[doc._id]}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditMetadata(doc)}
                      className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDocumentToDelete(doc._id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p>No documents have been submitted yet</p>
        </div>
      )}
    </div>
  );
};

export default DocumentSubmissionLog;