import React, { useState } from 'react';
import { Search, BookOpen, FileText, Clock, ArrowRight, Globe, Filter, BookMarked, X } from 'lucide-react';

export default function ConstitutionalArchiveHomepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      // Azure Cognitive Search returns a JSON with @odata.count and a "value" array
      const data = await response.json();
      const hits = (data.value || []).map((doc, idx) => ({
        id: doc.metadata_storage_path || doc.metadata_storage_name || idx,
        name: doc.metadata_storage_name || doc.name || `Document ${idx + 1}`,
        snippet: doc.content ? doc.content.substring(0, 200) + '…' : '',
        url: doc.metadata_storage_path || '#'
      }));

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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-gray-900 text-white py-4">
        <nav className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <BookMarked className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Constitutional Archive</h1>
          </a>
          
          <ul className="hidden md:flex space-x-6">
            <li><a href="/" className="hover:text-blue-300">Home</a></li>
            <li><a href="/browse" className="hover:text-blue-300">Browse Archive</a></li>
            <li><a href="/about" className="hover:text-blue-300">About</a></li>
            <li><a href="/contact" className="hover:text-blue-300">Contact</a></li>
          </ul>
          
          <a href="/admin" className="bg-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
            Admin Login
          </a>
        </nav>
      </header>

      <section className={`py-20 px-6 text-center max-w-4xl mx-auto ${searchResults ? 'pb-8' : ''}`}>
        <h2 className="text-4xl font-bold mb-6">Explore Constitutional History</h2>
        <p className="text-xl text-gray-600 mb-12">
          Search through historical constitutional documents, amendments, court decisions, 
          and scholarly analysis from around the world.
        </p>
        
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
          <label htmlFor="search-input" className="sr-only">Search constitutional documents</label>
          <input 
            id="search-input"
            type="text" 
            placeholder="Search constitutional documents (e.g., 'property rights', 'freedom of speech')"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 pr-24 text-lg rounded-xl border shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch} 
              className="absolute right-20 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-3 top-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </section>
      
      {searchResults && (
        <section className="pb-16 px-6 max-w-4xl mx-auto">
          <article className="bg-white rounded-xl shadow-lg border p-6">
            <header className="mb-6">
              <h2 className="text-xl font-semibold">
                Search results for: <em className="font-normal">"{searchResults.query}"</em>
              </h2>
              <p className="text-gray-600">Found {searchResults.count} relevant documents</p>
            </header>
            
            <ul className="space-y-6">
              {searchResults.results.map(result => (
                <li key={result.id} className="border-b pb-6 last:border-0">
                  <header className="mb-2">
                    <section className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-blue-700 hover:underline">
                        <a href={`/document/${result.id}`}>{result.title}</a>
                      </h3>
                    </section>
                    <ul className="flex text-sm text-gray-500 mt-1 space-x-4">
                      <li>{result.type}</li>
                      <li>{result.country}</li>
                      <li>{result.date}</li>
                    </ul>
                  </header>
                  <p className="text-gray-700">{result.excerpt}</p>
                  <footer className="mt-3 flex">
                    <a href={`/document/${result.id}`} className="text-blue-600 text-sm hover:underline flex items-center">
                      View full document
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </footer>
                </li>
              ))}
            </ul>
            
            <footer className="mt-6 pt-4 border-t flex justify-between items-center">
              <section>
                <button 
                  onClick={clearSearch}
                  className="text-gray-700 border px-4 py-2 rounded hover:bg-gray-50"
                >
                  Clear Results
                </button>
              </section>
            </footer>
          </article>
        </section>
      )}
      
      {!searchResults && (
        <>
          <section className="py-12 bg-blue-50">
            <section className="max-w-6xl mx-auto px-6">
              <h2 className="text-2xl font-bold mb-8 text-center">Featured Collections</h2>
              
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <li className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
                  <figure>
                    <img 
                      src="/api/placeholder/800/400" 
                      alt="Constitutions of Africa" 
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                  <section className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Constitutions of Africa</h3>
                    <p className="text-gray-600 mb-4">
                      Explore constitutional documents from across the African continent, 
                      including post-colonial and modern democratic constitutions.
                    </p>
                    <a href="/collections/africa" className="inline-flex items-center text-blue-600 hover:underline">
                      Browse collection
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </section>
                </li>
                
                <li className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
                  <figure>
                    <img 
                      src="/api/placeholder/800/400" 
                      alt="Landmark Court Decisions" 
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                  <section className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Landmark Court Decisions</h3>
                    <p className="text-gray-600 mb-4">
                      Study significant constitutional court rulings that have shaped 
                      interpretations of rights and governmental powers.
                    </p>
                    <a href="/collections/court-decisions" className="inline-flex items-center text-blue-600 hover:underline">
                      Browse collection
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </section>
                </li>
                
                <li className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
                  <figure>
                    <img 
                      src="/api/placeholder/800/400" 
                      alt="Historical Constitutional Documents" 
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                  <section className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Historical Documents</h3>
                    <p className="text-gray-600 mb-4">
                      Discover foundational texts like the Magna Carta, Declaration of 
                      Rights of Man, and early democratic constitutions.
                    </p>
                    <a href="/collections/historical-documents" className="inline-flex items-center text-blue-600 hover:underline">
                      Browse collection
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </section>
                </li>
              </ul>
            </section>
          </section>
          
          <section className="py-12">
            <section className="max-w-6xl mx-auto px-6">
              <header className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Recently Added Documents</h2>
                <a href="/documents" className="text-blue-600 hover:underline inline-flex items-center">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </header>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <header className="flex items-start mb-2">
                    <FileText className="h-5 w-5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <section>
                      <h3 className="font-medium">Kenya Constitutional Amendments (2023)</h3>
                      <time dateTime="2025-04-02" className="text-sm text-gray-500">Added April 2, 2025</time>
                    </section>
                  </header>
                  <p className="text-gray-600 text-sm">
                    Recent amendments to the Kenyan Constitution focusing on judicial independence 
                    and devolution of powers to regional governments.
                  </p>
                </li>
                
                <li className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <header className="flex items-start mb-2">
                    <FileText className="h-5 w-5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <section>
                      <h3 className="font-medium">Brazilian Supreme Court Decision on Indigenous Rights</h3>
                      <time dateTime="2025-03-29" className="text-sm text-gray-500">Added March 29, 2025</time>
                    </section>
                  </header>
                  <p className="text-gray-600 text-sm">
                    Landmark decision affirming constitutional protections for indigenous land rights 
                    and traditional territories.
                  </p>
                </li>
                
                <li className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <header className="flex items-start mb-2">
                    <FileText className="h-5 w-5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <section>
                      <h3 className="font-medium">Canadian Charter Analysis: 40 Years Later</h3>
                      <time dateTime="2025-03-27" className="text-sm text-gray-500">Added March 27, 2025</time>
                    </section>
                  </header>
                  <p className="text-gray-600 text-sm">
                    Scholarly examination of the impact and evolution of the Canadian Charter of Rights 
                    and Freedoms four decades after its adoption.
                  </p>
                </li>
                
                <li className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <header className="flex items-start mb-2">
                    <FileText className="h-5 w-5 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                    <section>
                      <h3 className="font-medium">European Constitutional Court Comparative Study</h3>
                      <time dateTime="2025-03-25" className="text-sm text-gray-500">Added March 25, 2025</time>
                    </section>
                  </header>
                  <p className="text-gray-600 text-sm">
                    Analysis comparing the structure, powers, and landmark decisions of constitutional 
                    courts across European democracies.
                  </p>
                </li>
              </ul>
            </section>
          </section>
          
          <section className="py-12 bg-gray-50">
            <section className="max-w-6xl mx-auto px-6">
              <h2 className="text-2xl font-bold mb-8 text-center">Browse By Category</h2>
              
              <nav className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/browse?category=region" className="block bg-white rounded-lg p-6 text-center hover:shadow-md transition">
                  <Globe className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium">By Region</h3>
                </a>
                
                <a href="/browse?category=time-period" className="block bg-white rounded-lg p-6 text-center hover:shadow-md transition">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium">By Time Period</h3>
                </a>
                
                <a href="/browse?category=document-type" className="block bg-white rounded-lg p-6 text-center hover:shadow-md transition">
                  <Filter className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium">By Document Type</h3>
                </a>
                
                <a href="/browse?category=subject" className="block bg-white rounded-lg p-6 text-center hover:shadow-md transition">
                  <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium">By Subject</h3>
                </a>
              </nav>
            </section>
          </section>
        </>
      )}
      
      
    </main>
  );
}

