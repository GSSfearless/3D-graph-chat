import { useState } from 'react';
import '../app/globals.css';
import '../styles/globals.css';

export default function Home() {
  const [query, setQuery] = useState('');

  const handleSearchRedirect = () => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8">Sharing Joy</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="宇宙的终极答案是多少..."
            className="w-full p-4 text-xl rounded-lg border border-gray-300"
            onKeyPress={(e) => e.key === 'Enter' && handleSearchRedirect()}
          />
          <button
            onClick={handleSearchRedirect}
            className="absolute right-2 top-2 bottom-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-xl"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
  );
}