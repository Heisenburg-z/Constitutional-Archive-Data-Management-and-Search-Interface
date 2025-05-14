// src/components/Dashboard/DocumentCard.js

import React from 'react';
import { Edit } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';

const DocumentCard = ({ doc, downloadingDocs, handlePreviewDocument, handleEditMetadata, handleDownloadDocument, setDocumentToDelete, isDeleting }) => {
  const isDownloading = downloadingDocs[doc._id] || false;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-center mb-4">
        {getFileIcon(doc.fileType)}
      </div>
      <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h3>
      <div className="flex items-center text-xs text-gray-500 mb-3 gap-2">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
          {doc.type}
        </span>
        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'Unknown size'}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => handlePreviewDocument(doc)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Preview
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => handleEditMetadata(doc)}
            className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
          <button 
            onClick={() => handleDownloadDocument(doc)}
            className="text-green-600 hover:text-green-800 text-sm"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin mr-1"></span>
                Downloading
              </>
            ) : 'Download'}
          </button>
          <button 
            onClick={() => setDocumentToDelete(doc._id)}
            className="text-red-600 hover:text-red-800 text-sm"
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;