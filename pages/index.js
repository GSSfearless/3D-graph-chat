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
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left side - Logical Reasoning */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
          <FontAwesomeIcon icon={faBrain} className="text-5xl md:text-8xl text-blue-600 mb-4" />
          <h2 className="text-xl md:text-3xl font-semibold mb-2 md:mb-4 text-blue-800">Logical Reasoning</h2>
          <p className="text-sm md:text-base text-center text-blue-600 mb-4 md:mb-12">Structured thinking and analysis</p>
        </div>

        {/* Right side - Inspiration */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <FontAwesomeIcon icon={faLightbulb} className="text-5xl md:text-8xl text-yellow-500 mb-4" />
          <h2 className="text-xl md:text-3xl font-semibold mb-2 md:mb-4 text-yellow-800">Inspiration</h2>
          <p className="text-sm md:text-base text-center text-yellow-600 mb-4 md:mb-12">Creative ideas and connections</p>
        </div>
      </div>

      {/* Centered search bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg p-4 md:p-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your query..."
            className="flex-1 px-4 py-2 md:py-3 text-sm md:text-base rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full flex items-center gap-2 transition-colors"
          >
            <span className="hidden md:inline">Search</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-sm md:text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

