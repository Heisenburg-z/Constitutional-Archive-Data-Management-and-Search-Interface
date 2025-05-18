import { useState, useEffect } from 'react';
import { Folder, File, FileText, Video, Image, Grid, List, ChevronRight, ChevronDown, Search, Filter, ArrowUpDown, Download, Eye, Info, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';

export default function FileExplorer() {
  // State variables
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
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
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, [currentPath, searchQuery, filters, sort, order, pagination.page, pagination.limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        path: currentPath,
        limit: pagination.limit,
        page: pagination.page,
        sort,
        order
      });
      
      if (filters.type) params.append('type', filters.type);
      if (filters.country) params.append('country', filters.country);
      if (filters.documentType) params.append('documentType', filters.documentType);
      if (searchQuery) params.append('query', searchQuery);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/archives/explorer?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      setItems(data.items);
      setAvailableFilters(data.filters);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
      setLoading(false);
    }
  };

  // Navigate to a directory
  const navigateToDirectory = (dirPath) => {
    setCurrentPath(dirPath);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
    setSelectedItem(null);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      navigateToDirectory('/');
      return;
    }
    
    const pathParts = currentPath.split('/').filter(Boolean);
    const newPath = '/' + pathParts.slice(0, index + 1).join('/');
    navigateToDirectory(newPath);
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center text-sm mb-4 overflow-x-auto whitespace-nowrap">
        <span 
          className="text-blue-600 hover:underline cursor-pointer flex items-center" 
          onClick={() => handleBreadcrumbClick(-1)}
        >
          <Folder size={16} className="mr-1" /> Home
        </span>
        
        {pathParts.map((part, index) => (
          <span key={index} className="flex items-center">
            <ChevronRight size={16} className="mx-1 text-gray-400" />
            <span 
              className="text-blue-600 hover:underline cursor-pointer flex items-center" 
              onClick={() => handleBreadcrumbClick(index)}
            >
              {part}
            </span>
          </span>
        ))}
      </div>
    );
  };

  // Render file icon based on file type
  const renderFileIcon = (item) => {
    if (item.type === 'directory') {
      return <Folder className="h-10 w-10 text-yellow-500" />;
    } else if (item.isVideo) {
      return <Video className="h-10 w-10 text-purple-500" />;
    } else if (item.fileType?.includes('image')) {
      return <Image className="h-10 w-10 text-green-500" />;
    } else {
      return <FileText className="h-10 w-10 text-blue-500" />;
    }
  };

  // Handle item click
  const handleItemClick = (item) => {
    if (item.type === 'directory') {
      const newPath = currentPath === '/' 
        ? `/${item.name}` 
        : `${currentPath}/${item.name}`;
      navigateToDirectory(newPath);
    } else {
      setSelectedItem(item);
    }
  };

  // Handle download click
  const handleDownload = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center ${selectedItem?.id === item.id ? 'bg-blue-50 border-blue-300' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            {item.type === 'file' && item.fileType?.includes('image') ? (
              <div className="w-16 h-16 mb-2 flex items-center justify-center">
                <img 
                  src={item.url} 
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/64/64";
                  }}
                />
              </div>
            ) : item.isVideo ? (
              <div className="w-16 h-16 mb-2 relative">
                <img 
                  src={item.thumbnail || "/api/placeholder/64/64"} 
                  alt={item.name}
                  className="max-h-full max-w-full object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/64/64";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {renderFileIcon(item)}
                {item.type === 'directory' && (
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                )}
              </div>
            )}
            <p className="mt-2 text-sm font-medium text-center truncate w-full" title={item.name}>
              {item.name}
              {item.type === 'directory' && '/'}
            </p>
            {item.metadata?.documentType && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full mt-1">{item.metadata.documentType}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sort === 'name') {
                    setOrder(order === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSort('name');
                    setOrder('asc');
                  }
                }}
              >
                <div className="flex items-center">
                  Name
                  {sort === 'name' && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sort === 'type') {
                    setOrder(order === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSort('type');
                    setOrder('asc');
                  }
                }}
              >
                <div className="flex items-center">
                  Type
                  {sort === 'type' && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sort === 'date') {
                    setOrder(order === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSort('date');
                    setOrder('desc');
                  }
                }}
              >
                <div className="flex items-center">
                  Date
                  {sort === 'date' && (
                    <ArrowUpDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      {renderFileIcon(item)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={item.name}>
                      {item.name}
                      {item.type === 'directory' && '/'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {item.type === 'directory' ? 'Folder' : item.fileType?.split('/')[1] || 'File'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.type === 'directory' ? '-' : formatFileSize(item.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {item.type === 'directory' ? (
                    <div className="flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, '_blank');
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  // Render file preview
  const renderFilePreview = () => {
    if (!selectedItem) return null;

    return (
      <div className="border-l border-gray-200 p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Preview</h3>
          <button 
            onClick={() => setSelectedItem(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-4">
          {selectedItem.isVideo ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                src={selectedItem.url}
                title={selectedItem.name}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          ) : selectedItem.fileType?.includes('image') ? (
            <div className="mb-4 flex justify-center">
              <img 
                src={selectedItem.url} 
                alt={selectedItem.name} 
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
          ) : selectedItem.fileType?.includes('pdf') ? (
            <div className="mb-4 border rounded-lg overflow-hidden">
              <iframe
                src={selectedItem.url}
                title={selectedItem.name}
                className="w-full h-96"
              ></iframe>
            </div>
          ) : (
            <div className="flex justify-center items-center p-8 mb-4">
              {renderFileIcon(selectedItem)}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Name</h4>
            <p className="text-base">{selectedItem.name}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Type</h4>
            <p className="text-base">
              {selectedItem.type === 'directory' 
                ? 'Folder' 
                : (selectedItem.fileType || 'Unknown')}
            </p>
          </div>
          
          {selectedItem.size && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Size</h4>
              <p className="text-base">{formatFileSize(selectedItem.size)}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Created</h4>
            <p className="text-base">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
          </div>
          
          {selectedItem.metadata?.countryCode && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Country</h4>
              <p className="text-base">{selectedItem.country?.name || selectedItem.metadata.countryCode}</p>
            </div>
          )}
          
          {selectedItem.metadata?.documentType && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Document Type</h4>
              <p className="text-base">{selectedItem.metadata.documentType}</p>
            </div>
          )}
          
          <div className="pt-4 flex space-x-2">
            {selectedItem.type === 'directory' ? (
              <button
                onClick={() => handleItemClick(selectedItem)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
              >
                <Folder size={16} className="mr-2" />
                Open Folder
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleDownload(selectedItem)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </button>
                
                <button
                  onClick={() => window.open(selectedItem.url, '_blank')}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Open
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.total <= pagination.limit) return null;
    
    const visiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(visiblePages / 2));
    let endPage = Math.min(pagination.pages, startPage + visiblePages - 1);
    
    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between mt-6 space-x-1">
        <button
          onClick={() => setPagination({ ...pagination, page: 1 })}
          disabled={pagination.page === 1}
          className={`px-3 py-1 rounded ${pagination.page === 1 ? 'text-gray-400 cursor-default' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          First
        </button>
        
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          disabled={pagination.page === 1}
          className={`p-1 rounded ${pagination.page === 1 ? 'text-gray-400 cursor-default' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          <ArrowLeft size={16} />
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => setPagination({ ...pagination, page })}
            className={`px-3 py-1 rounded ${pagination.page === page ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={pagination.page === pagination.pages}
          className={`p-1 rounded ${pagination.page === pagination.pages ? 'text-gray-400 cursor-default' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          <ArrowRight size={16} />
        </button>
        
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.pages })}
          disabled={pagination.page === pagination.pages}
          className={`px-3 py-1 rounded ${pagination.page === pagination.pages ? 'text-gray-400 cursor-default' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          Last
        </button>
        
        <span className="ml-4 text-sm text-gray-600">
          {`${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} items`}
        </span>
      </div>
    );
  };

  // Render filter section
  const renderFilters = () => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex flex-wrap gap-4">
          {/* Search box */}
          <div className="flex-1 min-w-max">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* Type filter */}
          {availableFilters.types?.length > 0 && (
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {availableFilters.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Country filter */}
          {availableFilters.countries?.length > 0 && (
            <div>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {availableFilters.countries.map(country => (
                  <option key={country} value={country}>{getCountryName(country)}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Document type filter */}
          {availableFilters.documentTypes?.length > 0 && (
            <div>
              <select
                value={filters.documentType}
                onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Document Types</option>
                {availableFilters.documentTypes.map(docType => (
                  <option key={docType} value={docType}>{docType}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Clear filters button */}
          {(searchQuery || filters.type || filters.country || filters.documentType) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ type: '', country: '', documentType: '' });
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  };

  // Helper functions
  const getCountryName = (code) => {
    const countries = {
      'ZA': 'South Africa',
      'US': 'United States',
      'GB': 'United Kingdom',
      // Add more as needed
    };
    return countries[code] || code;
  };

  // Play component for video thumbnails
  const Play = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  // Render "Go up" button when not at root
  const renderUpButton = () => {
    if (currentPath === '/') return null;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    const parentPath = pathParts.length > 1 
      ? '/' + pathParts.slice(0, -1).join('/') 
      : '/';
    
    return (
      <button
        onClick={() => navigateToDirectory(parentPath)}
        className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg mb-4 text-sm"
      >
        <ArrowLeft size={16} className="mr-1" />
        Go up
      </button>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">File Explorer</h1>
          
          {renderFilters()}
          
          {renderBreadcrumbs()}
          
          {renderUpButton()}
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${items.length} items in ${currentPath}`}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded ${viewType === 'grid' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded ${viewType === 'list' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
              <p>Loading files...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <div className="inline-block p-3 rounded-full bg-gray-100 mb-2">
                <Folder size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium">No files found</p>
              <p className="text-sm mt-1">This directory is empty or no files match your filters</p>
            </div>
          ) : (
            <div className="flex space-x-4">
              <div className={`${selectedItem ? 'flex-1' : 'w-full'}`}>
                {viewType === 'grid' ? renderGridView() : renderListView()}
              </div>
              
              {selectedItem && renderFilePreview()}
            </div>
          )}
          
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}