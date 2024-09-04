// pages/search.js
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
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
      <div className="w-1/4 p-4 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Memedog</h2>
        <div className="mb-4 relative">
          <input 
            type="text" 
            placeholder="Just ask..." 
            className="w-full p-4 border border-gray-300 rounded-lg outline-none text-xl"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-teal-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-teal-600 transition duration-300"
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
        <Link href="/">
          <a className="block bg-gray-200 text-center p-2 rounded hover:bg-gray-300 transition duration-300">Home</a>
        </Link>
      </div>
      <div className="w-1/2 p-4">
        <div className="result-item mb-4">
          <h3 className="result-title">😲 Answer</h3>
          <div className="h-40 bg-white border border-gray-300 rounded p-4">
            {loading ? (
              <div className="h-full bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="result-snippet">{aiAnswer}</p>
            )}
          </div>
        </div>
        <div className="result-item">
          <h3 className="result-title">🍳 Cooking meme...</h3>
          <div className="flex justify-center h-64 bg-white border border-gray-300 rounded p-4">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
            ) : (
              memeImage ? <img src={memeImage} alt="Memedog is out..." className="max-w-full h-auto" /> :
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">Meme will appear here</div>
            )}
          </div>
        </div>
      </div>
      <div className="w-1/4 p-4">
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
              <div key={index} className="result-item bg-white border border-gray-300 rounded p-2">
                <h4 className="result-title">{result.title}</h4>
                <p className="result-snippet">{result.snippet}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center border border-gray-300" style={{ height: '8rem' }}>
          <input 
            type="text" 
            placeholder="What is the ultimate answer to the universe?" 
            className="w-full p-4 border-none outline-none text-xl"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-teal-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4 hover:bg-teal-600 transition duration-300" 
            style={{ top: 'calc(50% - 2rem)' }}
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
}