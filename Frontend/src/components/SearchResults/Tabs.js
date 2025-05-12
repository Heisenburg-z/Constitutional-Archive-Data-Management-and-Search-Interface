// components/SearchResults/Tabs.js
import { FileText, Image, Video } from 'lucide-react';

export const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4 mr-2" /> },
    { id: 'images', label: 'Images', icon: <Image className="h-4 w-4 mr-2" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="h-4 w-4 mr-2" /> }
  ];

  return (
    <div className="flex space-x-4 border-b border-blue-500">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`pb-2 px-4 flex items-center text-sm font-medium transition-colors ${
            activeTab === tab.id 
              ? 'text-white border-b-2 border-white'
              : 'text-blue-200 hover:text-blue-100'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};