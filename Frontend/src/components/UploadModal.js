import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Folder, Globe, Lock, Tag, Calendar, BookOpen } from 'lucide-react';

const UploadModal = ({ directories, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    onDrop: acceptedFiles => setFile(acceptedFiles[0])
  });

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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('type', 'file');
    formData.append('parentId', parentId);
    formData.append('accessLevel', accessLevel);
    formData.append('metadata', JSON.stringify(metadata));
    
    await onSubmit(formData);
    onClose();
  };

  return (
    <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <main className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Upload New Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <section
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            <figure>
              <Upload className="mx-auto mb-4 text-gray-600" size={24} />
              <figcaption className="text-gray-600">
                {file ? file.name : 'Drag & drop file here, or click to select'}
              </figcaption>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT (Max 100MB)
              </p>
            </figure>
          </section>

          <fieldset className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Folder size={18} /> Parent Directory
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
            >
              <option value="">Root Directory</option>
              {directories.map(dir => (
                <option key={dir._id} value={dir._id}>{dir.name}</option>
              ))}
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
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </fieldset>

          <article className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <fieldset className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <BookOpen size={18} /> Document Title
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </fieldset>

            <fieldset className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag size={18} /> Document Type
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={metadata.documentType}
                onChange={(e) => setMetadata(prev => ({ ...prev, documentType: e.target.value }))}
              >
                <option value="constitution">Constitution</option>
                <option value="amendment">Amendment</option>
                <option value="bill">Bill</option>
                <option value="report">Report</option>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
                  placeholder="Add keyword..."
                />
                <button
                  type="button"
                  onClick={handleKeywordAdd}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                >
                  Add
                </button>
              </section>
              <ul className="flex flex-wrap gap-2 mt-2">
                {metadata.keywords.map((keyword, index) => (
                  <li
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm list-none"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            </fieldset>
          </article>

          <footer className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={!file}
            >
              Upload Document
            </button>
          </footer>
        </form>
      </main>
    </section>
  );
};

export default UploadModal;
