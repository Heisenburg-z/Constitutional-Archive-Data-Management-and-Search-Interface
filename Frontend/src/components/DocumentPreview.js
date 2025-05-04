import { useState } from "react";
import { BookMarked, ExternalLink, Download, Info, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

// Featured documents data
const featuredDocuments = [
  {
    id: 1,
    title: "Constitution Tenth Amendment Act",
    description: "The Tenth Amendment Act of the South African Constitution addressing key constitutional changes and updates to governance structures.",
    url: "https://ndlovu.blob.core.windows.net/constitutional-archive/South%20Africa/Amendments/Constitution%20Tenth%20Amendment%20Act.pdf",
    category: "Amendments",
    country: "South Africa",
    date: "2023",
    color: "blue",
    previewText: "REPUBLIC OF SOUTH AFRICA\n\nCONSTITUTION TENTH AMENDMENT ACT\n\nTo amend the Constitution of the Republic of South Africa, 1996, so as to...",
  },
  {
    id: 2,
    title: "Chapter 1: Founding Provisions",
    description: "The foundational principles and provisions that establish the Republic of South Africa as a sovereign democratic state.",
    url: "https://ndlovu.blob.core.windows.net/constitutional-archive/South%20Africa/Chapters/Chapter%201-Founding%20Provisions.pdf",
    category: "Chapters",
    country: "South Africa",
    date: "1996",
    color: "green",
    previewText: "CHAPTER 1\nFOUNDING PROVISIONS\n\n1. Republic of South Africa\nThe Republic of South Africa is one, sovereign, democratic state founded on the following values:\n(a) Human dignity, the achievement of equality and the advancement of human rights and freedoms...",
  },
  {
    id: 3,
    title: "Chapter 2: Bill of Rights",
    description: "Comprehensive description of the rights afforded to all citizens under the South African Constitution.",
    url: "https://ndlovu.blob.core.windows.net/constitutional-archive/South%20Africa/Chapters/Chapter%202-Bill%20of%20Rights.pdf",
    category: "Chapters",
    country: "South Africa",
    date: "1996",
    color: "red",
    previewText: "CHAPTER 2\nBILL OF RIGHTS\n\n7. Rights\n(1) This Bill of Rights is a cornerstone of democracy in South Africa. It enshrines the rights of all people in our country and affirms the democratic values of human dignity, equality and freedom...",
  },
  {
    id: 4,
    title: "Schedule 2: Oaths and Solemn Affirmations",
    description: "Official oaths and affirmations for public office holders in South Africa.",
    url: "https://ndlovu.blob.core.windows.net/constitutional-archive/South%20Africa/Chapters/South%20Africa/Schedules/Schedule%202-Oaths%20and%20Solemn%20Affirmations%20.pdf",
    category: "Schedules",
    country: "South Africa",
    date: "1996",
    color: "purple",
    previewText: "SCHEDULE 2\nOATHS AND SOLEMN AFFIRMATIONS\n\n1. Oath or solemn affirmation of President and Acting President\nThe President or Acting President, before the Chief Justice, must swear/affirm as follows...",
  },
  {
    id: 5,
    title: "Schedule 7: Laws Repealed",
    description: "Schedule outlining previous legislation repealed by the Constitution of South Africa.",
    url: "https://ndlovu.blob.core.windows.net/constitutional-archive/South%20Africa/Chapters/South%20Africa/Schedules/Schedule%207-Laws%20Repealed.pdf",
    category: "Schedules",
    country: "South Africa",
    date: "1996",
    color: "amber",
    previewText: "SCHEDULE 7\nLAWS REPEALED\n\nNUMBER AND YEAR OF LAW | TITLE\nAct No. 200 of 1993 | Constitution of the Republic of South Africa, 1993\nAct No. 2 of 1994 | Constitution of the Republic of South Africa Amendment Act, 1994...",
  },
  {
    id: 6,
    title: "Constitution of South Africa",
    description: "The complete Constitution of the Republic of South Africa, adopted in 1996.",
    url: "https://ndlovu.blob.core.windows.net/constitutional-archive/South%20Africa/Constitution%20of%20South%20Africa%201996.pdf",
    category: "Constitution",
    country: "South Africa",
    date: "1996",
    color: "teal",
    previewText: "CONSTITUTION OF THE REPUBLIC OF SOUTH AFRICA, 1996\n\nPREAMBLE\n\nWe, the people of South Africa,\nRecognize the injustices of our past;\nHonour those who suffered for justice and freedom in our land;\nRespect those who have worked to build and develop our country...",
  }
];

// Helper functions for colors
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

export default function DocumentPreviewShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDocument, setModalDocument] = useState(null);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  
  const activeDocument = featuredDocuments[activeIndex];
  const colorClasses = getColorClasses(activeDocument.color);
  
  const nextDocument = () => {
    setActiveIndex((prev) => (prev + 1) % featuredDocuments.length);
  };
  
  const prevDocument = () => {
    setActiveIndex((prev) => (prev - 1 + featuredDocuments.length) % featuredDocuments.length);
  };
  
  const openModal = (doc) => {
    setModalDocument(doc);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const toggleShowAllDocuments = () => {
    setShowAllDocuments(!showAllDocuments);
  };
  
  // Enhanced direct download function using Fetch API
  const downloadDocument = async (doc) => {
  try {
    setDownloadInProgress(true);
    setDownloadSuccess(null);

    // Use your proxy or direct URL
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(doc.url)}`;
    const directUrl = doc.url;

    // Try direct download first
    let response;
    try {
      response = await fetch(directUrl, {
        mode: 'cors',
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Direct download failed');
    } catch (directError) {
      console.log('Trying proxy...');
      response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Proxy download failed');
    }

    const blob = await response.blob();
    if (blob.size === 0) throw new Error('Empty file received');

    const filename = doc.title.replace(/[^a-z0-9]/gi, '_') + '.pdf';
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);

    setDownloadSuccess(true);
  } catch (error) {
    console.error("Download failed:", error);
    setDownloadSuccess(false);
    
    // Ultimate fallback - open in new tab
    window.open(doc.url, '_blank');
  } finally {
    setDownloadInProgress(false);
  }
};
  // Combined download handler
  const handleDownload = (doc) => {
    downloadDocument(doc);
  };
  
  const filteredDocuments = showAllDocuments 
    ? featuredDocuments.filter(doc => 
        searchQuery ? 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      )
    : [];
  
  // Status message for download
  const getDownloadStatusMessage = () => {
    if (downloadInProgress) {
      return "Downloading...";
    } else if (downloadSuccess === true) {
      return "Download successful!";
    } else if (downloadSuccess === false) {
      return "Download failed. Try again.";
    }
    return null;
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-2 text-center">Featured Constitutional Documents</h2>
      <p className="text-center text-gray-600 mb-12">Explore South Africa's key constitutional documents from our archive</p>
      
      {!showAllDocuments ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Preview Section */}
          <div className="lg:col-span-2">
            <div className={`relative h-96 rounded-xl border-2 shadow-lg overflow-hidden ${colorClasses.border}`}>
              {/* Document Preview */}
              <div className={`absolute inset-0 ${colorClasses.bg} p-8 flex flex-col`}>
                {/* Document Title Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses.accent} text-white`}>
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <span className="ml-2 font-bold">{activeDocument.title}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                    {activeDocument.category}
                  </div>
                </div>
                
                {/* Document Content Preview */}
                <div className="flex-1 bg-white rounded-lg p-6 shadow-inner overflow-hidden relative">
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  
                  <div className="pt-4 whitespace-pre-line text-gray-800">
                    {activeDocument.previewText}
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                
                {/* Navigation Buttons */}
                <div className="mt-4 flex justify-between items-center">
                  <button 
                    onClick={prevDocument}
                    className="p-2 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="flex space-x-1">
                    {featuredDocuments.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === activeIndex ? `w-6 ${colorClasses.accent}` : 'bg-gray-300'
                        }`}
                        aria-label={`Go to document ${idx + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextDocument}
                    className="p-2 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Document Info Panel */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border-2 shadow-lg overflow-hidden h-96 ${colorClasses.border}`}>
              <div className={`p-6 ${colorClasses.bg} h-full flex flex-col`}>
                <h3 className={`text-2xl font-bold mb-2 ${colorClasses.text}`}>{activeDocument.title}</h3>
                <div className="flex items-center mb-4">
                  <span className="text-gray-600 text-sm">{activeDocument.country} • {activeDocument.date}</span>
                </div>
                
                <p className="text-gray-700 mb-6">{activeDocument.description}</p>
                
                <div className="mt-auto space-y-3">
                  <a 
                    href={activeDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg ${colorClasses.accent} text-white font-medium transition-transform hover:scale-105`}
                  >
                    <ExternalLink className="h-5 w-5" />
                    View Full Document
                  </a>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(activeDocument)}
                      disabled={downloadInProgress}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors relative ${downloadInProgress ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {downloadInProgress ? (
                        <div className="h-5 w-5 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></div>
                      ) : (
                        <Download className="h-5 w-5" />
                      )}
                      Download
                      
                      {/* Download status message tooltip */}
                      {getDownloadStatusMessage() && (
                        <div className={`absolute -bottom-10 left-0 right-0 text-center text-sm py-1 px-2 rounded ${
                          downloadSuccess === true ? 'bg-green-100 text-green-800' : 
                          downloadSuccess === false ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getDownloadStatusMessage()}
                        </div>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => openModal(activeDocument)}
                      className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Info className="h-5 w-5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // All Documents View
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold">All Documents</h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`rounded-lg border overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg ${getColorClasses(doc.color).border}`}
              >
                <div className={`p-4 ${getColorClasses(doc.color).bg}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(doc.color).badge}`}>
                      {doc.category}
                    </div>
                    <span className="text-xs text-gray-600">{doc.date}</span>
                  </div>
                  <h4 className="font-bold mb-2">{doc.title}</h4>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{doc.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium ${getColorClasses(doc.color).text} hover:underline flex items-center`}
                    >
                      View Document
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={() => openModal(doc)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Browse All Link */}
      <div className="mt-12 text-center">
        <button 
          onClick={toggleShowAllDocuments}
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {showAllDocuments ? (
            <>
              Back to Featured View
              <ChevronLeft className="ml-2 h-5 w-5" />
            </>
          ) : (
            <>
              Browse All Documents
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>
      
      {/* Document Detail Modal */}
      {isModalOpen && modalDocument && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 flex justify-between items-center ${getColorClasses(modalDocument.color).accent} text-white`}>
              <h3 className="text-xl font-bold">{modalDocument.title}</h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(modalDocument.color).badge}`}>
                  {modalDocument.category}
                </span>
                <span className="text-sm text-gray-500">{modalDocument.country} • {modalDocument.date}</span>
              </div>
              
              <p className="text-gray-700 mb-6">{modalDocument.description}</p>
              
              {/* Document Preview */}
              <div className="border rounded-lg p-4 bg-gray-50 mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Document Preview</h4>
                <div className="whitespace-pre-line text-sm text-gray-700 bg-white p-4 rounded border">
                  {modalDocument.previewText}
                </div>
              </div>
              
              {/* Related Information (Sample) */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Related Information</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Part of the South African Constitution framework</li>
                  <li>Referenced in numerous legal precedents</li>
                  <li>Last amended: {modalDocument.date}</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"  
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(modalDocument)}
                  disabled={downloadInProgress}
                  className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center ${downloadInProgress ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {downloadInProgress ? (
                    <div className="h-4 w-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download
                </button>
                <a 
                  href={modalDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-lg text-white ${getColorClasses(modalDocument.color).accent}`}
                >
                  View Document
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden download frame to handle fallback downloads */}
      <iframe 
        id="downloadFrame" 
        style={{ display: 'none' }} 
        title="Download Frame"
      />
    </div>
  );
}