import { faArrowRight, faBrain, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

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
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* 主要内容区域 */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left side - Logical Reasoning */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50">
          <FontAwesomeIcon icon={faBrain} className="text-6xl text-blue-600 mb-4" />
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Logical Reasoning</h2>
          <p className="text-center text-blue-600 mb-8">Structured thinking and analysis</p>
        </div>

        {/* Right side - Inspiration */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-yellow-50">
          <FontAwesomeIcon icon={faLightbulb} className="text-6xl text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-4 text-yellow-800">Inspiration</h2>
          <p className="text-center text-yellow-600 mb-8">Creative ideas and connections</p>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
        <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800">
          Unleash Your Mind's Potential
        </h1>
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4 flex items-center border border-gray-300 transition-all duration-300">
          <input 
            type="text" 
            placeholder="Explore your thoughts..." 
            className="w-full p-4 border-none outline-none text-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-8 hover:from-blue-600 hover:to-yellow-600 transition duration-300" 
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* 底部招聘和Discord区域 */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 mt-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 招聘信息 */}
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-2">🪐</span>
              We are hiring
            </h3>
            <p className="text-gray-600 mb-4">
              Join our team and help us build the future of knowledge exploration.
            </p>
            <a 
              href="/we-are-hiring"
              className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors"
            >
              View Opportunities
            </a>
          </div>

          {/* Discord社区 */}
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-2">🍻</span>
              Join our Discord
            </h3>
            <p className="text-gray-600 mb-4">
              Connect with like-minded individuals and be part of our growing community.
            </p>
            <a 
              href="https://discord.gg/G66pESH3gm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

