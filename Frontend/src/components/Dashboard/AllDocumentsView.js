// src/components/Dashboard/AllDocumentsView.js

import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import DocumentCard from './DocumentCard';

const AllDocumentsView = ({ 
  setCurrentView, 
  searchQuery, 
  handleSearch, 
  filteredDocuments, 
  downloadingDocs,
  handlePreviewDocument,
  handleEditMetadata,
  handleDownloadDocument,
  setDocumentToDelete,
  isDeleting
}) => {
  return (
    <section>
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setCurrentView('featured')} 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={20} />
            Back to Featured View
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">All Documents</h1>
      </header>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-500" />
          </div>
          <input
            type="search"
            className="block w-full p-4 pl-12 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <DocumentCard 
                key={doc._id} 
                doc={doc} 
                downloadingDocs={downloadingDocs}
                handlePreviewDocument={handlePreviewDocument}
                handleEditMetadata={handleEditMetadata}
                handleDownloadDocument={handleDownloadDocument}
                setDocumentToDelete={setDocumentToDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllDocumentsView;