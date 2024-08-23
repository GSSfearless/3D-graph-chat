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
      <div className="column">
        {loading ? (
          <div className="loading-placeholder">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        ) : (
          <div className="result-item">
            <h3 className="result-title">AI 回答：</h3>
            <p className="result-snippet">{aiAnswer}</p>
          </div>
        )}
      </div>
      <div className="column column-center">
        {loading ? (
          <div className="loading-placeholder">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        ) : (
          <div className="result-item">
            <h3 className="result-title">生成的模因图：</h3>
            <div style={{ textAlign: 'center' }}>
              {memeImage && <img src={memeImage} alt="Generated Meme" style={{ maxWidth: '100%', height: 'auto' }} />}
            </div>
          </div>
        )}
      </div>
      <div className="column">
        {loading ? (
          <div className="loading-placeholder">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        ) : (
          <>
            <h3 className="result-title">搜索结果：</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="result-item">
                <h4 className="result-title">{result.title}</h4>
                <p className="result-snippet">{result.snippet}</p>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="footer-search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="提出后续问题"
          className="footer-search-input"
        />
        <button onClick={handleSearch} className="footer-search-button">
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>
    </div>
  );
}