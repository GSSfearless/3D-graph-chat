import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      router.push(`/search?q=${query}&side=both`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl transform -rotate-12 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-32 relative">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-6 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600 font-medium">🎉 Welcome to Think Graph</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text leading-tight">
            Redefining Knowledge<br />Management with AI
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect scattered knowledge into comprehensive networks.<br />
            Visualize your thinking, learn more effectively.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className={`max-w-2xl mx-auto relative group transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-purple-200/50 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity rounded-full"></div>
          <div className="relative flex items-center bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.05)] group-hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter any topic to start your knowledge exploration..."
              className="w-full px-8 py-5 text-lg rounded-full bg-transparent border-2 border-transparent focus:border-blue-100 focus:ring-2 focus:ring-blue-50 transition-all outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all transform hover:translate-x-1 hover:shadow-lg group"
            >
              <span className="hidden md:inline font-medium">Explore</span>
              <FontAwesomeIcon icon={faSearch} className="text-lg transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`flex justify-center gap-8 mt-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">100,000+</div>
            <div className="text-gray-600">Knowledge Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">50,000+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1,000,000+</div>
            <div className="text-gray-600">Knowledge Connections</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
          Why Choose Think Graph
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI-Powered Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Powerful AI engine automatically analyzes content, extracts key concepts, and builds knowledge connections.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Real-time Visualization</h3>
            <p className="text-gray-600 leading-relaxed">
              Intuitive knowledge graph display with real-time interaction helps you quickly understand complex knowledge systems.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faMagicWandSparkles} className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Smart Recommendations</h3>
            <p className="text-gray-600 leading-relaxed">
              Get intelligent suggestions based on your learning history and interests to expand your knowledge boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              Start Your Knowledge Journey
            </h2>
            <p className="text-xl mb-12 opacity-90">
              Join thousands of learners who are already using Think Graph to redefine their learning experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faRocket} />
                Start Now
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                Watch Demo
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

