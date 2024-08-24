// pages/search.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css'; // 引入 Tailwind CSS
import '../styles/globals.css'; // 修改了导入路径

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState(q || '');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [memeImage, setMemeImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // 添加这个状态

  const handleSearch = async () => {
    setLoading(true);
    setShowLoading(true);
    try {
      // Fetch search results from /api/rag-search
      const searchResponse = await fetch('/api/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const searchData = await searchResponse.json();
      setSearchResults(searchData);

      // Fetch AI answer from /api/chat
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchData, query }),
      });
      const chatData = await chatResponse.json();
      setAiAnswer(chatData.answer);

      // Generate meme from /api/meme-generator
      const memeResponse = await fetch('/api/meme-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query }),
      });
      const memeBlob = await memeResponse.blob();
      setMemeImage(URL.createObjectURL(memeBlob));
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialLoad && query) {
      handleSearch();
      setInitialLoad(false); // 一旦初次加载完成，将 initialLoad 设置为 false
    }
  }, [initialLoad, query]);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 500); // 0.5秒后隐藏加载动画

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <div className="container">
      {showLoading && (
        <div className="loading-overlay">
          <img src="./public/0.png" alt="Loading." className="loading-img" />
        </div>
      )}
      <div className="column">
        <div className="result-item">
          <h3 className="result-title">😲 Answer:</h3>
          <p className="result-snippet">{aiAnswer}</p>
        </div>
      </div>
      <div className="column column-center">
        <div className="result-item">
          <h3 className="result-title">🍳 Cooking Meme:</h3>
          <div style={{ textAlign: 'center' }}>
            {memeImage && <img src={memeImage} alt="Generated Meme" style={{ maxWidth: '100%', height: 'auto' }} />}
          </div>
        </div>
      </div>
      <div className="column">
        <h3 className="result-title">📚 Reference:</h3>
        {searchResults.map((result, index) => (
          <div key={index} className="result-item">
            <h4 className="result-title">{result.title}</h4>
            <p className="result-snippet">{result.snippet}</p>
          </div>
        ))}
      </div>
      <div className="footer-search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask follow-up question"
          className="footer-search-input"
        />
        <button onClick={handleSearch} className="footer-search-button">
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>
    </div>
  );
}