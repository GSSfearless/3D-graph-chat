import { useState } from 'react';
import '../app/globals.css';
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
      const memeUrl = URL.createObjectURL(memeBlob);
      setMemeImage(memeUrl);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const downloadMeme = () => {
    if (!memeImage) return;
    const link = document.createElement('a');
    link.href = memeImage;
    link.download = 'meme.png';
    link.click();
  };

  const shareMeme = async () => {
    if (!memeImage) return;
    const response = await fetch(memeImage);
    const blob = await response.blob();
    const file = new File([blob], 'meme.png', { type: blob.type });

    try {
      await navigator.share({
        files: [file],
        title: 'Generated Meme',
        text: 'Check out this meme I generated on memedog.online!',
      });
    } catch (err) {
      console.error('Error sharing meme:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-4xl font-bold mb-4">AI 搜索引擎</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入搜索内容"
            className="input input-bordered flex-grow"
          />
          <button onClick={handleSearch} className="btn btn-primary">搜索</button>
        </div>
      </header>
      <main className="flex flex-row space-x-4">
        <section className="w-1/2">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">AI 回答：</h2>
            <p>{aiAnswer}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">生成的模因图：</h2>
            {memeImage && (
              <>
                <img src={memeImage} alt="Generated Meme" className="rounded shadow max-w-full h-auto" />
                <div className="mt-4 flex space-x-2">
                  <button onClick={downloadMeme} className="btn btn-secondary">下载图片</button>
                  <button onClick={shareMeme} className="btn btn-secondary">分享图片</button>
                </div>
              </>
            )}
          </div>
        </section>
        <section className="w-1/2">
          <h2 className="text-2xl font-bold">搜索结果：</h2>
          {searchResults.map((result, index) => (
            <div key={index} className="my-2 p-2 border rounded">
              <h3 className="text-lg font-semibold">{result.title}</h3>
              <p>{result.snippet}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}