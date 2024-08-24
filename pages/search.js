// pages/search.js
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

  const handleSearch = useCallback(async () => {
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
  }, [query]);

  useEffect(() => {
    if (initialLoad && query) {
      handleSearch();
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

  return (
    <div className="container mx-auto p-4">
      {showLoading && (
        <div className="loading-overlay">
          <Image src="/0.png" alt="Loading." className="loading-img" width={50} height={50} />
        </div>
      )}

      <div className="flex">
        <div className="w-1/4 p-2">
          <div className="result-item">
            <h3 className="result-title">😲 Answer:</h3>
            <p className="result-snippet">{aiAnswer}</p>
          </div>
        </div>
        <div className="w-2/4 p-2">
          <div className="result-item">
            <h3 className="result-title">🍳 Cooking Meme:</h3>
            <div style={{ textAlign: 'center' }}>
              {memeImage && <img src={memeImage} alt="Generated Meme" style={{ maxWidth: '100%', height: 'auto' }} />}
            </div>
          </div>
        </div>
        <div className="w-1/4 p-2">
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask follow-up question"
          className="footer-search-input w-full p-2 border border-gray-300 rounded"
        />
        <button 
          onClick={handleSearch} 
          className="footer-search-button rounded-full flex items-center justify-center bg-teal-500 text-white ml-2" 
          style={{ height: '48px', width: '48px' }} // 将高度和宽度设置相同且更小以确保按钮成为圆形
        >
          <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '24px' }} /> {/* 提高中间箭头图标的大小 */}
        </button>
      </div>
    </div>
  );
}