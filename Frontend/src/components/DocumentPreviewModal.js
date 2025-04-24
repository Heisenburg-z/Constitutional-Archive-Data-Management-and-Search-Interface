import { X, Download } from 'lucide-react';

const DocumentPreviewModal = ({ document, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">{document.name}</h2>
        
        <div className="h-96">
          {document.fileType === 'application/pdf' ? (
            <iframe 
              src={document.contentUrl} 
              className="w-full h-full border rounded-lg"
              title={document.name}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Preview not available for this file type
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-4">
          <a
            href={document.contentUrl}
            download={document.name}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Download className="h-5 w-5" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;