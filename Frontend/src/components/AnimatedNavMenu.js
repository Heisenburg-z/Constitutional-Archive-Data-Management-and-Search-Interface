import { useState, useEffect } from "react";

export default function AnimatedNavMenu() {
  // Track active link and hover states
  const [activeLink, setActiveLink] = useState("");
  const [hoveredLink, setHoveredLink] = useState("");
  const [isPressed, setIsPressed] = useState("");
  
  // For subtle background animation when idle
  const [time, setTime] = useState(0);
  
  // Update time for ambient animations
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.05);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Set active link based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/") setActiveLink("Home");
    else if (path === "/browse") setActiveLink("Browse Archive");
    else if (path === "/about") setActiveLink("About");
    else if (path === "/contact") setActiveLink("Contact");
  }, []);
  
  const links = [
    { name: "Home", path: "/" },
    { name: "Browse Archive", path: "/browse" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];
  
  return (
    <ul className="hidden md:flex space-x-2 items-center">
      {links.map((link) => {
        const isHovered = hoveredLink === link.name;
        const isActive = activeLink === link.name;
        const isPressedState = isPressed === link.name;
        
        // Calculate ambient animation values based on time
        const hueRotate = Math.sin(time + links.indexOf(link) * 0.5) * 10;
        const pulseScale = 1 + Math.sin(time + links.indexOf(link) * 0.7) * 0.03;
        
        return (
          <li key={link.name} className="relative">
            <a 
              href={link.path}
              className={`
                relative z-10 px-4 py-2 rounded-lg font-medium text-lg
                transition-all duration-300 block
                ${isActive ? 'text-white' : 'text-gray-200'}
                ${isHovered ? 'scale-110' : ''}
                ${isPressedState ? 'scale-95' : ''}
              `}
              style={{
                textShadow: isHovered 
                  ? '0 0 8px rgba(59, 130, 246, 0.8), 0 0 12px rgba(59, 130, 246, 0.4)' 
                  : isActive 
                    ? '0 0 5px rgba(59, 130, 246, 0.6)' 
                    : '0 0 2px rgba(59, 130, 246, 0.3)',
                transform: `scale(${isHovered ? 1.1 : isPressedState ? 0.95 : pulseScale})`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink("")}
              onMouseDown={() => setIsPressed(link.name)}
              onMouseUp={() => setIsPressed("")}
              onTouchStart={() => setIsPressed(link.name)}
              onTouchEnd={() => setIsPressed("")}
            >
              {/* Background glow */}
              <div 
                className={`
                  absolute inset-0 rounded-lg blur-md -z-10
                  transition-all duration-300
                  ${isActive ? 'bg-blue-500 opacity-20' : 'bg-transparent opacity-0'}
                  ${isHovered ? 'bg-blue-400 opacity-25 scale-125' : ''}
                  ${isPressedState ? 'bg-blue-600 opacity-30 scale-90' : ''}
                `}
                style={{
                  filter: `hue-rotate(${hueRotate}deg)`,
                }}
              />
              
              {/* Bottom border/line that slides in */}
              <span 
                className={`
                  absolute left-0 bottom-0 h-0.5 rounded-full
                  bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300
                  transition-all duration-300 ease-out
                  ${isHovered || isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}
                  ${isPressedState ? 'h-1 opacity-80' : ''}
                `}
                style={{
                  filter: `hue-rotate(${isPressedState ? hueRotate + 30 : hueRotate}deg)`,
                  boxShadow: (isHovered || isActive) ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none'
                }}
              />
              
              {/* Text content */}
              {link.name}
              
              {/* Subtle floating particles for hover state */}
              {isHovered && (
                <>
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-300 opacity-70 animate-ping" />
                  <div className="absolute bottom-0 left-1/4 w-1 h-1 rounded-full bg-blue-200 opacity-60 animate-ping" style={{animationDelay: '0.5s'}} />
                  <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-100 opacity-50 animate-ping" style={{animationDelay: '0.3s'}} />
                </>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}