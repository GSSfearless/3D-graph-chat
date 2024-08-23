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
    <div className="search-container">
      <div className="text-center search-inner">
        <h1 className="search-title">Sharing Joy</h1>
        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="宇宙的终极答案是多少..."
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearchRedirect()}
          />
          <button
            onClick={handleSearchRedirect}
            className="search-button"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
  );
}