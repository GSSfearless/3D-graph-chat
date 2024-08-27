// pages/search.js
import debounce from 'lodash.debounce';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
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

  const handleSearch = useCallback(debounce(async (searchQuery) => {
    setLoading(true);
    setShowLoading(true);
    try {
      // Fetch search results from /api/rag-search
      const searchResponse = await fetch('/api/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const searchData = await searchResponse.json();
      setSearchResults(searchData);

      // Fetch AI answer from /api/chat
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchData, query: searchQuery }),
      });
      const chatData = await chatResponse.json();
      setAiAnswer(chatData.answer);

      // Generate meme from /api/meme-generator
      const memeResponse = await fetch('/api/meme-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchQuery }),
      });
      const memeBlob = await memeResponse.blob();
      setMemeImage(URL.createObjectURL(memeBlob));

    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, 300), []);

  useEffect(() => {
    if (initialLoad && query) {
      handleSearch(query);
      setInitialLoad(false); // 一旦初次加载完成，将 initialLoad 设置为 false
    }
  }, [initialLoad, query, handleSearch]);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 500); // 0.5秒后隐藏加载动画

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 1) {
      handleSearch(value);
    }
  }

  return (
    <div className="container mx-auto p-4">
      {showLoading && (
        <div className="loading-overlay">
          <Image src="/0.png" alt="Loading." className="loading-img" width={500} height={656} />
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-2">
          <div className="result-item">
            <h3 className="result-title">😲 Answer</h3>
            <p className="result-snippet">{aiAnswer}</p>
          </div>
        </div>
        <div className="w-full md:w-2/4 p-2">
          <div className="result-item">
            <h3 className="result-title">🍳 Cooking Meme</h3>
            <div className="flex justify-center">
              {memeImage && <img src={memeImage} alt="Generated Meme" className="max-w-full h-auto" />}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/4 p-2">
          <h3 className="result-title">📚 Reference:</h3>
          {searchResults.map((result, index) => (
            <div key={index} className="result-item">
              <h4 className="result-title">{result.title}</h4>
              <p className="result-snippet">{result.snippet}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-search-container mt-4 flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Ask follow-up question"
          className="footer-search-input w-full p-2 border border-gray-300 rounded"
        />
        <button 
          onClick={() => handleSearch(query)} 
          className="footer-search-button rounded-full flex items-center justify-center ml-2" 
          style={{ height: '70px', width: '70px' }} // 放大按钮尺寸
        >
          <span role="img" aria-label="search-emoji" style={{ fontSize: '48px' }}>😏</span> {/* 增大 emoji 尺寸 */}
        </button>
      </div>
    </div>
  );
}