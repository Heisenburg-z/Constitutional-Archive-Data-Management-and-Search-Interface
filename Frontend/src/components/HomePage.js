import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SearchSection } from '../components/SearchSection';
import { SearchResults } from '../components/SearchResults/index';
import DocumentPreviewShowcase from '../components/DocumentPreview';
import { decodeAzureBlobPath } from '../utils/api';
import ApiErrorFallback from '../components/ApiErrorFallback';

// Create a robust helper function to handle API calls
const apiCall = async (endpoint, params = {}) => {
  try {
    // Use relative path for API calls (works with setupProxy.js)
    const url = new URL(`/api/${endpoint}`, window.location.origin);
    
    // Add query parameters
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );
    
    console.log(`API call to ${endpoint}:`, url.toString());
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      // Add a reasonable timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    // Check for non-JSON responses (like HTML errors)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`API returned non-JSON response for ${endpoint}:`, { 
        status: response.status, 
        contentType, 
        responsePreview: text.substring(0, 150)
      });
      
      // Return a structured error object instead of throwing
      return {
        error: true,
        status: response.status,
        message: `API returned non-JSON response (${response.status}). Check server configuration.`
      };
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: true,
        status: response.status,
        message: errorData.message || `Server error: ${response.status}`
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed (${endpoint}):`, error);
    return {
      error: true,
      message: error.message || 'Unknown API error',
      isNetworkError: error.name === 'AbortError' || error.name === 'TypeError'
    };
  }
};

const ConstitutionalArchiveHomepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [apiAvailable, setApiAvailable] = useState(true);

  // Check API availability on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Attempt to ping a simple endpoint
        const healthCheck = await apiCall('health');
        if (healthCheck.error) {
          console.warn('API health check failed:', healthCheck.message);
          setApiAvailable(false);
          setError('API service is currently unavailable. Some features may not work correctly.');
        } else {
          setApiAvailable(true);
          setError(null);
        }
      } catch (err) {
        console.error('API health check failed:', err);
        setApiAvailable(false);
        setError('API service is currently unavailable. Some features may not work correctly.');
      }
    };

    checkApiStatus();
  }, []);

  // Add a mock search capability for when the API is down
  const performMockSearch = (query) => {
    // This allows users to see the UI and experience the search flow
    // even when the backend API is not available
    return {
      query,
      count: 3,
      results: [
        {
          id: 'mock-doc-1',
          name: 'US Constitution.pdf',
          snippet: `...We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this ${query ? `<mark>${query}</mark>` : 'Constitution'} for the United States of America...`,
          url: '#mock-url-1',
          type: 'application/pdf',
          date: new Date('1787-09-17'),
          sourceType: 'document'
        },
        {
          id: 'mock-doc-2',
          name: 'Federalist Papers.pdf',
          snippet: `...The Federalist Papers are a collection of 85 articles and essays written by Alexander Hamilton, James Madison, and John Jay under the collective pseudonym "Publius" to promote the ratification of the ${query ? `<mark>${query}</mark>` : 'Constitution'}...`,
          url: '#mock-url-2',
          type: 'application/pdf',
          date: new Date('1788-05-28'),
          sourceType: 'document'
        },
        {
          id: 'mock-video-1',
          name: 'Introduction to Constitutional Law',
          snippet: 'A comprehensive overview of constitutional principles and their application in modern governance systems.',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          type: 'video',
          date: new Date('2023-06-15'),
          thumbnail: '/api/placeholder/320/180',
          sourceType: 'video'
        }
      ],
      documentCount: 2,
      videoCount: 1,
      isMockData: true
    };
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsFetchingSuggestions(true);
    
    try {
      if (!apiAvailable) {
        // If API is unavailable, provide mock suggestions
        setSuggestions([
          `${query} in US Constitution`,
          `${query} in Supreme Court cases`,
          `${query} amendments`
        ]);
        return;
      }
      
      // Using our updated apiCall helper function
      const data = await apiCall('suggestions', { q: query });
      if (data.error) {
        console.warn('Error fetching suggestions:', data.message);
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      // Don't set global error for suggestion issues to avoid disrupting the UX
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
    setShowSuggestions(query.length > 0);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
  
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    setIsSearching(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      // If API is unavailable, use mock data
      if (!apiAvailable) {
        setTimeout(() => {
          setSearchResults(performMockSearch(query));
          setIsSearching(false);
          setActiveTab('documents');
        }, 800); // Add a slight delay to simulate network latency
        return;
      }
      
      // Using our updated apiCall helper function for documents
      const documentData = await apiCall('search', { q: query });
      
      if (documentData.error) {
        throw new Error(documentData.message || 'Search failed');
      }
      
      // Get video results
      let videoData = [];
      try {
        const videoResponse = await apiCall('archives', { 
          type: 'Link', 
          search: query 
        });
        
        if (!videoResponse.error) {
          videoData = videoResponse;
        } else {
          console.warn('Failed to fetch video results:', videoResponse.message);
        }
      } catch (videoError) {
        console.warn('Failed to fetch video results:', videoError);
        // Continue with document results even if video search fails
      }
      
      // Process document results
      const docHits = (documentData.value || []).map((doc, idx) => {
        const content = doc.content || '';
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        const queryIndex = contentLower.indexOf(queryLower);
      
        let snippet = '';
        if (queryIndex !== -1) {
          const start = Math.max(0, queryIndex - 150);
          const end = Math.min(content.length, queryIndex + query.length + 350);
          
          const context = content.substring(start, end);
          const lines = context.split('\n');
          
          let targetLineIdx = 0;
          let currentPos = 0;
          for (const [idx, line] of lines.entries()) {
            currentPos += line.length + 1;
            if (currentPos > (queryIndex - start)) {
              targetLineIdx = idx;
              break;
            }
          }
      
          const startLine = Math.max(0, targetLineIdx - 2);
          const endLine = Math.min(lines.length, targetLineIdx + 3);
          snippet = lines.slice(startLine, endLine).join('\n');
          
          if (start > 0) snippet = `…${snippet}`;
          if (end < content.length) snippet += '…';
        } else {
          snippet = content.split('\n').slice(0, 5).join('\n');
          if (content.length > snippet.length) snippet += '…';
        }
      
        const decodedUrl = decodeAzureBlobPath(doc.metadata_storage_path);
        return {
          id: doc.metadata_storage_path || doc.metadata_storage_name || idx,
          name: doc.metadata_storage_name || doc.name || `Document ${idx + 1}`,
          snippet: snippet,
          url: decodedUrl,
          type: doc.metadata_content_type,
          date: new Date(doc.metadata_creation_date),
          sourceType: 'document'
        };
      });
  
      // Process video results
      const videoHits = videoData
        .filter(video => {
          const keywords = video.metadata?.keywords || [];
          const title = (video.metadata?.title || video.name || "").toLowerCase();
          
          const matchesKeywords = keywords.some(keyword => 
            keyword.toLowerCase().includes(query.toLowerCase())
          );
          
          const matchesTitle = title.includes(query.toLowerCase());
          
          return (matchesKeywords || matchesTitle) && 
                 (video.type === 'Link' && (
                   video.contentUrl?.includes('youtube.com') || 
                   video.contentUrl?.includes('youtu.be')
                 ));
        })
        .map(video => ({
          id: video._id || video.contentUrl,
          name: video.metadata?.title || video.name || 'Video',
          snippet: video.metadata?.description || '',
          url: video.contentUrl,
          type: 'video',
          date: new Date(video.createdAt || video.metadata?.date || Date.now()),
          thumbnail: video.metadata?.thumbnail,
          sourceType: 'video'
        }));
      
      // Combine all results and sort by relevance/date
      const allResults = [...docHits, ...videoHits].sort((a, b) => {
        // Prioritize items where the query matches the title
        const aTitleMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.name.toLowerCase().includes(query.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // Then sort by date (newest first)
        return b.date - a.date;
      });
      
      setSearchResults({
        query,
        count: allResults.length,
        results: allResults,
        documentCount: docHits.length,
        videoCount: videoHits.length
      });
      
      // Set active tab based on results
      if (docHits.length === 0 && videoHits.length > 0) {
        setActiveTab('videos');
      } else {
        setActiveTab('documents');
      }
      
    } catch (err) {
      console.error('Search failed:', err);
      setError(`Search failed: ${err.message}. Please check your API configuration and server status.`);
      
      // Even if search fails, show mock results to improve user experience
      setSearchResults(performMockSearch(query));
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
    setActiveTab('documents');
  };

  // Function to retry the API connection
  const retryApiConnection = async () => {
    setError('Checking API connection...');
    
    try {
      const healthCheck = await apiCall('health');
      if (healthCheck.error) {
        setApiAvailable(false);
        setError('API service is still unavailable. Please try again later.');
      } else {
        setApiAvailable(true);
        setError(null);
      }
    } catch (err) {
      setApiAvailable(false);
      setError('API service is still unavailable. Please try again later.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <section className={`py-20 px-6 text-center max-w-4xl mx-auto ${searchResults ? 'pb-8' : ''}`}>
        <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">
          Explore Constitutional History
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Search through historical constitutional documents, amendments, court decisions, 
          and scholarly analysis from around the world.
        </p>

        {!apiAvailable && (
          <ApiErrorFallback 
            retryAction={retryApiConnection}
            message="We're having trouble connecting to our search API. However, you can still explore our archive with limited functionality."
            isHomePageError={true}
          />
        )}

        <SearchSection 
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
          isSearching={isSearching}
          showSuggestions={showSuggestions}
          suggestions={suggestions}
          isFetchingSuggestions={isFetchingSuggestions}
          recentSearches={recentSearches}
          handleSuggestionClick={handleSuggestionClick}
          setSearchQuery={setSearchQuery}
          setSuggestions={setSuggestions}
          setShowSuggestions={setShowSuggestions}
        />

        {error && error !== 'Checking API connection...' && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg flex items-center text-red-700 border border-red-200 shadow-md">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {searchResults ? (
        <SearchResults 
          searchResults={searchResults}
          clearSearch={clearSearch}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <>
          <DocumentPreviewShowcase />
          {/* <FeaturedCollections />
          <RecentDocuments />
          <CategoriesSection /> */}
        </>
      )}

      <Footer />
    </main>
  );
};

export default ConstitutionalArchiveHomepage;