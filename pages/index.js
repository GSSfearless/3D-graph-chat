import { faArrowRight, faBrain, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa] relative">
      {/* Left side - Deep Think */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50">
        <FontAwesomeIcon icon={faBrain} className="text-6xl text-blue-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Deep Think</h2>
      </div>

      {/* Right side - Graph Insight */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-yellow-50">
        <FontAwesomeIcon icon={faLightbulb} className="text-6xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-4 text-yellow-800">Graph Insight</h2>
      </div>

      {/* Centered search bar */}
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

      {/* Bottom links */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center space-x-8">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-64">
          <Link href="/we-are-hiring">
            <a className="flex flex-col items-center space-y-2">
              <span className="text-4xl">🪐</span>
              <span className="text-lg font-medium text-gray-800">We are hiring</span>
            </a>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-64">
          <a 
            href="https://discord.gg/G66pESH3gm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-2"
          >
            <span className="text-4xl">🍻</span>
            <span className="text-lg font-medium text-gray-800">Join our Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;

