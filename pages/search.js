// pages/search.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css'; // 引入 Tailwind CSS
import '../styles/globals.css'; // 修改导入路径

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState(q || '');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [memeImage, setMemeImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    if (initialLoad && query) {
      handleSearch(query);
      setInitialLoad(false);
    }
  }, [initialLoad, query, handleSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  }

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleButtonClick = () => {
    handleSearch(query);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-2">
          <h3 className="result-title">📚 参考资料：</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : (
            searchResults.map((result, index) => (
              <div key={index} className="result-item">
                <h4 className="result-title">{result.title}</h4>
                <p className="result-snippet">{result.snippet}</p>
              </div>
            ))
          )}
        </div>
        <div className="w-full md:w-2/4 p-2">
          <div className="result-item mb-4">
            <h3 className="result-title">😲 AI回答</h3>
            {loading ? (
              <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="result-snippet">{aiAnswer}</p>
            )}
          </div>
          <div className="result-item">
            <h3 className="result-title">🍳 烹饪表情包</h3>
            <div className="flex justify-center">
              {loading ? (
                <div className="w-full h-64 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                memeImage && <img src={memeImage} alt="生成的表情包" className="max-w-full h-auto" />
              )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/4 p-2">
          <h2 className="text-2xl font-bold mb-4">Memedog</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="新搜索..."
              className="w-full p-2 border border-gray-300 rounded"
              onChange={handleChange}
              onKeyUp={handleKeyUp}
            />
            <button 
              onClick={handleButtonClick}
              className="mt-2 bg-blue-500 text-white p-2 rounded w-full"
            >
              搜索
            </button>
          </div>
          <Link href="/">
            <a className="block bg-gray-200 text-center p-2 rounded">首页</a>
          </Link>
        </div>
      </div>

      <div className="footer-search-container mt-4 flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder="问一个后续问题"
          className="footer-search-input w-full p-2 border border-gray-300 rounded"
        />
        <button 
          onClick={handleButtonClick} 
          className="footer-search-button rounded-full flex items-center justify-center ml-2" 
          style={{ height: '70px', width: '70px' }}
        >
          <span role="img" aria-label="search-emoji" style={{ fontSize: '48px' }}>😏</span>
        </button>
      </div>
    </div>
  );
}