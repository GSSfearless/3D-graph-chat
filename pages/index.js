import { useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Enjoy the Joy</h1>
        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="宇宙的终极答案是多少..."
          />
          <button onClick={handleSearch}>搜索</button>
        </div>
        <div className="lang-selector">
          <span>Language: </span>
          <select defaultValue="en">
            <option value="en">English (English)</option>
            <option value="zh">中文 (Chinese)</option>
          </select>
        </div>
      </header>
    </div>
  );
}