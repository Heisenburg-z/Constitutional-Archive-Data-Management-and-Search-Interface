import React, { useState, useEffect } from 'react';
import { Search, Mail,  Menu, User, FileText, LogOut } from 'lucide-react';

const DashboardHeader = ({ userProfile, setCurrentView }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [greeting, setGreeting] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) newGreeting = 'Good morning';
    else if (hour < 18) newGreeting = 'Good afternoon';
    else newGreeting = 'Good evening';
    
    setGreeting(newGreeting);
    
    // Animate greeting in after component mounts
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);



  // Handle menu toggle
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Format user's name for display
  const displayName = userProfile ? 
    `${userProfile.firstName} ${userProfile.lastName}` : 
    'Admin';
    
  return (
    <header className="mb-8 relative z-10">
      {/* Top notification bar with sliding animation */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1 px-4 text-sm flex justify-between items-center mb-4 rounded-lg transform transition-all duration-300 hover:shadow-md">
        <div className="flex items-center overflow-hidden">
          <span className="inline-block animate-pulse bg-white bg-opacity-20 rounded-full h-2 w-2 mr-2"></span>
          <p className="whitespace-nowrap animate-[slideIn_15s_linear_infinite]">
            New features available! Check out the document comparison tool and AI summaries.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {/* Left section - Logo and greeting */}
        <div className="flex items-center">
          <div className="mr-6 relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-12 w-12 rounded-xl flex items-center justify-center shadow-md transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
              <FileText className="text-white" size={24} />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping"></span>
          </div>
          
          <div>
            <div className="overflow-hidden h-9">
              <h1 className={`text-2xl font-bold text-gray-900 flex items-center transform transition-all duration-500 ${showGreeting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                Document Dashboard
                <span className="ml-2 inline-flex h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
              </h1>
            </div>
            
            <div className="overflow-hidden h-6">
              <p className={`text-gray-600 transform transition-all duration-500 delay-300 ${showGreeting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <span className="font-medium">{greeting}</span>, {displayName}
              </p>
            </div>

            {userProfile && (
              <div className="mt-1 flex items-center text-sm text-gray-600 overflow-hidden h-5">
                <div className={`flex items-center transform transition-all duration-500 delay-500 ${showGreeting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                  <Mail className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="hover:text-blue-600 cursor-pointer transition-colors">
                    {userProfile.email}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right section - Actions */}
        <div className="flex items-center gap-3">

          
          {/* Browse all documents button */}
          <button 
            onClick={() => setCurrentView('all')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-md transform hover:translate-y-px"
          >
            <Search size={16} className="transition-all duration-300 group-hover:scale-110" />
            <span>Browse All Documents</span>
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button 
              onClick={handleMenuToggle}
              className="flex items-center gap-2 rounded-full overflow-hidden hover:bg-gray-100 p-1 transition-all duration-300"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                {userProfile?.firstName?.charAt(0) || 'A'}
              </div>
              <Menu size={16} className={`text-gray-600 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-20 animate-fadeIn">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  Signed in as <span className="font-medium">{displayName}</span>
                </div>
                <a href="#profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <User size={16} className="mr-2" />
                  Your Profile
                </a>
                <a href="#settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <FileText size={16} className="mr-2" />
                  Documents
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <a href="#logout" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add a custom style for the sliding animation */}
      <style jsx>{`
        @keyframes slideIn {
          0% { transform: translateX(0); }
          10% { transform: translateX(0); }
          90% { transform: translateX(-50%); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default DashboardHeader;