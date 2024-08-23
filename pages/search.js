// /pages/index.js
import { useState } from 'react';
import '../styles/globals.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [memeImage, setMemeImage] = useState('');

  const handleSearch = async () => {
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
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI 搜索引擎</h1>
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入搜索内容"
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">搜索</button>
        </div>
      </header>
      <main className="results-container">
        <section className="results-left">
          <div className="result-item">
            <h2 className="result-title">AI 回答：</h2>
            <p className="result-snippet">{aiAnswer}</p>
          </div>
          <div className="result-item">
            <h2 className="result-title">生成的模因图：</h2>
            {memeImage && <img src={memeImage} alt="Generated Meme" />}
          </div>
        </section>
        <section className="results-right">
          <h2 className="result-title">搜索结果：</h2>
          {searchResults.map((result, index) => (
            <div key={index} className="result-item">
              <h3 className="result-title">{result.title}</h3>
              <p className="result-snippet">{result.snippet}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="footer-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入搜索内容"
          className="footer-search-input"
        />
        <button onClick={handleSearch} className="footer-search-button">搜索</button>
      </footer>
    </div>
  );
}