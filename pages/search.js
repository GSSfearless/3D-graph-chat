// /pages/index.js
import { useState } from 'react';
import '../styles/globals.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [memeImage, setMemeImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
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

  return (
    <div className="container">
      <main className="results-container">
        <section className="results-left">
          {loading ? (
            <div className="loading-placeholder">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="result-item">
                <p className="result-snippet">{aiAnswer}</p>
              </div>
              <div className="result-item">
                {memeImage && <img src={memeImage} alt="Generated Meme" />}
              </div>
            </>
          )}
        </section>
        <section className="results-right">
          {loading ? (
            <div className="loading-placeholder">
              <div className=" progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          ) : (
            <>
              {searchResults.map((result, index) => (
                <div key={index} className="result-item">
                  <h3 className="result-title">{result.title}</h3>
                  <p className="result-snippet">{result.snippet}</p>
                </div>
              ))}
            </>
          )}
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
        <button onClick={handleSearch} className="footer-search-button"></button>
      </footer>
    </div>
  );
}