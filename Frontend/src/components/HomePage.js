import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SearchSection } from '../components/SearchSection';
import { SearchResults } from '../components/SearchResults';
import DocumentPreviewShowcase from '../components/DocumentPreview';
import ApiErrorFallback from '../components/ApiErrorFallback';

// Utility function to decode Azure blob paths
const decodeAzureBlobPath = (path) => {
  if (!path) return '';
  try {
    // Extract the blob URL
    const blobPath = path.split('/archives/')[1];
    return blobPath ? `/api/archives/download?path=${encodeURIComponent(blobPath)}` : '';
  } catch (error) {
    console.error('Error decoding path:', error);
    return '';
  }
};

const apiCall = async (endpoint, params = {}) => {
  try {
    const baseUrl = process.env.REACT_APP_API_URL 
      ? `${process.env.REACT_APP_API_URL}/api/${endpoint}`
      : `/api/${endpoint}`;

    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: true, status: response.status, message: errorData?.message || 'Request failed' };
    }

    return await response.json();
  } catch (error) {
    return {
      error: true,
      message: error.message || 'Connection error',
      isNetworkError: error.name === 'AbortError'
    };
  }
};

const getYoutubeThumbnail = (url) => {
  if (!url) return null;
  const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
  return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
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

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const healthCheck = await apiCall('health');
        setApiAvailable(!healthCheck.error);
        setError(healthCheck.error ? 'Service unavailable' : null);
      } catch (err) {
        setApiAvailable(false);
        setError('API connection failed');
      }
    };
    checkApiStatus();
  }, []);

  const generateSnippet = (content, query) => {
    if (!content || !query) return '';
    
    const cleanContent = content || '';
    const queryLower = query.toLowerCase();
    const contentLower = cleanContent.toLowerCase();
    const queryIndex = contentLower.indexOf(queryLower);

    if (queryIndex === -1) {
      const excerpt = cleanContent.split('\n').slice(0, 3).join('\n');
      return excerpt.length < cleanContent.length ? `${excerpt}...` : excerpt;
    }

    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(cleanContent.length, queryIndex + query.length + 150);
    let snippet = cleanContent.substring(start, end);
    
    if (start > 0) snippet = `...${snippet}`;
    if (end < cleanContent.length) snippet += '...';
    
    return snippet.replace(new RegExp(query, 'gi'), (match) => `<mark>${match}</mark>`);
  };

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsFetchingSuggestions(true);
    try {
      const data = await apiCall('suggestions', { q: query });
      if (!data.error && data.suggestions) {
        setSuggestions(data.suggestions.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
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

    setIsSearching(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const [documentData, linksData] = await Promise.all([
        apiCall('search', { q: query }),
        apiCall('archives', { 
          type: 'Link',
          search: query,
          accessLevel: 'public'
        })
      ]);

      // Save to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });

      const processDocument = (doc, index) => ({
        id: doc.metadata_storage_path || `doc-${index}`,
        name: doc.metadata_storage_name || `Document ${index + 1}`,
        snippet: generateSnippet(doc.content, query),
        url: decodeAzureBlobPath(doc.metadata_storage_path),
        type: doc.metadata_content_type || 'text/plain',
        date: new Date(doc.metadata_creation_date || Date.now()),
        sourceType: 'document'
      });

      const processLink = (link) => {
        const isYoutube = link.contentUrl?.includes('youtube.com') || 
                         link.contentUrl?.includes('youtu.be');
        return {
          id: link._id || link.contentUrl || `link-${Math.random()}`,
          name: link.metadata?.title || link.name || 'Untitled Video',
          snippet: link.metadata?.description || '',
          url: link.contentUrl || '',
          type: 'video',
          date: new Date(link.createdAt || Date.now()),
          thumbnail: link.metadata?.thumbnail || (isYoutube ? getYoutubeThumbnail(link.contentUrl) : null),
          sourceType: 'video',
          metadata: link.metadata || {}
        };
      };

      const documents = Array.isArray(documentData.value) ? documentData.value : [];
      const videos = Array.isArray(linksData) ? linksData.filter(link => 
        link.contentUrl && (link.contentUrl.includes('youtube.com') || link.contentUrl.includes('youtu.be'))
      ) : [];

      const allResults = [
        ...documents.map(processDocument),
        ...videos.map(processLink)
      ].sort((a, b) => {
        const aTitleMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.name.toLowerCase().includes(query.toLowerCase());
        return (bTitleMatch - aTitleMatch) || (b.date - a.date);
      });

      setSearchResults({
        query,
        count: allResults.length,
        results: allResults,
        documentCount: documents.length,
        videoCount: videos.length
      });
      
      // Set active tab based on results
      if (allResults.length > 0) {
        setActiveTab(allResults.some(r => r.sourceType === 'document') ? 'documents' : 'videos');
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || 'Search failed');
      setSearchResults({ query, results: [], count: 0, documentCount: 0, videoCount: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  // Load recent searches from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Error loading recent searches:", err);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <section className={`py-20 px-6 text-center max-w-4xl mx-auto ${searchResults ? 'pb-8' : ''}`}>
        <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">
          Explore Constitutional History
        </h2>
        
        {!apiAvailable && (
          <ApiErrorFallback 
            retryAction={() => window.location.reload()}
            message="Search service is currently unavailable"
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
          handleSuggestionClick={(suggestion) => {
            setSearchQuery(suggestion);
            setShowSuggestions(false);
          }}
        />

        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg flex items-center text-red-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {searchResults ? (
        <SearchResults 
          searchResults={searchResults}
          clearSearch={() => {
            setSearchQuery('');
            setSearchResults(null);
          }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <DocumentPreviewShowcase />
      )}

      <Footer />
    </main>
  );
};

export default ConstitutionalArchiveHomepage;