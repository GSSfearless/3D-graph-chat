// pages/search.js

import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  const [memeLoading, setMemeLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setMemeLoading(true);
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

      // 自动生成梗图
      const memeResponse = await fetch('/api/meme-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchQuery }),
      });
      if (!memeResponse.ok) {
        throw new Error('Memedog is out...');
      }
      const memeBlob = await memeResponse.blob();
      setMemeImage(URL.createObjectURL(memeBlob));

      // 清除搜索输入
      setQuery('');
    } catch (error) {
      console.error('Error:', error);
      setMemeImage('');
    }
    setLoading(false);
    setMemeLoading(false);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleButtonClick = () => {
    handleSearch(query);
  }

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/6 p-4 bg-gray-300">
        <h2 className="text-2xl font-bold mb-4 text-center">Memedog ❤️</h2>
        <div className="mb-4 relative">
          <input 
            type="text" 
            placeholder="Just ask..." 
            className="w-full p-4 border-2 border-gray-300 rounded-full outline-none text-xl hover:border-gray-400 focus:border-gray-500 transition-all duration-300"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Link href="/">
          <a className="block bg-gray-300 text-center p-2 rounded hover:bg-gray-400 transition duration-300 text-2xl font-medium text-gray-600">🏠 Home</a>
        </Link>
      </div>
      <div className="w-1/2 p-4">
        <div className="result-item mb-4">
          <h3 className="result-title">😲 Answer</h3>
          <div className="min-h-40 p-4">
            {loading ? (
              <div className="h-full bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="result-snippet">{aiAnswer}</p>
            )}
          </div>
        </div>
        <div className="result-item flex flex-col items-center">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🍳</span>
            <h3 className="text-xl font-bold">Cooking Meme</h3>
          </div>
          <div className="flex justify-center w-full h-[calc(100vh-300px)] p-4">
            {memeLoading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
            ) : (
              memeImage ? <img src={memeImage} alt="Memedog is out..." className="w-full h-full object-contain" /> :
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">梗图将在这里显示</div>
            )}
          </div>
        </div>
      </div>
      <div className="w-1/3 p-4 bg-white">
        <h3 className="result-title">📚 Reference</h3>
        <div className="space-y-2">
          {loading ? (
            <>
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
            </>
          ) : (
            searchResults.map((result, index) => (
              <div key={index} className="result-item bg-white p-2 rounded">
                <h4 className="result-title">{result.title}</h4>
                <p className="result-snippet">{result.snippet}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-[calc(50%-50px)] transform -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-white p-2 rounded-lg shadow-md flex items-center border-2 border-gray-300 transition-all duration-300" style={{ height: '4rem' }}>
          <input 
            type="text" 
            placeholder="What is the ultimate answer to the universe?" 
            className="w-full p-2 border-none outline-none text-xl"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-black text-white rounded-full h-10 w-10 flex items-center justify-center absolute right-2 hover:bg-gray-800 transition duration-300" 
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </div>
  );
}