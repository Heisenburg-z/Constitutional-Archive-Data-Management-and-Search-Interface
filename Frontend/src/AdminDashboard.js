// src/components/Dashboard/AdminDashboard.js

import { BarChart, Upload, User,Edit ,History,LogOut} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadModal from './components/UploadModal';
import ConfirmDialog from './components/ConfirmDialog';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DocumentSubmissionLog from './components/DocumentSubmissionLog'; 
import { jsPDF } from 'jspdf';
// Import our modularized components /components/Dashboard
import DashboardHeader from './components/Dashboard/DashboardHeader';
import StatCard from './components/Dashboard/StatCard';
import QuickActions from './components/Dashboard/QuickActions';
import FeaturedDocuments from './components/Dashboard/FeaturedDocuments';
import AllDocumentsView from './components/Dashboard/AllDocumentsView';


import { formatFileSize } from './utils/fileUtils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentToPreview, setDocumentToPreview] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [metadataForm, setMetadataForm] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
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

  const stats = [
    { title: 'Total Documents', value: recentUploads.length, icon: User },
    { title: 'Storage Used', value: formatFileSize(recentUploads.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)), icon: User },
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
      
      // Generate PDF report
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Constitutional Archive Report', 105, 20, { align: 'center' });
    
    // Add generated date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add generated by
    doc.text(`Generated by: ${userProfile.firstName} ${userProfile.lastName}`, 105, 40, { align: 'center' });
    
    // Add statistics
    doc.setFontSize(16);
    doc.text('Statistics', 14, 60);
    doc.setFontSize(12);
    doc.text(`Total Documents: ${documents.length}`, 14, 70);
    doc.text(`Total Users: ${users.length}`, 14, 80);
    
    // Add document list
    doc.setFontSize(16);
    doc.text('Recent Documents', 14, 100);
    doc.setFontSize(10);
    
    let yPosition = 110;
    documents.slice(0, 30).forEach((docItem, index) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${index + 1}. ${docItem.name} (${docItem.type}) - ${new Date(docItem.createdAt).toLocaleDateString()}`, 14, yPosition);
      yPosition += 7;
    });
    
    // Save the PDF
    doc.save('Constitutional_Archive_Report.pdf');
      
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error.message || 'Failed to generate report');
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

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed top-0 left-0 h-full w-64 p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-8">Constitutional Archive</h2>
        <ul className="space-y-4">
          <li>
            <div
              onClick={() => setCurrentView('dashboard')}
              className="cursor-pointer flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              <BarChart size={20} className="text-blue-600" />
              Dashboard
            </div>
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
          <li>
            <div
              onClick={() => setCurrentView('recent')}
              className="cursor-pointer flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              <History size={20} className="text-blue-600" />
              Submission Log
            </div>
          </li>
        </ul>
        <li className="list-none"> {/* Add list-none to remove bullet point */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut size={20} className="text-red-600" />
          <span>Logout</span>
        </button>
        </li>
      </nav>

      <section className="ml-64 p-8">
        {currentView === 'dashboard' ? (
          <>
            <DashboardHeader 
              userProfile={userProfile} 
              setCurrentView={setCurrentView} 
            />

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat) => (
                <StatCard 
                  key={stat.title} 
                  title={stat.title} 
                  value={stat.value} 
                  icon={stat.icon} 
                />
              ))}
            </section>

            {recentUploads.length > 0 && (
              <FeaturedDocuments 
                recentUploads={recentUploads}
                currentDocIndex={currentDocIndex}
                nextDocument={nextDocument}
                prevDocument={prevDocument}
                goToDocumentIndex={goToDocumentIndex}
                handleDownloadDocument={handleDownloadDocument}
                handleEditMetadata={handleEditMetadata}
                setDocumentToDelete={setDocumentToDelete}
                downloadingDocs={downloadingDocs}
                isDeleting={isDeleting}
                setShowUploadModal={setShowUploadModal}
              />
            )}

            <QuickActions 
              generateReport={generateReport}
              setShowUploadModal={setShowUploadModal}
            />
          </>
          ) : currentView === 'recent' ? (
            <DocumentSubmissionLog 
              documents={recentUploads}  
              handleDownloadDocument={handleDownloadDocument}
              handleEditMetadata={handleEditMetadata}
              setDocumentToDelete={setDocumentToDelete}
              downloadingDocs={downloadingDocs}
              isDeleting={isDeleting}
            />


        ) : (
          <AllDocumentsView 
            setCurrentView={setCurrentView}
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            filteredDocuments={filteredDocuments}
            downloadingDocs={downloadingDocs}
            handlePreviewDocument={handlePreviewDocument}
            handleEditMetadata={handleEditMetadata}
            handleDownloadDocument={handleDownloadDocument}
            setDocumentToDelete={setDocumentToDelete}
            isDeleting={isDeleting}
          />
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