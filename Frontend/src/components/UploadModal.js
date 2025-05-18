import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Folder, Globe, Lock, Tag, Calendar, BookOpen, Loader, File, Image, Video, Music, Eye } from 'lucide-react';
import { uploadDocument, fetchDirectories } from '../services/uploadService';
import { toast } from 'react-toastify';

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [directories, setDirectories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    publicationDate: '',
    documentType: 'constitution',
    language: 'en',
    keywords: [],
    region: 'Southern Africa',
    countryCode: 'ZA'
  });
  const [parentId, setParentId] = useState(null);
  const [accessLevel, setAccessLevel] = useState('public');
  const [newKeyword, setNewKeyword] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  //const fileInputRef = useRef(null);

  // Fetch directories on component mount
  useEffect(() => {
    const loadDirectories = async () => {
      try {
        setIsLoading(true);
        const dirData = await fetchDirectories();
        setDirectories(dirData);
      } catch (err) {
        setError('Failed to load directories');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectories();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi']
    },
    multiple: false,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      setFile(file);
      generatePreview(file);
    }
  });

  const generatePreview = (file) => {
    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewData({
          type: 'image',
          data: reader.result,
          name: file.name,
          size: file.size
        });
      };
    } else if (file.type === 'application/pdf') {
      // For PDFs we'll just show a thumbnail since we can't render PDFs without a library
      setPreviewData({
        type: 'pdf',
        data: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      });
    } else if (file.type.startsWith('text/') || file.type.includes('document')) {
      reader.readAsText(file);
      reader.onload = () => {
        setPreviewData({
          type: 'text',
          data: reader.result,
          name: file.name,
          size: file.size
        });
      };
    } else if (file.type.startsWith('video/')) {
      setPreviewData({
        type: 'video',
        data: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      });
    } else if (file.type.startsWith('audio/')) {
      setPreviewData({
        type: 'audio',
        data: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      });
    } else {
      // For unsupported types, just show file info
      setPreviewData({
        type: 'unsupported',
        data: file,
        name: file.name,
        size: file.size
      });
    }
  };

  const getFileIcon = () => {
    if (!file) return <File size={24} />;
    if (file.type.startsWith('image/')) return <Image size={24} />;
    if (file.type.startsWith('video/')) return <Video size={24} />;
    if (file.type.startsWith('audio/')) return <Music size={24} />;
    return <File size={24} />;
  };

  const getFileType = () => {
    if (!file) return 'file';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const handlePreview = () => {
    if (!file) return;
    setIsPreviewing(true);
  };

  const handleClosePreview = () => {
    setIsPreviewing(false);
  };

  const handleKeywordAdd = () => {
    if (newKeyword.trim() && !metadata.keywords.includes(newKeyword.trim())) {
      setMetadata(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
  
    // If we're in preview mode, just go back to form
    if (isPreviewing) {
      handleClosePreview();
      return;
    }
  
    try {
      setIsLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('type', getFileType());
      
      if (parentId) {
        formData.append('parentId', parentId);
      }
      
      formData.append('accessLevel', accessLevel);
      formData.append('metadata', JSON.stringify(metadata));
      
      const result = await uploadDocument(formData);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      toast.success('🎉 Document uploaded successfully!');
      setTimeout(() => onClose(), 500); 
    } catch (err) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDirectoryOptions = (dirs, level = 0) => {
    return dirs.map(dir => (
      <React.Fragment key={dir._id}>
        <option value={dir._id}>
          {"\u00A0".repeat(level * 2)}{level > 0 ? "└─ " : ""}{dir.name}
        </option>
        {dir.children && dir.children.length > 0 && 
          renderDirectoryOptions(dir.children.filter(child => child.type === 'directory'), level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <main className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isPreviewing ? 'Document Preview' : 'Upload New File'}
          </h2>
          <button onClick={isPreviewing ? handleClosePreview : onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
            <X size={20} />
          </button>
        </header>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isPreviewing ? (
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg p-4 h-96 overflow-auto flex flex-col items-center justify-center">
              {previewData?.type === 'image' && (
                <img 
                  src={previewData.data} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {previewData?.type === 'pdf' && (
                <iframe 
                  src={previewData.data} 
                  className="w-full h-full"
                  title="PDF Preview"
                />
              )}
              {previewData?.type === 'text' && (
                <pre className="whitespace-pre-wrap font-sans w-full max-h-full overflow-auto p-4 bg-gray-50 rounded">
                  {previewData.data}
                </pre>
              )}
              {previewData?.type === 'video' && (
                <video controls className="max-h-full max-w-full">
                  <source src={previewData.data} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              {previewData?.type === 'audio' && (
                <div className="text-center w-full">
                  <Music size={80} className="text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">{previewData.name}</p>
                  <audio controls className="w-full mt-4">
                    <source src={previewData.data} type={file.type} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              {previewData?.type === 'unsupported' && (
                <div className="text-center">
                  {getFileIcon()}
                  <p className="text-lg font-medium mt-2">{previewData.name}</p>
                  <p className="text-gray-500">{(previewData.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="mt-4 text-gray-500">Preview not available for this file type</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue Editing
              </button>

            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <section
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              <figure>
                <div className="mx-auto mb-4 text-gray-600">
                  {getFileIcon()}
                </div>
                <figcaption className="text-gray-600">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <span>{file.name}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    'Drag & drop file here, or click to select'
                  )}
                </figcaption>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: Documents, Images, Audio, Video (Max 100MB)
                </p>
              </figure>
            </section>

            {file && (
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                  disabled={isLoading}
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewData(null);
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                  disabled={isLoading}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            )}

            <fieldset className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Folder size={18} /> Parent Directory
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                disabled={isLoading}
              >
                <option value="">Root Directory</option>
                {renderDirectoryOptions(directories)}
              </select>
            </fieldset>

            <fieldset className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {accessLevel === 'public' ? <Globe size={18} /> : <Lock size={18} />}
                Access Level
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                disabled={isLoading}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </fieldset>

            <article className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <fieldset className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen size={18} /> File Title
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </fieldset>

              <fieldset className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag size={18} /> File Type
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={metadata.documentType}
                  onChange={(e) => setMetadata(prev => ({ ...prev, documentType: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="constitution">Constitution</option>
                  <option value="amendment">Amendment</option>
                  <option value="bill">Bill</option>
                  <option value="report">Report</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </fieldset>

              <fieldset className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar size={18} /> Publication Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={metadata.publicationDate}
                  onChange={(e) => setMetadata(prev => ({ ...prev, publicationDate: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </fieldset>

              <fieldset className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Keywords
                </label>
                <section className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && handleKeywordAdd()}
                    placeholder="Add keyword..."
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleKeywordAdd}
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Add
                  </button>
                </section>
                <ul className="flex flex-wrap gap-2 mt-2">
                  {metadata.keywords.map((keyword, index) => (
                    <li
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => setMetadata(prev => ({
                          ...prev,
                          keywords: prev.keywords.filter((_, i) => i !== index)
                        }))}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>
            </article>

            <footer className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload File
                  </>
                )}
              </button>
            </footer>
          </form>
        )}
      </main>
    </section>
  );
};

export default UploadModal;