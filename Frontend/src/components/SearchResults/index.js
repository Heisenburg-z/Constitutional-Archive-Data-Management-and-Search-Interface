// components/SearchResults/index.js
import { Tabs } from './Tabs';
import { DocumentTab } from './DocumentTab';
import { ImageTab } from './ImageTab';
import  VideoTab  from './VideoTab';
import { X, Search } from 'lucide-react';

export const SearchResults = ({ 
  searchResults, 
  clearSearch,
  activeTab, 
  setActiveTab 
}) => (
  <section className="pb-16 px-6 max-w-5xl mx-auto animate-fade-in">
    <article className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 overflow-hidden transform transition-all duration-200">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Results for: <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-white font-medium">"{searchResults.query}"</span>
            </h2>
            <span className="bg-white text-blue-700 px-4 py-1 rounded-full text-sm font-bold shadow-md">
              {searchResults.count} result{searchResults.count !== 1 ? 's' : ''}
            </span>
          </div>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </header>

      <div className="p-6">
        {activeTab === 'documents' && <DocumentTab results={searchResults.results} query={searchResults.query} />}
        {activeTab === 'images' && <ImageTab />}
        {activeTab === 'videos' && <VideoTab />}
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