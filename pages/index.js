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
    <div className="min-h-screen bg-[#f0f8ff] flex flex-col items-center justify-center py-12">
      <h1 className="text-6xl font-bold text-center text-[#003366] mb-10">AI 搜索引擎</h1>
      
      <form onSubmit={handleSearch} className="w-full max-w-3xl flex flex-col items-center space-y-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入搜索内容"
          className="input input-bordered w-full max-w-lg px-4 py-2 text-xl border-[#003366]"
        />
        <button type="submit" className="btn btn-lg bg-[#003366] text-white w-full max-w-lg">
          搜索
        </button>
      </form>

      <div className="flex flex-wrap mt-10 justify-center space-x-10">
        {answer && (
          <div className="w-full md:w-5/12 mt-10 md:mt-0">
            <h2 className="text-3xl font-semibold text-[#003366]">AI 回答</h2>
            <p className="mt-4 p-4 bg-white border rounded-lg shadow-md text-lg">{answer}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="w-full md:w-5/12 mt-10 md:mt-0">
            <h2 className="text-3xl font-semibold text-[#003366]">搜索结果</h2>
            <ul className="mt-4 space-y-6">
              {results.map((result, index) => (
                <li key={index} className="p-4 bg-white border rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold text-[#003366]">{result.title}</h3>
                  <p className="text-lg text-gray-700">{result.snippet}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}