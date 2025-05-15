import React, { useState } from "react";
import { Video, X, Play, AlertTriangle } from "lucide-react";

const VideoCard = ({ video, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Function to get YouTube thumbnail from URL
  const getYoutubeThumbnail = (url) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/api/placeholder/320/180";
  };

  return (
    <div
      className="rounded-xl border relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative group">
        <div className={`relative overflow-hidden ${isHovered ? "ring-4 ring-blue-400" : ""}`}>
          <img
            src={getYoutubeThumbnail(video.contentUrl)}
            alt={video.name}
            className="w-full h-48 object-cover transition-all duration-500 transform group-hover:brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-blue-500 rounded-full p-3 shadow-lg">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-2 text-left">
          <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-600">
            {video.metadata?.title || video.name}
          </h3>
          <p className="text-sm text-gray-500">
            {video.metadata?.author || 'Unknown'} • {
              video.metadata?.publicationDate ? 
              new Date(video.metadata.publicationDate).toLocaleDateString() : 
              new Date(video.createdAt).toLocaleDateString()
            }
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {video.metadata?.keywords?.map((kw, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-300 hover:bg-blue-200"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
        
        {isHovered && (
          <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center transform rotate-12 animate-pulse">
            <Video className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

const VideoModal = ({ video, onClose }) => {
  // Function to extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    }
    return null;
  };

  const videoId = getYoutubeVideoId(video.contentUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/api/placeholder/640/360";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-black w-full" style={{ paddingTop: "56.25%" }}>
          {embedUrl ? (
            <iframe 
              src={embedUrl}
              title={video.metadata?.title || video.name}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={thumbnailUrl} 
                alt={video.metadata?.title || video.name} 
                className="w-full h-full object-contain"
              />
              <Play className="absolute h-16 w-16 text-white opacity-70" />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold">{video.metadata?.title || video.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {video.metadata?.author || 'Unknown'} • {
              video.metadata?.publicationDate ? 
              new Date(video.metadata.publicationDate).toLocaleDateString() : 
              new Date(video.createdAt).toLocaleDateString()
            }
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {video.metadata?.keywords?.map((kw, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function for getting YouTube video ID (used in multiple places)
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    return url.split('v=')[1].split('&')[0];
  }
  return null;
};

const VideoTab = ({ results = [], query = "" }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Filter videos from search results
  const videoResults = results.filter(item => 
    item.type?.toLowerCase() === 'link' || 
    (item.contentUrl && (
      item.contentUrl.includes('youtube.com') || 
      item.contentUrl.includes('youtu.be')
    ))
  );

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center mb-8">
        <div className="inline-block animate-float">
          <Video className="h-16 w-16 mx-auto mb-4 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Video Results: {query}
        </h2>
      </div>

      {videoResults.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoResults.map((video, index) => (
            <VideoCard 
              key={video.id || index} 
              video={video} 
              onClick={() => openVideoModal(video)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No video results found</h3>
          <p className="text-gray-500 max-w-md mt-2">
            We couldn't find any videos matching your search query. Try different keywords or check the Documents tab.
          </p>
        </div>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeVideoModal} />
      )}
    </div>
  );
};

export default VideoTab;