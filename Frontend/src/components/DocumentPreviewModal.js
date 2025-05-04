// src/components/DocumentPreviewModal.js
import { X, Download } from 'lucide-react';
import { toast } from 'react-toastify'; // Optional if you're using toasts

const handleDownload = async (doc, event = null) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  try {
    const url = doc?.url || doc?.contentUrl;
    if (!url) throw new Error('Document URL not found');

    let downloadUrl = url;

    // Add SAS token if needed (i.e., for activeDocument-style URLs)
    if (doc?.url && !doc?.contentUrl) {
      const baseUrl = url.split('?')[0];
      const sasToken = '?sp=racwdl&st=2025-04-12T12:41:12Z&se=2026-04-12T20:41:12Z&sv=2024-11-04&sr=c&sig=E0aYEFCm7MiPZeGi2ucCXoqeReWcITSD0LAkbmfY%2Bg8%3D';
      downloadUrl = `${baseUrl}${sasToken}`;
    }

    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = (doc?.title || doc?.name || 'document') + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(blobUrl);
    toast?.success?.(`Downloading ${doc.name || doc.title}`);
  } catch (error) {
    console.error('Download failed:', error);
    toast?.error?.(error.message || 'Download failed');
  }
};

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
          <button
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            onClick={(e) => handleDownload(document, e)}
          >
            <Download className="h-5 w-5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
