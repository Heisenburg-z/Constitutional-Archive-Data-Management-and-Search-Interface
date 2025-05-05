import React, { useState } from 'react';
import { Search, ArrowRight, BookMarked, X, Loader2, AlertTriangle,  ExternalLink,Clock,TrendingUp  } from 'lucide-react';
import DocumentPreviewShowcase from './components/DocumentPreview';

// Helper functions for colors (from DocumentPreview)
const getColorClasses = (color) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      hoverBg: "hover:bg-blue-200",
      border: "border-blue-300",
      text: "text-blue-800",
      badge: "bg-blue-200 text-blue-800",
      accent: "bg-blue-600"
    },
    green: {
      bg: "bg-green-100",
      hoverBg: "hover:bg-green-200",
      border: "border-green-300",
      text: "text-green-800",
      badge: "bg-green-200 text-green-800",
      accent: "bg-green-600"
    },
    red: {
      bg: "bg-red-100",
      hoverBg: "hover:bg-red-200",
      border: "border-red-300",
      text: "text-red-800",
      badge: "bg-red-200 text-red-800",
      accent: "bg-red-600"
    },
    purple: {
      bg: "bg-purple-100",
      hoverBg: "hover:bg-purple-200",
      border: "border-purple-300",
      text: "text-purple-800",
      badge: "bg-purple-200 text-purple-800",
      accent: "bg-purple-600"
    },
    amber: {
      bg: "bg-amber-100",
      hoverBg: "hover:bg-amber-200",
      border: "border-amber-300",
      text: "text-amber-800",
      badge: "bg-amber-200 text-amber-800",
      accent: "bg-amber-600"
    },
    teal: {
      bg: "bg-teal-100",
      hoverBg: "hover:bg-teal-200",
      border: "border-teal-300",
      text: "text-teal-800",
      badge: "bg-teal-200 text-teal-800",
      accent: "bg-teal-600"
    },
  };
  return colorMap[color] || colorMap.blue;
};

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Featured collections data
const featuredCollections = [
  {
    id: 1,
    title: "South African Constitution",
    description: "Complete collection of South African constitutional documents and amendments.",
    image: "/images/collections/south-africa.jpg",
    count: 21,
    color: "green"
  },
  {
    id: 2,
    title: "European Constitutional History",
    description: "Historical evolution of European constitutional frameworks and governance.",
    image: "/images/collections/europe.jpg",
    count: 43,
    color: "blue"
  },
  {
    id: 3,
    title: "United States Amendments",
    description: "All amendments to the United States Constitution with annotations.",
    image: "/images/collections/us-amendments.jpg",
    count: 27,
    color: "red"
  }
];

// Recently added documents
const recentDocuments = [
  {
    id: 1,
    title: "Constitution Tenth Amendment Act",
    description: "The Tenth Amendment Act of the South African Constitution addressing key constitutional changes.",
    date: "2023-04-12",
    category: "Amendments",
    color: "blue"
  },
  {
    id: 2,
    title: "European Parliamentary Reform",
    description: "Analysis of recent constitutional reforms affecting the European Parliament.",
    date: "2023-03-28",
    category: "Analysis",
    color: "purple"
  },
  {
    id: 3,
    title: "United States First Amendment Interpretations",
    description: "Historical interpretations of the First Amendment by the Supreme Court.",
    date: "2023-03-15",
    category: "Judicial Review",
    color: "amber"
  },
  {
    id: 4,
    title: "Brazilian Constitutional Framework",
    description: "Overview of the current Brazilian constitutional system and recent amendments.",
    date: "2023-03-01",
    category: "Overview",
    color: "teal"
  }
];

// Category items
const categories = [
  { name: "Constitutions", count: 42, icon: "📜", color: "blue" },
  { name: "Amendments", count: 127, icon: "✏️", color: "green" },
  { name: "Judicial Decisions", count: 89, icon: "⚖️", color: "red" },
  { name: "Historical Analysis", count: 64, icon: "📚", color: "purple" },
  { name: "Comparative Studies", count: 31, icon: "🔍", color: "amber" },
  { name: "Framework Documents", count: 18, icon: "🏛️", color: "teal" },
  { name: "Founding Documents", count: 23, icon: "📝", color: "blue" },
  { name: "International Treaties", count: 56, icon: "🌐", color: "green" }
];


export default function ConstitutionalArchiveHomepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);


const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
const [recentSearches, setRecentSearches] = useState([]);



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
  // Optionally trigger search immediately
  // handleSearchSubmit({ preventDefault: () => {} });
};
const handleSearchChange = (e) => {
  const query = e.target.value;
  setSearchQuery(query);
  fetchSuggestions(query);
  setShowSuggestions(query.length > 0);
};
  const decodeAzureBlobPath = (encodedPath) => {
    if (!encodedPath) return '#';
    
    try {
      // Handle URL-safe base64 (replace - with +, _ with /)
      const base64 = encodedPath.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with '=' if needed
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const decoded = atob(padded);
      return decodeURIComponent(decoded);
    } catch (error) {
      console.error('Failed to decode blob path:', error);
      return '#'; // Fallback URL
    }
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
          // Calculate start/end positions for context
          const start = Math.max(0, queryIndex - 150);
          const end = Math.min(content.length, queryIndex + query.length + 350);
          
          // Extract context window and split into lines
          const context = content.substring(start, end);
          const lines = context.split('\n');
          
          // Find which line contains the search term
          let targetLineIdx = 0;
          let currentPos = 0;
          for (const [idx, line] of lines.entries()) {
            currentPos += line.length + 1; // +1 for newline character
            if (currentPos > (queryIndex - start)) {
              targetLineIdx = idx;
              break;
            }
          }
      
          // Take 2 lines before and 2 after the matched line (total 5 lines)
          const startLine = Math.max(0, targetLineIdx - 2);
          const endLine = Math.min(lines.length, targetLineIdx + 3);
          snippet = lines.slice(startLine, endLine).join('\n');
          
          // Add ellipsis if needed
          if (start > 0) snippet = `…${snippet}`;
          if (end < content.length) snippet += '…';
        } else {
          // Fallback to first 5 lines
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
          date: doc.metadata_creation_date 
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
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-6 shadow-lg">
        <nav className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <BookMarked className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Constitutional Archive</h1>
          </a>
          
          <ul className="hidden md:flex space-x-8">
            <li><a href="/" className="font-medium hover:text-blue-300 transition">Home</a></li>
            <li><a href="/browse" className="font-medium hover:text-blue-300 transition">Browse Archive</a></li>
            <li><a href="/about" className="font-medium hover:text-blue-300 transition">About</a></li>
            <li><a href="/contact" className="font-medium hover:text-blue-300 transition">Contact</a></li>
          </ul>
          
          <a href="/admin" className="bg-blue-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md">
            Admin Login
          </a>
        </nav>
      </header>

      <section className={`py-20 px-6 text-center max-w-4xl mx-auto ${searchResults ? 'pb-8' : ''}`}>
        <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">Explore Constitutional History</h2>
        <p className="text-xl text-gray-600 mb-12">
          Search through historical constitutional documents, amendments, court decisions, 
          and scholarly analysis from around the world.
        </p>
        {/* ===================================================================================================================== */}
        <div className="relative w-full max-w-2xl mx-auto">
  <form onSubmit={handleSearchSubmit}>
    <div className="relative">
      <input
        id="search-input"
        type="text"
        placeholder="Search constitutional documents..."
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="w-full p-4 pl-12 pr-24 text-lg rounded-xl border-2 border-blue-200 shadow-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
        autoComplete="off"
      />
      
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
      
      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setSuggestions([]);
          }}
          className="absolute right-28 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <button
        type="submit"
        disabled={isSearching}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-70 flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        {isSearching ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Searching...</span>
          </>
        ) : (
          <>
            <span>Search</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  </form>

  {/* Suggestions Dropdown */}
  {showSuggestions && (
    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {isFetchingSuggestions ? (
        <div className="p-3 text-center text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
          Loading suggestions...
        </div>
      ) : suggestions.length > 0 ? (
        <>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          ))}
        </>
      ) : searchQuery.length > 0 ? (
        <div className="p-3 text-gray-500">No suggestions found</div>
      ) : (
        <>
          <div className="p-2 text-sm text-gray-500 font-medium">Recent searches</div>
          {recentSearches.map((search, index) => (
            <div
              key={`recent-${index}`}
              className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
              onClick={() => handleSuggestionClick(search)}
            >
              <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span>{search}</span>
            </div>
          ))}
          <div className="p-2 text-sm text-gray-500 font-medium">Popular searches</div>
          {['First Amendment', 'Judicial Review', 'Bill of Rights'].map((search, index) => (
            <div
              key={`popular-${index}`}
              className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
              onClick={() => handleSuggestionClick(search)}
            >
              <TrendingUp className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
              <span>{search}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )}
</div>
        {/* ======================================================================================================================================== */}
        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg flex items-center text-red-700 border border-red-200 shadow-md">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>
      
      {/* Search results styled like the document preview */}
      {searchResults && (
        <section className="pb-16 px-6 max-w-5xl mx-auto animate-fade-in">
          <article className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 overflow-hidden transform transition-all duration-200">
            {/* Search results header with gradient */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Results for: <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-white font-medium">"{searchResults.query}"</span>
                </h2>
                <span className="bg-white text-blue-700 px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  {searchResults.count} result{searchResults.count !== 1 ? 's' : ''}
                </span>
              </div>
            </header>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.results.map((result, index) => {
                  // Assign a color based on file type or cycle through a set of colors
                  const colors = ['blue', 'green', 'red', 'purple', 'amber', 'teal'];
                  const colorIndex = index % colors.length;
                  const color = colors[colorIndex];
                  const colorClasses = getColorClasses(color);
                  
                  // Format date if available
                  const formattedDate = result.date ? new Date(result.date).toLocaleDateString() : '';
                  
                  // Get icon based on file type
                  const getFileIcon = (type) => {
                    if (type && type.includes('pdf')) return '📄';
                    if (type && type.includes('html')) return '🌐';
                    if (type && type.includes('word')) return '📝';
                    return '📁';
                  };
                  
                  // Get file category
                  const getFileCategory = (type, name) => {
                    if (type && type.includes('pdf')) return 'PDF Document';
                    if (type && type.includes('html')) return 'Web Document';
                    if (type && type.includes('word')) return 'Word Document';
                    
                    // Try to guess from name
                    if (name.toLowerCase().includes('amendment')) return 'Amendment';
                    if (name.toLowerCase().includes('chapter')) return 'Chapter';
                    if (name.toLowerCase().includes('schedule')) return 'Schedule';
                    if (name.toLowerCase().includes('constitution')) return 'Constitution';
                    
                    return 'Document';
                  };
                  
                  const category = getFileCategory(result.type, result.name);
                  
                  return (
                    <div 
                      key={result.id}
                      className={`group rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-xl ${colorClasses.border}`}
                    >
                      {/* Document Title Bar */}
                      <div className={`flex items-center justify-between p-4 ${colorClasses.bg}`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses.accent} text-white shadow-md`}>
                            <BookMarked className="h-4 w-4" />
                          </div>
                          <h3 className="ml-2 font-bold truncate">
                            {result.name}
                          </h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge} shadow-sm`}>
                          {category}
                        </div>
                      </div>
                      
                      {/* Document Content Preview */}
                      <div className="bg-white p-5 relative">
                        {/* Preview content with highlighted search terms */}
                        <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed mb-4 max-h-32 overflow-hidden relative">
                          {result.snippet.split(new RegExp(`(${escapeRegExp(searchResults.query)})`, 'gi')).map((part, i) =>
                            i % 2 === 1 ? (
                              <mark key={i} className="bg-yellow-200 px-1 rounded-sm">
                                {part}
                              </mark>
                            ) : (
                              part
                            )
                          )}
                          {/* Gradient overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                        </div>
                        
                        {/* File info and actions footer */}
                        <div className="pt-2 mt-2 border-t flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-2">{getFileIcon(result.type)}</span>
                            {formattedDate && (
                              <span>Last modified: {formattedDate}</span>
                            )}
                          </div>
                          
                          <a
                            href={result.url}
                            className={`inline-flex items-center px-4 py-2 rounded-lg ${colorClasses.accent} text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-md`}
                          >
                            View Document
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
      )}
      
      {!searchResults && (
        <>
          <DocumentPreviewShowcase/>
          
          {/* Featured Collections - Styled like DocumentPreview */}
          <section className="py-16 bg-blue-50">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl font-bold mb-10 text-center">Featured Collections</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredCollections.map((collection) => {
                  const colorClasses = getColorClasses(collection.color);
                  return (
                    <div 
                      key={collection.id} 
                      className={`rounded-xl border-2 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${colorClasses.border}`}
                    >
                      <div className={`h-40 bg-gray-200 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-xl font-bold">{collection.title}</h3>
                          <div className="flex items-center mt-1">
                            <BookMarked className="h-4 w-4 mr-1" />
                            <span className="text-sm">{collection.count} documents</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-5 ${colorClasses.bg}`}>
                        <p className="text-gray-700 mb-4">{collection.description}</p>
                        <a 
                          href={`/collections/${collection.id}`}
                          className={`flex items-center justify-center w-full p-3 rounded-lg ${colorClasses.accent} text-white font-medium transition-transform hover:scale-105 shadow-md`}
                        >
                          Explore Collection
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/* Recently Added Documents - Styled like DocumentPreview */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold">Recently Added Documents</h2>
                <a href="/documents" className="text-blue-600 hover:underline inline-flex items-center font-medium">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentDocuments.map((doc) => {
                  const colorClasses = getColorClasses(doc.color);
                  return (
                    <div 
                      key={doc.id}
                      className={`flex rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden ${colorClasses.border}`}
                    >
                      <div className={`w-16 ${colorClasses.accent} flex items-center justify-center`}>
                        <div className="text-white text-2xl font-bold">
                          {new Date(doc.date).getDate()}
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{doc.title}</h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                            {doc.category}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(doc.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric'
                            })}
                          </span>
                          
                          <a 
                            href={`/documents/${doc.id}`}
                            className={`text-sm font-medium ${colorClasses.text} hover:underline flex items-center`}
                          >
                            View Document
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/* Browse By Category - Styled like DocumentPreview */}
          <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl font-bold mb-10 text-center">Browse By Category</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category, index) => {
                  const colors = ['blue', 'green', 'red', 'purple', 'amber', 'teal'];
                  const colorIndex = index % colors.length;
                  const color = colors[colorIndex];
                  const colorClasses = getColorClasses(color);
                  
                  return (
                    <a 
                      key={category.name} 
                      href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`rounded-xl border-2 p-4 flex flex-col items-center text-center ${colorClasses.border} ${colorClasses.bg} hover:shadow-lg transition-shadow duration-300`}
                    >
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <h3 className="font-bold mb-1">{category.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                        {category.count} documents
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
      
      {/* Footer - Styled consistently with Document Preview aesthetics */}
<footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
  <div className="max-w-6xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 p-2 rounded-lg mr-3">
            <BookMarked className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Constitutional Archive</h2>
        </div>
        <p className="text-sm text-gray-300">
          A comprehensive digital repository of constitutional documents, 
          court decisions, and scholarly analysis from around the world.
        </p>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h2>
        <ul className="space-y-2 text-sm">
          <li><a href="/" className="text-gray-300 hover:text-white transition">Home</a></li>
          <li><a href="/browse" className="text-gray-300 hover:text-white transition">Browse Archive</a></li>
          <li><a href="/search" className="text-gray-300 hover:text-white transition">Search</a></li>
          <li><a href="/about" className="text-gray-300 hover:text-white transition">About</a></li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Resources</h2>
        <ul className="space-y-2 text-sm">
          <li><a href="/api-docs" className="text-gray-300 hover:text-white transition">API Documentation</a></li>
          <li><a href="/usage-guidelines" className="text-gray-300 hover:text-white transition">Usage Guidelines</a></li>
          <li><a href="/privacy-policy" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
          <li><a href="/terms" className="text-gray-300 hover:text-white transition">Terms of Service</a></li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contact</h2>
        <address className="text-sm text-gray-300 not-italic">
          <p>Email: info@constitutionalarchive.org</p>
          <p className="mt-2">Phone: +2 (77) 123-4567</p>
        </address>
        <div className="mt-4 flex space-x-4">
          <a href="https://twitter.com/constitutional-archive" className="bg-blue-800 p-2 rounded-full text-white hover:bg-blue-700 transition">
            <span className="sr-only">Twitter</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="https://github.com/constitutional-archive" className="bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition">
            <span className="sr-only">GitHub</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="https://linkedin.com/company/constitutional-archive" className="bg-blue-700 p-2 rounded-full text-white hover:bg-blue-600 transition">
            <span className="sr-only">LinkedIn</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
    
    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm text-gray-400">
        © {new Date().getFullYear()} Constitutional Archive. All rights reserved.
      </p>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition">Privacy Policy</a>
        <a href="/terms" className="text-sm text-gray-400 hover:text-white transition">Terms of Service</a>
        <a href="/accessibility" className="text-sm text-gray-400 hover:text-white transition">Accessibility</a>
      </div>
    </div>
  </div>
</footer>
</main>
  );
}