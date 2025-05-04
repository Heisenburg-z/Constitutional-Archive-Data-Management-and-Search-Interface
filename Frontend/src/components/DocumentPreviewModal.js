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


        <button
  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
  onClick={async (e) => {
    e.preventDefault();
    try {
      // Fetch the file
      const response = await fetch(document.contentUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = document.name || 'document';
      
      // Append to body, click, and clean up
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  }}
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