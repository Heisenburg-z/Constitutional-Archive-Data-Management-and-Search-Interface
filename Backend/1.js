import React, { useState, useEffect } from 'react';
import { ArrowLeft, File, Search } from 'lucide-react';
import VideoTab from './VideoTab';

export const SearchResults = ({ searchResults, clearSearch, activeTab, setActiveTab }) => {
  const [videoResults, setVideoResults] = useState(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoError, setVideoError] = useState(null);

  // Fetch video results when search query changes
  useEffect(() => {
    if (searchResults?.query) {
      fetchVideoResults(searchResults.query);
    }
  }, [searchResults?.query]);

  // Function to fetch video results
  const fetchVideoResults = async (query) => {
    setIsLoadingVideos(true);
    setVideoError(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/archives/videos/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Video search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setVideoResults(data);
    } catch (error) {
      console.error('Error fetching video results:', error);
      setVideoError('Failed to load video results');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Count videos
  const videoCount = videoResults?.results?.length || 0;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={clearSearch}
          className="flex items-center text-blue-700 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Home</span>
        </button>
        
        <div className="text-right">
          <h2 className="text-lg font-semibold">
            Results for "{searchResults.query}"
          </h2>
          <p className="text-sm text-gray-500">
            Found {searchResults.count} documents and {videoCount} videos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex items-center">
              <File className="h-4 w-4 mr-2" />
              Documents ({searchResults.count})
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Videos ({videoCount})
            </div>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {searchResults.results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            searchResults.results.map((result) => (
              <div
                key={result.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-blue-700 hover:text-blue-900 transition-colors">
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        {result.name}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(result.date).toLocaleDateString()} • {getFileTypeLabel(result.type)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mb-4 whitespace-pre-wrap font-mono text-sm overflow-hidden text-gray-700">
                  {result.snippet}
                </div>

                <div className="flex justify-end">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Document →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div>
          {isLoadingVideos ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading videos...</p>
            </div>
          ) : videoError ? (
            <div className="text-center py-12 text-red-600">
              <p>{videoError}</p>
            </div>
          ) : (
            <VideoTab 
              searchQuery={searchResults.query}
            />
          )}
        </div>
      )}
    </section>
  );
};

// Helper function to get user-friendly file type labels
function getFileTypeLabel(type) {
  const types = {
    'application/pdf': 'PDF',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'text/plain': 'Text Document',
    'text/html': 'HTML Document',
    'application/json': 'JSON Document',
    'application/video': 'Video'
  };
  
  return types[type] || type || 'Unknown Type';
}