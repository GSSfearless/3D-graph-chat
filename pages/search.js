import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../app/globals.css';
import '../styles/globals.css';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState(q || '');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [memeImage, setMemeImage] = useState('');

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (searchQuery) => {
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
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-4">
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 w-full max-w-2xl flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入搜索内容"
            className="input input-bordered flex-grow p-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          />
          <button onClick={() => handleSearch(query)} className="btn btn-primary p-2 bg-blue-500 text-white rounded-lg">搜索</button>
        </div>
      </header>
      <main className="flex space-x-4">
        <section className="w-full sm:w-7/12">
          <div className="mb-4 p-4 border rounded-lg bg-gray-100">
            <h2 className="text-2xl font-bold mb-2">AI 回答：</h2>
            <p>{aiAnswer}</p>
          </div>
          <div className="mb-4 p-4 border rounded-lg bg-gray-100">
            <h2 className="text-2xl font-bold mb-2">生成的模因图：</h2>
            {memeImage && <img src={memeImage} alt="Generated Meme" className="rounded shadow max-w-full h-auto" />}
          </div>
        </section>
        <section className="w-full sm:w-5/12">
          <h2 className="text-2xl font-bold mb-4">搜索结果：</h2>
          {searchResults.map((result, index) => (
            <div key={index} className="mb-2 p-2 border rounded-lg hover:bg-gray-200">
              <h3 className="text-lg font-semibold">{result.title}</h3>
              <p>{result.snippet}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}