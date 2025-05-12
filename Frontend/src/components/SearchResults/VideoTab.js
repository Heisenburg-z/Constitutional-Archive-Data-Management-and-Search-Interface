import React, { useState } from "react";
import { Video, X, Play } from "lucide-react";

const mockVideos = [
  {
    title: "South Africa's Bill of Rights Explained",
    url: "https://youtu.be/y-F0z13elCY",
    thumbnail: "https://img.youtube.com/vi/y-F0z13elCY/hqdefault.jpg",
    author: "Legal Resources Centre",
    date: "2021-03-11",
    keywords: ["Bill of Rights", "Human Rights", "South African Constitution"],
  },
  {
    title: "A Brief History of the South African Constitution",
    url: "https://youtu.be/3oDbboQoMaI",
    thumbnail: "https://img.youtube.com/vi/3oDbboQoMaI/hqdefault.jpg",
    author: "SABC Digital News",
    date: "2019-04-27",
    keywords: ["History", "Democracy", "Constitution drafting"],
  },
  {
    title: "Understanding Separation of Powers in South Africa",
    url: "https://youtu.be/qWpjrHdWq98",
    thumbnail: "https://img.youtube.com/vi/qWpjrHdWq98/hqdefault.jpg",
    author: "Parliament RSA",
    date: "2020-10-15",
    keywords: ["Executive", "Legislature", "Judiciary"],
  },
  {
    title: "Inside the South African Constitutional Court",
    url: "https://youtu.be/Go4q0fh2omY",
    thumbnail: "https://img.youtube.com/vi/Go4q0fh2omY/hqdefault.jpg",
    author: "Judges Matter",
    date: "2022-06-20",
    keywords: ["Court", "Justice", "Rule of Law"],
  },
  {
    title: "The Birth of South Africa's Constitution",
    url: "https://youtu.be/aEbo4H_0joE",
    thumbnail: "https://img.youtube.com/vi/aEbo4H_0joE/hqdefault.jpg",
    author: "Constitution Hill",
    date: "2023-01-18",
    keywords: ["Mandela", "Reconciliation", "Democracy"],
  },
];



const VideoCard = ({ video, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

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
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover transition-all duration-500 transform group-hover:brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-blue-500 rounded-full p-3 shadow-lg">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-2 text-left">
          <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-600">{video.title}</h3>
          <p className="text-sm text-gray-500">
            {video.author} • {new Date(video.date).toLocaleDateString()}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {video.keywords.map((kw, i) => (
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
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-black p-4 flex items-center justify-center h-64">
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-16 w-16 text-white opacity-50" />
          </div>
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="max-h-full object-contain"
          />
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold">{video.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {video.author} • {new Date(video.date).toLocaleDateString()}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {video.keywords.map((kw, i) => (
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

const VideoTab = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Educational Videos</h2>
        <p className="text-sm text-gray-500">Explore videos about South Africa's Constitution.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVideos.map((video, index) => (
          <VideoCard 
            key={index} 
            video={video} 
            onClick={() => openVideoModal(video)}
          />
        ))}
      </div>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeVideoModal} />
      )}
    </div>
  );
};

export default VideoTab;
