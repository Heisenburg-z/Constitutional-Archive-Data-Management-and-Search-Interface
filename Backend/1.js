{searchResults && (
  <section className="pb-16 px-6 max-w-4xl mx-auto animate-fade-in">
    {/* ... other code ... */}
    <div className="space-y-6">
      {searchResults.results.map((result) => (
        <div key={result.id} className="group relative p-6 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
          <div className="relative">
            <header className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-700 transition-colors">
                <a href={result.url} className="flex items-center">
                  {/* Add the file icon here */}
                  <span className="mr-2">{getFileIcon(result.type)}</span>
                  <BookMarked className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                  {result.name}
                </a>
              </h3>
            </header>
            {/* ... rest of the result item ... */}
          </div>
        </div>
      ))}
    </div>
    {/* ... other code ... */}
  </section>
)}