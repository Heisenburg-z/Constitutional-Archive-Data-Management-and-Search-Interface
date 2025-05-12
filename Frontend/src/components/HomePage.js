import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SearchSection } from '../components/SearchSection';
import { SearchResults } from '../components/SearchResults/index'; // Updated import path

import DocumentPreviewShowcase from '../components/DocumentPreview';
import { decodeAzureBlobPath } from '../utils/api';

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

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/suggestions?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
  
      const data = await response.json();
      const hits = (data.value || []).map((doc, idx) => {
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
          date: new Date(doc.metadata_creation_date)
        };
      });
  
      setSearchResults({
        query,
        count: data['@odata.count'] || hits.length,
        results: hits
      });
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch search results. Please try again.');
      setSearchResults(null);
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

        {error && (
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