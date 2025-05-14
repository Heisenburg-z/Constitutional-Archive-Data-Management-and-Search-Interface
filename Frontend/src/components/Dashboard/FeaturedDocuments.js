import React, { useState } from 'react';
import { Download, Edit, ChevronLeft, ChevronRight, Plus, Trash2, File, FileText } from 'lucide-react';
import { getFileIcon, formatFileSize } from '../../utils/fileUtils';

const FeaturedDocuments = ({
  recentUploads,
  currentDocIndex,
  nextDocument,
  prevDocument,
  goToDocumentIndex,
  handleDownloadDocument,
  handleEditMetadata,
  setDocumentToDelete,
  downloadingDocs,
  isDeleting,
  setShowUploadModal
}) => {
  const [hoverState, setHoverState] = useState({
    download: false,
    edit: false,
    delete: false,
    prev: false,
    next: false,
    upload: false
  });

  if (recentUploads.length === 0) {
    return null;
  }

  const currentDoc = recentUploads[currentDocIndex];

  // Gradient background based on file type
  const getGradient = (fileType) => {
    if (!fileType) return "from-blue-500 to-purple-600";
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return "from-red-500 to-pink-600";
    if (type.includes('doc') || type.includes('word')) return "from-blue-500 to-indigo-600";
    if (type.includes('xls') || type.includes('sheet')) return "from-green-500 to-emerald-600";
    if (type.includes('ppt') || type.includes('presentation')) return "from-orange-500 to-amber-600";
    if (type.includes('jpg') || type.includes('png') || type.includes('image')) return "from-purple-500 to-fuchsia-600";
    return "from-blue-500 to-purple-600";
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-100 rounded-full opacity-20 blur-2xl"></div>
      
      <header className="flex justify-between items-center mb-8 z-10 relative">
        <h2 className="text-2xl font-bold text-gray-900">Featured Documents</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          onMouseEnter={() => setHoverState({...hoverState, upload: true})}
          onMouseLeave={() => setHoverState({...hoverState, upload: false})}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
        >
          <Plus size={18} className={`transition-transform duration-300 ${hoverState.upload ? 'rotate-90' : ''}`} />
          New Upload
        </button>
      </header>

      <div className="relative">
        <div className="bg-gradient-to-br rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
          {/* Document header with gradient based on file type */}
          <div className={`bg-gradient-to-r ${getGradient(currentDoc?.fileType)} h-32 p-6 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 opacity-10">
              {currentDoc?.fileType?.toLowerCase().includes('pdf') ? (
                <FileText size={180} />
              ) : (
                <File size={180} />
              )}
            </div>
            <span className="inline-block bg-white bg-opacity-20 text-white text-sm font-medium px-3 py-1 rounded-full mb-2">
              {currentDoc?.type || 'Document'}
            </span>
            <h3 className="text-2xl font-bold mb-1 truncate max-w-2xl">
              {currentDoc?.name || 'Untitled Document'}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-90">
                {new Date(currentDoc?.createdAt).toLocaleDateString()}
              </span>
              <span className="w-1 h-1 bg-white rounded-full opacity-70"></span>
              <span className="text-sm opacity-90">
                {formatFileSize(currentDoc?.fileSize || 0)}
              </span>
            </div>
          </div>
          
          {/* Document content and actions */}
          <div className="bg-white p-6">
            <div className="flex items-center gap-6 justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-xl p-4 w-20 h-20 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  {getFileIcon(currentDoc?.fileType, 42)}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Last modified</h4>
                  <p className="text-gray-500 text-sm">
                    {new Date(currentDoc?.updatedAt || currentDoc?.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleDownloadDocument(currentDoc)}
                  onMouseEnter={() => setHoverState({...hoverState, download: true})}
                  onMouseLeave={() => setHoverState({...hoverState, download: false})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    downloadingDocs[currentDoc?._id] 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  disabled={downloadingDocs[currentDoc?._id] || !currentDoc?.contentUrl}
                >
                  {downloadingDocs[currentDoc?._id] ? (
                    <div className="h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <Download size={50} className={`transition-transform duration-300 ${hoverState.download ? 'translate-y-1' : ''}`} />
                  )}
                  {downloadingDocs[currentDoc?._id] ? 'Downloading...' : 'Download'}
                </button>
                
                <button 
                  onClick={() => handleEditMetadata(currentDoc)}
                  onMouseEnter={() => setHoverState({...hoverState, edit: true})}
                  onMouseLeave={() => setHoverState({...hoverState, edit: false})}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg transition-all duration-300 hover:bg-purple-100"
                >
                  <Edit size={50} className={`transition-all duration-300 ${hoverState.edit ? 'rotate-12' : ''}`} />
                  Edit
                </button>
                
                <button 
                  onClick={() => setDocumentToDelete(currentDoc?._id)}
                  onMouseEnter={() => setHoverState({...hoverState, delete: true})}
                  onMouseLeave={() => setHoverState({...hoverState, delete: false})}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg transition-all duration-300 hover:bg-red-100"
                  disabled={isDeleting}
                >
                  <Trash2 size={50} className={`transition-all duration-300 ${hoverState.delete ? 'rotate-12' : ''}`} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation buttons with hover effect */}
        <button 
          onClick={prevDocument}
          onMouseEnter={() => setHoverState({...hoverState, prev: true})}
          onMouseLeave={() => setHoverState({...hoverState, prev: false})}
          aria-label="Go to previous document"
          className="absolute top-1/2 -left-3 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-x-1"
        >
          <ChevronLeft size={24} className={`text-gray-700 transition-transform duration-300 ${hoverState.prev ? '-translate-x-1' : ''}`} />
        </button>
        
        <button 
          onClick={nextDocument}
          onMouseEnter={() => setHoverState({...hoverState, next: true})}
          onMouseLeave={() => setHoverState({...hoverState, next: false})}
          aria-label="Go to next document"
          className="absolute top-1/2 -right-3 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-x-1"
        >
          <ChevronRight size={24} className={`text-gray-700 transition-transform duration-300 ${hoverState.next ? 'translate-x-1' : ''}`} />
        </button>
        
        {/* Document indicators with active animation */}
        <div className="flex justify-center mt-6 gap-3">
          {recentUploads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToDocumentIndex(index)}
              aria-label={`Go to document ${index + 1}`}
              className={`transition-all duration-300 ${
                currentDocIndex === index 
                  ? 'w-8 h-2 bg-blue-600' 
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              } rounded-full`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDocuments;