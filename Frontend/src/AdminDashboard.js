import { 
  BarChart,
  Upload,
  Folder,
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,

  Download,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileArchive

} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadModal from './components/UploadModal';
import ConfirmDialog from './components/ConfirmDialog';
import DocumentPreviewModal from './components/DocumentPreviewModal'; // New component
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
};

const getFileIcon = (mimeType) => {
  const type = mimeType.split('/')[0];
  switch(type) {
    case 'application':
      return <FileSpreadsheet className="text-blue-400" size={40} />;
    case 'image':
      return <FileImage className="text-green-400" size={40} />;
    case 'video':
      return <FileVideo className="text-red-400" size={40} />;
    case 'text':
      return <FileText className="text-purple-400" size={40} />;
    case 'application/zip':
    case 'application/x-zip-compressed':
      return <FileArchive className="text-yellow-400" size={40} />;
    default:
      return <File className="text-gray-400" size={40} />;
  }
};
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentToPreview, setDocumentToPreview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentView, setCurrentView] = useState('featured');

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handlePreviewDocument = (doc) => {
    setDocumentToPreview(doc);
    setShowPreviewModal(true);
  };

  const handleUpload = async (formData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/archives/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }
  
      // Refresh the list and close modal
      await fetchRecentUploads();
      setShowUploadModal(false);
      toast.success('Document uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    }
  };

    
  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(doc.contentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const DocumentCard = ({ doc }) => (
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
        {formatFileSize(doc.fileSize)}
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
            onClick={() => handleDownloadDocument(doc)}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            Download
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


  const stats = [
    { title: 'Total Documents', value: recentUploads.length, icon: FileText },
    { title: 'Storage Used', value: formatFileSize(recentUploads.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)), icon: Folder },
  ];

  const fetchDirectories = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/archives?type=directory`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch directories');
      
      setDirectories(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load directories');
    }
  };

  const fetchRecentUploads = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/archives?sort=-createdAt&limit=10`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || 'Failed to fetch uploads');
      
      setRecentUploads(data);
      setFilteredDocuments(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load recent documents');
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
  
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/archives/${documentToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.message || 'Delete failed');
  
      // Optimistic UI update
      setRecentUploads(prev => prev.filter(doc => doc._id !== documentToDelete));
      setFilteredDocuments(prev => prev.filter(doc => doc._id !== documentToDelete));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
      // Refresh to ensure consistency
      await fetchRecentUploads();
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredDocuments(recentUploads);
    } else {
      const filtered = recentUploads.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        doc.type.toLowerCase().includes(query)
      );
      setFilteredDocuments(filtered);
    }
  };

  const nextDocument = () => {
    setCurrentDocIndex((prevIndex) => 
      prevIndex === recentUploads.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevDocument = () => {
    setCurrentDocIndex((prevIndex) => 
      prevIndex === 0 ? recentUploads.length - 1 : prevIndex - 1
    );
  };

  const goToDocumentIndex = (index) => {
    setCurrentDocIndex(index);
  };

  useEffect(() => {
    fetchDirectories();
    fetchRecentUploads();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed top-0 left-0 h-full w-64 p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-8">Constitutional Archive</h2>
        <ul className="space-y-4">
          <li>
            <a
              href="#dashboard"
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              <BarChart size={20} className="text-blue-600" />
              Dashboard
            </a>
          </li>
          <li>
            <div
              onClick={() => setShowUploadModal(true)}
              className="cursor-pointer flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              <Upload size={20} className="text-blue-600" />
              Upload
            </div>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="mt-8 w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          Logout
        </button>
      </nav>

      <section className="ml-64 p-8">
        {currentView === 'featured' ? (
          <>
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Dashboard</h1>
                <p className="text-gray-600">Manage your constitutional documents</p>
              </div>
              <button 
                onClick={() => setCurrentView('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <Search size={16} />
                Browse All Documents
              </button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {stats.map((stat) => (
                <article key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <stat.icon className="text-blue-600 mb-4" size={24} />
                  <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </article>
              ))}
            </section>

            {recentUploads.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <header className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Featured Documents</h2>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    New Upload
                  </button>
                </header>

                {recentUploads.length > 0 && (
                  <div className="relative">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {recentUploads[currentDocIndex]?.type || 'Document'}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(recentUploads[currentDocIndex]?.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {recentUploads[currentDocIndex]?.name || 'Untitled Document'}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {formatFileSize(recentUploads[currentDocIndex]?.fileSize || 0)}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-6">
                            <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                              <Download size={18} />
                              Download
                            </button>
                            <button 
                              onClick={() => setDocumentToDelete(recentUploads[currentDocIndex]?._id)}
                              className="inline-flex items-center gap-2 text-red-600 hover:text-red-800"
                              disabled={isDeleting}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 w-64 h-64 flex items-center justify-center">
                          <FileText size={64} className="text-blue-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4">
                      <button 
                        onClick={prevDocument}
                        aria-label="Go to previous document"
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    </div>
                    
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4">
                      <button 
                        onClick={nextDocument}
                        aria-label="Go to next document"
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    <div className="flex justify-center mt-4 gap-2">
                      {recentUploads.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToDocumentIndex(index)}
                          aria-label={`Go to document ${index + 1}`}
                          className={`w-2 h-2 rounded-full ${
                            currentDocIndex === index ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <ul className="space-y-3">
                <li>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <FileText size={18} className="text-blue-600" />
                    Generate Report
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Upload size={18} className="text-blue-600" />
                    Upload Document
                  </button>
                </li>
              </ul>
            </section>
          </>
        ) : (
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
                    <div key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-4">
                        <FileText size={40} className="text-blue-400" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 mb-3 gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">{doc.type}</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {formatFileSize(doc.fileSize)}
                      </div>
                      <div className="flex justify-between">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Details
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
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </section>

      {showUploadModal && (
        <UploadModal
          directories={directories}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUpload}  
        />
      )}

                      {showPreviewModal && documentToPreview && (
          <DocumentPreviewModal
            document={documentToPreview}
            onClose={() => setShowPreviewModal(false)}
          />
        )}

      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        isProcessing={isDeleting}
      />
    </main>
  );
};

export default AdminDashboard;
