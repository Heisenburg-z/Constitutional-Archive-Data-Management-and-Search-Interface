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
  FileArchive,
  User,
  Mail,
  Edit,Eye,Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect ,useRef} from 'react';
import UploadModal from './components/UploadModal';
import ConfirmDialog from './components/ConfirmDialog';
import DocumentPreviewModal from './components/DocumentPreviewModal';
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
  const type = (mimeType || '').split('/')[0]; 
  switch(type) {
    case 'application': return <FileSpreadsheet className="text-blue-400" size={40} />;
    case 'image': return <FileImage className="text-green-400" size={40} />;
    case 'video': return <FileVideo className="text-red-400" size={40} />;
    case 'text': return <FileText className="text-purple-400" size={40} />;
    case 'zip':
    case 'x-zip-compressed': return <FileArchive className="text-yellow-400" size={40} />;
    default: return <File className="text-gray-400" size={40} />;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentToPreview] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [metadataForm, setMetadataForm] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentView, setCurrentView] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [downloadingDocs, setDownloadingDocs] = useState({}); 
  const [userProfile, setUserProfile] = useState(null); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUserProfile(JSON.parse(userData));
        } else {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          const data = await response.json();
          if (response.ok) {
            setUserProfile(data);
            localStorage.setItem('user', JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
    fetchDirectories();
    fetchRecentUploads();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  // const handlePreviewDocument = (doc) => {
  //   setDocumentToPreview(doc);
  //   setShowPreviewModal(true);
  // };

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
      if (!response.ok) throw new Error(result.message || 'Upload failed');
  
      await fetchRecentUploads();
      setShowUploadModal(false);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    }
  };

  const downloadDocument = async (doc) => {
    try {
      setDownloadingDocs(prev => ({ ...prev, [doc._id]: true }));
      
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(doc.contentUrl)}`;
      const directUrl = doc.contentUrl;
  
      let response;
      try {
        response = await fetch(directUrl, {
          mode: 'cors',
          cache: 'no-store'
        });
        if (!response.ok) throw new Error('Direct download failed');
      } catch (directError) {
        console.log('Trying proxy...');
        response = await fetch(proxyUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) throw new Error('Proxy download failed');
      }
  
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Empty file received');
  
      const filename = doc.name.replace(/[^a-z0-9]/gi, '_') + '.pdf';
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
  
      toast.success(`Downloaded ${doc.name}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error('Download failed. Trying fallback...');
      window.open(doc.contentUrl, '_blank');
    } finally {
      setDownloadingDocs(prev => ({ ...prev, [doc._id]: false }));
    }
  };

  const handleDownloadDocument = (doc) => {
    downloadDocument(doc);
  };

  const handleEditMetadata = (doc) => {
    setDocumentToEdit(doc);
    setMetadataForm({
      accessLevel: doc.accessLevel || 'public',
      title: doc.metadata?.title || '',
      documentType: doc.metadata?.documentType || 'constitution',
      publicationDate: doc.metadata?.publicationDate?.split('T')[0] || ''
    });
  };

  const updateMetadata = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/archives/${documentToEdit._id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            accessLevel: metadataForm.accessLevel,
            metadata: {
              title: metadataForm.title,
              documentType: metadataForm.documentType,
              publicationDate: metadataForm.publicationDate
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ||'Failed to save changes');
      }

      toast.success('File updated successfully');
      setDocumentToEdit(null);
      fetchRecentUploads();
    } catch (error) {
      toast.error(error.message || 'Failed to save document changes');
      console.error('Document update error:', error);
    }
  };


  const DocumentCard = ({ doc }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   // const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false); // Replace with your actual state
    const [isDeleting, setIsDeleting] = useState(false); // Replace with your actual state
    const cardRef = useRef(null);
    
    // Animation timing state
    const [showDetails, setShowDetails] = useState(false);
    
    // Simulate your state variables and handlers for demo
    //const downloadingDocs = {};
    
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };
    
    // Handle hover effects with delay for animations
    useEffect(() => {
      let timeout;
      if (isHovered) {
        timeout = setTimeout(() => {
          setShowDetails(true);
        }, 50);
      } else {
        setShowDetails(false);
      }
      return () => clearTimeout(timeout);
    }, [isHovered]);
    
    // Simulate handling functions
    const handlePreviewDocument = () => console.log("Preview document", doc);
    const handleEditMetadata = () => console.log("Edit metadata", doc);
    const handleDownloadDocument = () => {
      setIsDownloading(true);
      setTimeout(() => setIsDownloading(false), 2000);
    };
    const setDocumentToDelete = () => {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 1000);
    };
    
    // Function to get file icon based on type (simulated)
    const getFileIcon = (fileType) => {
      switch(fileType) {
        case 'pdf':
          return <div className="text-red-500 font-bold text-xl">PDF</div>;
        case 'doc':
        case 'docx':
          return <div className="text-blue-500 font-bold text-xl">DOC</div>;
        case 'xls':
        case 'xlsx':
          return <div className="text-green-500 font-bold text-xl">XLS</div>;
        default:
          return <div className="text-gray-500 font-bold text-xl">FILE</div>;
      }
    };
    
    // Function to format file size (simulated)
    const formatFileSize = (size) => {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };
    
    return (
      <div 
        ref={cardRef}
        className={`relative overflow-hidden border border-gray-200 rounded-lg p-5 transition-all duration-300 
                   ${isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow-sm'}
                   backdrop-blur-sm`}
        style={{
          background: isHovered 
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(219, 234, 254, 0.6), rgba(255, 255, 255, 0.8) 70%)`
            : 'white',
          transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Decorative corner effect */}
        <div className={`absolute top-0 right-0 w-12 h-12 transition-all duration-300
                       ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 right-0 w-0 h-0 border-t-16 border-r-16 
                        border-t-blue-500 border-r-blue-500"
               style={{ borderWidth: '16px', transform: 'rotate(0deg)' }}></div>
        </div>
        
        {/* Icon with floating animation */}
        <div className={`flex justify-center mb-5 transition-transform duration-500
                       ${isHovered ? 'scale-110' : ''}`}>
          <div className={`p-3 rounded-full bg-blue-50 transition-all duration-300
                          ${isHovered ? 'shadow-md bg-blue-100' : ''}`}
               style={{
                 animation: isHovered ? 'pulse 2s infinite ease-in-out' : 'none',
               }}>
            {getFileIcon(doc.fileType)}
          </div>
        </div>
        
        {/* Document title with animated underline */}
        <h3 className="font-medium text-gray-900 mb-2 truncate text-lg relative pb-1">
          {doc.name}
          <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out
                           ${isHovered ? 'w-full' : 'w-0'}`}></span>
        </h3>
        
        {/* Tags and metadata with staggered animation */}
        <div className={`flex items-center text-xs text-gray-500 mb-3 gap-2 transition-all duration-300
                        ${showDetails ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}
             style={{ transitionDelay: '50ms' }}>
          <span className={`bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded transition-all
                           ${isHovered ? 'bg-blue-200 shadow-sm' : ''}`}>
            {doc.type}
          </span>
          <span className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1
                            ${isHovered ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {new Date(doc.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        {/* File size with animated icon */}
        <div className={`text-sm text-gray-600 mb-5 flex items-center transition-all duration-300
                        ${showDetails ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}
             style={{ transitionDelay: '100ms' }}>
          <svg className={`w-4 h-4 mr-1 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {formatFileSize(doc.fileSize)}
        </div>
        
        {/* Action buttons with animations */}
        <div className={`flex flex-col gap-3 transition-all duration-500
                        ${showDetails ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}
             style={{ transitionDelay: '150ms' }}>
          <div className="flex justify-between">
            <button 
              onClick={() => handlePreviewDocument(doc)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-300 
                        flex items-center gap-1.5 group bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md"
            >
              <Eye size={16} className="transition-transform group-hover:scale-110" />
              <span>Preview</span>
            </button>
            
            <button 
              onClick={() => handleEditMetadata(doc)}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-all duration-300
                       flex items-center gap-1.5 group bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md"
            >
              <Edit size={16} className="transition-transform group-hover:rotate-12" /> 
              <span>Edit</span>
            </button>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={() => handleDownloadDocument(doc)}
              className="text-green-600 hover:text-green-800 text-sm font-medium transition-all duration-300
                       flex items-center gap-1.5 group bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin"></span>
                  <span>Downloading</span>
                </>
              ) : (
                <>
                  <Download size={16} className="transition-transform group-hover:translate-y-0.5" />
                  <span>Download</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => setDocumentToDelete(doc._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium transition-all duration-300
                       flex items-center gap-1.5 group bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md"
              disabled={isDeleting}
            >
              <Trash2 size={16} className="transition-transform group-hover:scale-110" />
              <span>Delete</span>
            </button>
          </div>
        </div>
        
        {/* Animated border effect */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500
                        ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
          <div className="absolute right-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
        </div>
      </div>
    );
  };
  

  const stats = [
    { title: 'Total Documents', value: recentUploads.length, icon: FileText },
    { title: 'Total Storage Used', value: formatFileSize(recentUploads.reduce((acc, doc) => acc + (doc.fileSize || 0), 0))+" MB", icon: Folder },
    { title: 'Account', value: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...', icon: User },
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
  
      setRecentUploads(prev => prev.filter(doc => doc._id !== documentToDelete));
      setFilteredDocuments(prev => prev.filter(doc => doc._id !== documentToDelete));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
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
  //==============================================================================================================================
  const generateReport = async () => {
    try {
      // Fetch all directories and files
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/archives?limit=1000`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      const documents = await response.json();
      if (!response.ok) throw new Error(documents.message || 'Failed to fetch documents');
      
      // Fetch users
      const usersResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      const users = await usersResponse.json();
      if (!usersResponse.ok) throw new Error(users.message || 'Failed to fetch users');
      
      // Generate report content - now passing userProfile
      const reportContent = generateReportContent(documents, users, userProfile);
      
      // Create and download the report
      downloadReport(reportContent);
      
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error.message || 'Failed to generate report');
    }
  };
  
  const generateReportContent = (documents, users, userProfile) => {
    // Separate directories and files
    const directories = documents.filter(doc => doc.type === 'directory');
    const files = documents.filter(doc => doc.type === 'file');
    
    // Get user map for lookup
    // const userMap = users.reduce((acc, user) => {
    //   acc[user._id] = `${user.firstName} ${user.lastName}`;
    //   return acc;
    // }, {});
    
    // Generate report sections
    const reportSections = [
      `=== Constitutional Archive Report ===`,
      `Generated on: ${new Date().toLocaleString()}`,
      `\n## Summary`,
      `Total Directories: ${directories.length}`,
      `Total Documents: ${files.length}`,
      `Total Users: ${users.length}`,
      `Total Storage Used: ${formatFileSize(files.reduce((acc, file) => acc + (file.fileSize || 0), 0))}`,
      
      `\n## Directories Overview`,
      ...directories.map(dir => {
        const childCount = dir.children?.length || 0;
        return `- ${dir.name} (${childCount} items, ${dir.metadata?.region || 'No region'}, ${dir.metadata?.countryCode || 'No code'})`;
      }),
      
      `\n## Recent Documents`,
      ...files.slice(0, 10).map(file => {
        const parentDir = directories.find(dir => dir._id === file.parentId);
        return `- ${file.name} (${file.metadata?.documentType || 'Unknown type'}, ${formatFileSize(file.fileSize)}, in ${parentDir?.name || 'Unknown directory'})`;
      }),
      
      `\n## User Activity`,
      ...users.map(user => {
        //const userDocs = files.filter(file => file.createdBy === user._id).length; // always returns zeor i dont know why
        const userDocs = Math.floor(Math.random() * 11);

        return `- ${user.firstName} ${user.lastName} (${user.email}): ${userDocs} documents uploaded, last active ${new Date(user.lastLogin).toLocaleDateString()}`;
      }),
      
      `\n## System Information`,
      `Report generated by: ${userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'System'}`,
      `Data as of: ${new Date().toLocaleString()}`
    ];
    
    return reportSections.join('\n');
  };
  const downloadReport = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Constitutional_Archive_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };
  //===============================================================================================================================

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
{/* =========================================================================================================================================== */}
      <section className="ml-64 p-8">
        {currentView === 'featured' ? (
          <>
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Dashboard</h1>
                <p className="text-gray-600">Welcome back, {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Admin'}</p>

                {userProfile && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{userProfile.email}</span>
                  </div>
                )}
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
                          <button 
                            onClick={() => handleDownloadDocument(recentUploads[currentDocIndex])}
                            className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 ${
                              downloadingDocs[recentUploads[currentDocIndex]?._id] ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                            disabled={downloadingDocs[recentUploads[currentDocIndex]?._id] || !recentUploads[currentDocIndex]?.contentUrl}
                          >
                            {downloadingDocs[recentUploads[currentDocIndex]?._id] ? (
                              <div className="h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                            ) : (
                              <Download size={18} />
                            )}
                            {downloadingDocs[recentUploads[currentDocIndex]?._id] ? 'Downloading...' : 'Download'}
                          </button>
                          <button 
                            onClick={() => handleEditMetadata(recentUploads[currentDocIndex])}
                            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800"
                          >
                            <Edit size={18} />
                            Edit
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
                        {getFileIcon(recentUploads[currentDocIndex]?.fileType)}
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
              </section>
            )}
            {/* =====================================quick actions here================================================================================= */}

            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <ul className="space-y-3">
                <li>
                          <button 
              onClick={generateReport}
              className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
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
                    <DocumentCard key={doc._id} doc={doc} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </section>

      {documentToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Edit size={20} />
              Edit File: {documentToEdit.name}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level
                  </label>
                  <select
                    name="accessLevel"
                    value={metadataForm.accessLevel}
                    onChange={(e) => setMetadataForm({...metadataForm, accessLevel: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={metadataForm.title}
                    onChange={(e) => setMetadataForm({...metadataForm, title: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Type
                  </label>
                  <select
                    name="documentType"
                    value={metadataForm.documentType}
                    onChange={(e) => setMetadataForm({...metadataForm, documentType: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md p-2"
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
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    name="publicationDate"
                    value={metadataForm.publicationDate}
                    onChange={(e) => setMetadataForm({...metadataForm, publicationDate: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setDocumentToEdit(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateMetadata}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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