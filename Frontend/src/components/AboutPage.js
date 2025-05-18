
import React, { useState, useEffect } from 'react';
import { Globe, Archive, ShieldCheck, Code2, Cloud, Bot, Github, Database } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Framework logos component with animation
const FrameworkLogo = ({ name, icon, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`transition-all duration-500 transform ${isHovered ? 'scale-110' : 'scale-100'} 
      bg-white p-3 rounded-full shadow-lg flex flex-col items-center justify-center`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`p-3 rounded-full ${isHovered ? 'animate-pulse' : ''}`} style={{ color }}>
        {icon}
      </div>
      <span className={`mt-2 font-medium transition-all ${isHovered ? 'text-blue-600' : 'text-gray-700'}`}>
        {name}
      </span>
    </div>
  );
};

// Feature card with hover animation
const FeatureCard = ({ icon, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`transition-all duration-300 p-5 rounded-xl ${isHovered ? 'bg-blue-50 shadow-xl translate-y-[-5px]' : 'bg-white shadow-md'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`p-3 rounded-lg transition-all duration-300 ${isHovered ? 'bg-white' : 'bg-blue-50'}`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-800 mt-4 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const AboutPage = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);
  
  const features = [
    {
      icon: <Archive size={40} className="text-blue-600" />,
      title: "Digital Archiving",
      description: "Preserving constitutional documents with metadata-rich hierarchical organization using Access to Memory standards."
    },
    {
      icon: <ShieldCheck size={40} className="text-green-600" />,
      title: "Secure Management",
      description: "Role-based access control and Azure AD authentication for authorized archivists."
    },
    {
      icon: <Globe size={40} className="text-purple-600" />,
      title: "Global Access",
      description: "Multilingual search interface with NLP-powered queries for researchers worldwide."
    },
    {
      icon: <Code2 size={40} className="text-orange-600" />,
      title: "Modern Stack",
      description: "Built with React, JavaScript, and AWS services following GitHub Actions CI/CD best practices."
    }
  ];
  
  const frameworks = [
    { name: "React", icon: <Code2 size={32} />, color: "#61DAFB" },
    { name: "JavaScript", icon: <Code2 size={32} />, color: "#F7DF1E" },
    { name: "MongoDB", icon: <Database size={32} />, color: "#4DB33D" },
    { name: "Azure", icon: <Cloud size={32} />, color: "#0078D4" },
    { name: "GitHub", icon: <Github size={32} />, color: "#181717" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 text-white">
      <Header />
      
      <div className={`transition-all duration-1000 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 animate-pulse">
              About the Constitutional Archive
            </h1>
            <p className="text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Preserving democratic foundations through innovative digital archiving
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-24">
            <div className={`space-y-6 transition-all duration-1000 delay-300 transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="text-4xl font-bold text-white">Our Mission</h2>
              <p className="text-blue-100 leading-relaxed text-lg">
                We're building a living repository of constitutional history, combining archival best practices
                with cutting-edge technology. Our platform enables:
              </p>
              <ul className="space-y-6 text-blue-100 text-lg">
                <li className="flex items-start group">
                  <Cloud className="w-8 h-8 mr-4 text-blue-300 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
                  <span className="group-hover:text-white transition-colors duration-300">Secure cloud preservation of historical documents</span>
                </li>
                <li className="flex items-start group">
                  <Bot className="w-8 h-8 mr-4 text-blue-300 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
                  <span className="group-hover:text-white transition-colors duration-300">AI-powered discovery of legal precedents</span>
                </li>
                <li className="flex items-start group">
                  <Code2 className="w-8 h-8 mr-4 text-blue-300 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
                  <span className="group-hover:text-white transition-colors duration-300">Open API access for academic research</span>
                </li>
              </ul>
            </div>

            <div className={`bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 transition-all duration-1000 delay-500 transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <h3 className="text-3xl font-bold mb-8 text-white">Key Features</h3>
              <div className="grid grid-cols-1 gap-6">
                {features.map((feature, index) => (
                  <FeatureCard 
                    key={index} 
                    icon={feature.icon} 
                    title={feature.title} 
                    description={feature.description} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 p-12 rounded-2xl mb-16 transition-all duration-1000 delay-700 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600 opacity-20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBhNiA2IDAgMTAtMTIgMCA2IDYgMCAwMDEyIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8">Updated Technical Architecture</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {frameworks.map((framework, index) => (
                  <FrameworkLogo 
                    key={index}
                    name={framework.name}
                    icon={framework.icon}
                    color={framework.color}
                  />
                ))}
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="space-y-3 bg-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold flex items-center">
                    <span className="mr-2">Frontend</span>
                    <Code2 className="w-5 h-5 text-blue-300" />
                  </h3>
                  <ul className="text-blue-100 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      React + JavaScript
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      Tailwind CSS
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      Azure Static Web Apps
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 bg-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold flex items-center">
                    <span className="mr-2">Backend</span>
                    <Database className="w-5 h-5 text-blue-300" />
                  </h3>
                  <ul className="text-blue-100 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      Node.js/Express
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      Azure Cognitive Search
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      MongoDB
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 bg-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold flex items-center">
                    <span className="mr-2">Operations</span>
                    <Github className="w-5 h-5 text-blue-300" />
                  </h3>
                  <ul className="text-blue-100 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      GitHub Actions CI/CD
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      Jest/Testing Library
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                      OWASP Security
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={`text-center py-12 transition-all duration-1000 delay-900 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">Open Governance</h2>
            <p className="text-blue-100 max-w-3xl mx-auto leading-relaxed text-lg">
              Developed through academic collaboration, our platform follows open-access principles
              while maintaining document integrity. The API and interface are designed for
              future expansion, including chatbot integration and international law comparisons.
            </p>
            
            <button className="mt-8 px-8 py-3 bg-white text-blue-800 font-bold rounded-full hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              Get Involved
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default AboutPage;