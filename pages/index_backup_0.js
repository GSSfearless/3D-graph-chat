import axios from 'axios';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState('');

  const handleSearch = async () => {
    // 调用 rag-search 接口获取搜索结果
    const searchResponse = await axios.post('/api/rag-search', { query });
    const searchResults = searchResponse.data;
    setResults(searchResults);

    // 调用 chat 接口生成回答
    const chatResponse = await axios.post('/api/chat', {
      context: searchResults,
      query
    });
    setAnswer(chatResponse.data.answer);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl mb-4 text-center">Blue Space AI Search Engine</h1>
      <div className="mb-4">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Enter your search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary w-full mt-4" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="mt-4">
        {results.map((result, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <h2 className="text-2xl font-bold">{result.title}</h2>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-2xl font-bold">AI Generated Answer</h2>
        <p>{answer}</p>
      </div>
    </div>
  );
}