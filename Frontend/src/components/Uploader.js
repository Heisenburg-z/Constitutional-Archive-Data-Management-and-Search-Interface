import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import UploadModal from './UploadModal';

const Uploader = ({ onUploadSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleUploadSuccess = (result) => {
    if (onUploadSuccess) {
      onUploadSuccess(result);
    }
    setShowModal(false);
  };
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Upload size={16} />
        Upload Document
      </button>
      
      {showModal && (
        <UploadModal 
          onClose={() => setShowModal(false)} 
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default Uploader;