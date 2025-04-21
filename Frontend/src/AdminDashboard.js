import {
  BarChart,
  Upload,
  Folder,
  Users,
  Settings,
  FileText,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadModal from './components/UploadModal';
import ConfirmDialog from './components/ConfirmDialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'https://constitutional-archive-data-management-api-cvcscmdvcmfscweq.southafricanorth-01.azurewebsites.net'


const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const stats = [
    { title: 'Total Documents', value: '1,234', icon: FileText },
    { title: 'Storage Used', value: '64 GB', icon: Folder },
    { title: 'Active Users', value: '89', icon: Users },
  ];

  const handleUpload = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/archives/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
  
      const result = await response.json();
      console.log('Upload result:', result); // Debug log
  
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

  const fetchDirectories = async () => {
    const response = await fetch('/api/archives?type=directory');
    const data = await response.json();
    setDirectories(data);
  };

  const fetchRecentUploads = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/archives?sort=-createdAt&limit=10`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
  
      const data = await response.json();
      console.log('Recent uploads:', data); // Debug log
  
      if (!response.ok) throw new Error(data.message || 'Failed to fetch uploads');
      
      setRecentUploads(data);
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
        `${API_BASE_URL}/api/archives/${documentToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const result = await response.json();
      console.log('Delete response:', result); // Debug log
  
      if (!response.ok) throw new Error(result.message || 'Delete failed');
  
      // Optimistic UI update
      setRecentUploads(prev => prev.filter(doc => doc._id !== documentToDelete));
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
  
  useEffect(() => {
    fetchDirectories();
    fetchRecentUploads();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed top-0 left-0 h-full w-64 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Constitutional Archive</h2>
        <ul className="space-y-4">
          <li>
            <a
              href="#dashboard"
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <BarChart size={20} />
              Dashboard
            </a>
          </li>
          <li>
            <div
              onClick={() => setShowUploadModal(true)}
              className="cursor-pointer flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Upload size={20} />
              Upload
            </div>
          </li>
          <li>
            <a
              href="#manage"
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Folder size={20} />
              Manage
            </a>
          </li>
          <li>
            <a
              href="#users"
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Users size={20} />
              Users
            </a>
          </li>
          <li>
            <a
              href="#settings"
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings size={20} />
              Settings
            </a>
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
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Admin</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <article key={stat.title} className="bg-white p-6 rounded-xl shadow-sm">
              <stat.icon className="text-blue-600 mb-4" size={24} />
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              New Upload
            </button>
          </header>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.map((upload) => (
                <tr key={upload._id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-4">{upload.name}</td>
                  <td className="py-4">{upload.type}</td>
                  <td className="py-4">{new Date(upload.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">{formatFileSize(upload.fileSize)}</td>
                  <td className="py-4">
                    <button 
                      onClick={() => setDocumentToDelete(upload._id)}
                      className="text-red-600 hover:text-red-800 p-1 disabled:text-red-300"
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <ul className="space-y-3">
              <li>
                <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FileText size={18} />
                  Generate Report
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Users size={18} />
                  Manage Permissions
                </button>
              </li>
            </ul>
          </article>

          <article className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-600">Storage</dt>
                <dd className="font-medium">64 GB / 100 GB</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Active Sessions</dt>
                <dd className="font-medium">12</dd>
              </div>
            </dl>
          </article>
        </section>
      </section>

      {showUploadModal && (
  <UploadModal
    directories={directories}
    onClose={() => setShowUploadModal(false)}
    onSubmit={handleUpload}  // Use the defined function here
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