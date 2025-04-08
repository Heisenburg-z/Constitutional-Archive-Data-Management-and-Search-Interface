import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Code, Users, Sparkles } from 'lucide-react';

const Hello = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animation trigger after component mount
    setIsVisible(true);
  }, []);

  const teamMembers = [
    { name: "Bohlale-Mabonga", status: "Collaborator" },
    { name: "Mbalenhle-code", status: "Collaborator" },
    { name: "mivuyolm", status: "Collaborator" },
    { name: "Nhlanhla-star-hue", status: "Collaborator" },
    { name: "Tsiika165", status: "Pending Invite" },
    { name: "Heisenburg-z", status: "Pending Invite" }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white p-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="text-yellow-400 mr-2" size={28} />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Hello World Team
            </h1>
            <Sparkles className="text-yellow-400 ml-2" size={28} />
          </div>
          
          <p className="text-2xl font-light text-cyan-300 mt-2">
            Welcome to <span className="font-bold">SD 2025</span>
          </p>
          
          <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm border border-white border-opacity-20">
            <p className="italic text-gray-300">
              "No divs , No span ~ Lucky ."
            </p>
            <p className="italic text-gray-400/80 tracking-wide shadow-sm shadow-gray-600/20 transition-colors duration-300 hover:text-gray-500 border-l-2 border-gray-500/30 pl-3 animate-fade-in">
  What a boring guy.
</p>
          </div>
        </div>
        
        {/* Team Members Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Users size={24} className="text-purple-400 mr-2" />
            <h2 className="text-2xl font-bold">Team Members</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-purple-500 border-opacity-30 hover:border-opacity-60 transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">{member.name}</h3>
                  <ArrowUpRight size={16} className="text-cyan-400" />
                </div>
                <p className={`text-sm mt-1 ${
                  member.status === "Collaborator" ? "text-green-400" : "text-yellow-400"
                }`}>
                  {member.status}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Code Section */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Code size={20} className="text-cyan-400 mr-2" />
            <h3 className="text-xl font-semibold">Ready to Code</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Your project is set up and ready! Start building something amazing together.
          </p>
          <div className="p-3 bg-black rounded-md text-green-400 font-mono text-sm">
            <p>$ npm start</p>
            <p>Starting development server...</p>
            <p className="text-cyan-300">✓ Ready on http://localhost:3000</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Heisenburg-SA Team Project © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Hello;