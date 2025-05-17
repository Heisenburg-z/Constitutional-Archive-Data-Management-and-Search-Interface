import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Tabs } from './Tabs';
import { DocumentTab } from './DocumentTab';
import { ImageTab } from './ImageTab';
import VideoTab from './VideoTab';

export const SearchResults = ({ 
  searchResults, 
  clearSearch,
  activeTab, 
  setActiveTab 
}) => {
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
    <section className="pb-16 px-6 max-w-5xl mx-auto animate-fade-in">
      <article className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 overflow-hidden transform transition-all duration-200">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Results for: <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-white font-medium">"{searchResults.query}"</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="bg-white text-blue-700 px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  {searchResults.count} document{searchResults.count !== 1 ? 's' : ''}
                </span>
                <span className="bg-white text-blue-700 px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  {videoCount} video{videoCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'documents' && <DocumentTab results={searchResults.results} query={searchResults.query} />}
          {activeTab === 'images' && <ImageTab />}
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
                  videoResults={videoResults}
                />
              )}
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-blue-50 flex justify-center">
          <button
            onClick={clearSearch}
            className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors flex items-center shadow-md"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Results
          </button>
        </div>
      </article>
    </section>
  );
};
