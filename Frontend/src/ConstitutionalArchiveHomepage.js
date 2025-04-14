import React, { useState } from 'react';
import { Search, BookOpen, FileText, Clock, ArrowRight, Globe, Filter, BookMarked, X } from 'lucide-react';

export default function ConstitutionalArchiveHomepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search submission mimi
    console.log('Search submitted:', searchQuery);
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
          <div className="bg-white rounded-xl shadow-lg border p-6">
            <header className="mb-6">
              <h2 className="text-xl font-semibold">
                Search results for: <span className="italic font-normal">"{searchResults.query}"</span>
              </h2>
              <p className="text-gray-600">Found {searchResults.count} relevant documents</p>
            </header>
            
            <div className="space-y-6">
              {searchResults.results.map(result => (
                <article key={result.id} className="border-b pb-6 last:border-0">
                  <header className="mb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-blue-700 hover:underline">
                        <a href={`/document/${result.id}`}>{result.title}</a>
                      </h3>
                    </div>
                    <div className="flex text-sm text-gray-500 mt-1 space-x-4">
                      <span>{result.type}</span>
                      <span>{result.country}</span>
                      <span>{result.date}</span>
                    </div>
                  </header>
                  <p className="text-gray-700">{result.excerpt}</p>
                  <footer className="mt-3 flex">
                    <a href={`/document/${result.id}`} className="text-blue-600 text-sm hover:underline flex items-center">
                      View full document
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </footer>
                </article>
              ))}
            </div>
            
            <footer className="mt-6 pt-4 border-t flex justify-between items-center">
              <div>
                <button 
                  onClick={clearSearch}
                  className="text-gray-700 border px-4 py-2 rounded hover:bg-gray-50"
                >
                  Clear Results
                </button>
              </div>
            </footer>
          </div>
        </section>
      )}
      
      {!searchResults && (
        <>
          <section className="py-12 bg-blue-50">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-2xl font-bold mb-8 text-center">Featured Collections</h2>
              
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <article className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
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
                </article>
                
                <article className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
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
                </article>
                
                <article className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
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
                </article>
              </section>
            </div>
          </section>
          
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-6">
              <header className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Recently Added Documents</h2>
                <a href="/documents" className="text-blue-600 hover:underline inline-flex items-center">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </header>
              
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="border rounded-lg p-4 hover:bg-gray-50 transition">
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
                </article>
                
                <article className="border rounded-lg p-4 hover:bg-gray-50 transition">
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
                </article>
                
                <article className="border rounded-lg p-4 hover:bg-gray-50 transition">
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
                </article>
                
                <article className="border rounded-lg p-4 hover:bg-gray-50 transition">
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
                </article>
              </section>
            </div>
          </section>
          
          <section className="py-12 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
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
            </div>
          </section>
        </>
      )}
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">Constitutional Archive</h2>
              <p className="text-sm text-gray-400">
                A comprehensive digital repository of constitutional documents, 
                court decisions, and scholarly analysis from around the world.
              </p>
            </section>
            
            <nav>
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/browse" className="hover:text-white">Browse Archive</a></li>
                <li><a href="/search" className="hover:text-white">Search</a></li>
                <li><a href="/about" className="hover:text-white">About</a></li>
              </ul>
            </nav>
            
            <nav>
              <h2 className="text-lg font-semibold mb-4">Resources</h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/api-docs" className="hover:text-white">API Documentation</a></li>
                <li><a href="/usage-guidelines" className="hover:text-white">Usage Guidelines</a></li>
                <li><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </nav>
            
            <section>
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <address className="text-sm text-gray-400 not-italic">
                <p>Email: info@constitutionalarchive.org</p>
                <p className="mt-2">Phone: +1 (555) 123-4567</p>
              </address>
              <nav className="mt-4 flex space-x-4">
                <a href="https://twitter.com/constitutional-archive" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://github.com/constitutional-archive" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/constitutional-archive" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </section>
          </section>
          
          <section className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-400 text-center">
            <p>&copy; 2025 Constitutional Archive. All rights reserved.</p>
          </section>
        </div>
      </footer>
    </main>
  );
}