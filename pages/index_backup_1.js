import axios from 'axios';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/rag-search', { query });
      setResults(response.data);

      const context = response.data.map((item) => ({
        title: item.title,
        snippet: item.snippet
      }));

      const chatResponse = await axios.post('/api/chat', { context, query });
      setAnswer(chatResponse.data.answer);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mt-20">AI 搜索引擎</h1>
      
      <form onSubmit={handleSearch} className="mt-10 flex justify-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入搜索内容"
          className="input input-bordered w-full max-w-lg"
        />
        <button type="submit" className="btn btn-primary ml-4">搜索</button>
      </form>

      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mt-10">搜索结果</h2>
          <ul className="mt-4 space-y-4">
            {results.map((result, index) => (
              <li key={index} className="p-4 border rounded-lg shadow-md">
                <h3 className="text-xl font-bold">{result.title}</h3>
                <p>{result.snippet}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold">AI 回答</h2>
          <p className="mt-4 p-4 border rounded-lg shadow-md">{answer}</p>
        </div>
      )}
    </div>
  );
}