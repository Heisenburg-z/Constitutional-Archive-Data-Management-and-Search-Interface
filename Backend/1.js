{searchResults && (
  <section className="pb-16 px-6 max-w-5xl mx-auto animate-fade-in">
    <article className="bg-white rounded-xl shadow-2xl border overflow-hidden transform transition-all duration-200">
      {/* Search results header with gradient */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Results for: <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-white font-medium">"{searchResults.query}"</span>
          </h2>
          <span className="bg-white text-blue-700 px-4 py-1 rounded-full text-sm font-bold">
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
            
            // Get color classes using the same function from DocumentPreview
            const colorClasses = {
              blue: {
                bg: "bg-blue-50",
                hoverBg: "hover:bg-blue-100",
                border: "border-blue-200",
                text: "text-blue-800",
                badge: "bg-blue-100 text-blue-700",
                accent: "bg-blue-600"
              },
              green: {
                bg: "bg-green-50",
                hoverBg: "hover:bg-green-100",
                border: "border-green-200",
                text: "text-green-800",
                badge: "bg-green-100 text-green-700",
                accent: "bg-green-600"
              },
              red: {
                bg: "bg-red-50",
                hoverBg: "hover:bg-red-100",
                border: "border-red-200",
                text: "text-red-800",
                badge: "bg-red-100 text-red-700",
                accent: "bg-red-600"
              },
              purple: {
                bg: "bg-purple-50",
                hoverBg: "hover:bg-purple-100",
                border: "border-purple-200",
                text: "text-purple-800",
                badge: "bg-purple-100 text-purple-700",
                accent: "bg-purple-600"
              },
              amber: {
                bg: "bg-amber-50",
                hoverBg: "hover:bg-amber-100",
                border: "border-amber-200",
                text: "text-amber-800",
                badge: "bg-amber-100 text-amber-700",
                accent: "bg-amber-600"
              },
              teal: {
                bg: "bg-teal-50",
                hoverBg: "hover:bg-teal-100",
                border: "border-teal-200",
                text: "text-teal-800",
                badge: "bg-teal-100 text-teal-700",
                accent: "bg-teal-600"
              }
            }[color];

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
                className={`group rounded-xl overflow-hidden border transition-all duration-300 shadow-md hover:shadow-xl ${colorClasses.border}`}
              >
                {/* Document Title Bar */}
                <div className={`flex items-center justify-between p-4 ${colorClasses.bg}`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses.accent} text-white`}>
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <h3 className="ml-2 font-bold truncate">
                      {result.name}
                    </h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
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
                      className={`inline-flex items-center px-4 py-2 rounded-lg ${colorClasses.accent} text-white hover:opacity-90 transition-opacity text-sm font-medium`}
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
      
      <div className="border-t p-6 bg-gray-50 flex justify-center">
        <button
          onClick={clearSearch}
          className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors flex items-center"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Results
        </button>
      </div>
    </article>
  </section>
)}