import React from 'react';
import { Search, ArrowRight, X, Loader2, Clock, TrendingUp } from 'lucide-react';

export const SearchSection = ({
  searchQuery,
  handleSearchChange,
  handleSearchSubmit,
  isSearching,
  showSuggestions,
  suggestions,
  isFetchingSuggestions,
  recentSearches,
  handleSuggestionClick,
  setShowSuggestions,        // ← 
  setSearchQuery,            // ← three
  setSuggestions             // ← 
}) => (
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
);