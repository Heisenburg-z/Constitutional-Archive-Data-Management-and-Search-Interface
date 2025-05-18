import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileArchive,
  ChevronRight,
  Search,
  Filter,
  Globe,
  FileType,
  Calendar,

} from 'lucide-react';

const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [currentItems, setCurrentItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState(['Home']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    country: '',
    documentType: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    countries: [],
    documentTypes: []
  });

  // Fetch documents based on current path and filters
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        let url = `${process.env.REACT_APP_API_URL}/archives/explorer?path=${encodeURIComponent(currentPath)}`;
        
        // Add filters if they exist
        if (filters.type) url += `&type=${filters.type}`;
        if (filters.country) url += `&country=${filters.country}`;
        if (filters.documentType) url += `&documentType=${filters.documentType}`;
        if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        
        setCurrentItems(data.items);
        setAvailableFilters(data.filters);
        
        // Update breadcrumbs based on path
        if (currentPath === '/') {
          setBreadcrumbs(['Home']);
        } else {
          const parts = currentPath.split('/').filter(p => p);
          setBreadcrumbs(['Home', ...parts]);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPath, filters, searchQuery]);

  // Navigate to a directory
  const navigateTo = (path) => {
    setCurrentPath(path);
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      navigateTo('/');
    } else {
      const path = breadcrumbs.slice(1, index + 1).join('/');
      navigateTo(path);
    }
  };

  // Handle folder click
  const handleFolderClick = (folderName) => {
    const newPath = currentPath === '/' ? folderName : `${currentPath}/${folderName}`;
    navigateTo(newPath);
  };

  // Render appropriate icon based on file type
  const renderIcon = (item) => {
    if (item.isDirectory) return <Folder className="text-yellow-500 flex-shrink-0" />;
    if (item.isVideo) return <FileVideo className="text-red-500 flex-shrink-0" />;
    if (item.fileType?.includes('pdf')) return <FileText className="text-red-600 flex-shrink-0" />;
    if (item.fileType?.includes('image')) return <FileImage className="text-green-500 flex-shrink-0" />;
    if (item.fileType?.includes('zip') || item.fileType?.includes('archive')) {
      return <FileArchive className="text-yellow-600 flex-shrink-0" />;
    }
    return <FileText className="text-blue-500 flex-shrink-0" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with search and filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Constitutional Archive Explorer</h2>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center mt-4 flex-wrap gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-1 text-gray-400" size={16} />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`px-2 py-1 rounded ${index === breadcrumbs.length - 1 ? 'font-semibold text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {crumb}
              </button>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <Filter size={16} className="text-gray-600" />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              {availableFilters.types.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <Globe size={16} className="text-gray-600" />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
            >
              <option value="">All Countries</option>
              {availableFilters.countries.map(code => (
                <option key={code} value={code}>
                  {code === 'ZA' ? 'South Africa' : code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <FileType size={16} className="text-gray-600" />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filters.documentType}
              onChange={(e) => setFilters({...filters, documentType: e.target.value})}
            >
              <option value="">All Document Types</option>
              {availableFilters.documentTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading documents...
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No documents found in this location
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-gray-600 text-sm">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Country</th>
                <th className="p-3 font-medium">Document Type</th>
                <th className="p-3 font-medium">Size</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-blue-50 cursor-pointer"
                  onClick={() => item.isDirectory ? handleFolderClick(item.name) : window.open(item.url, '_blank')}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {renderIcon(item)}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {item.isDirectory ? 'Folder' : item.fileType?.split('/').pop()}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {item.metadata?.countryCode || '-'}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {item.metadata?.documentType || '-'}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatFileSize(item.size)}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(item.metadata?.publicationDate || item.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal would go here */}
    </div>
  );
};

export default FileExplorer;