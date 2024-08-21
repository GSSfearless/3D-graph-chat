import axios from 'axios';
import { useState } from 'react';
import '../app/globals.css';
import '../styles/globals.css';

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
    <div className="min-h-screen bg-frosted flex flex-col">
      <div className="flex flex-col items-center w-full mb-10">
        <h1 className="text-6xl font-bold text-center text-[#003366] mb-10 mt-10">MeMe Cat Search</h1>
        <form onSubmit={handleSearch} className="flex justify-center w-full max-w-2xl mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入搜索内容"
            className="input input-bordered w-3/4 h-12 rounded-l-lg px-4 text-xl border-[#003366] focus:outline-none focus:border-[#003366] focus:ring ring-[#003366] transition duration-200"
          />
          <button type="submit" className="btn bg-[#003366] text-white w-1/4 h-12 rounded-r-lg text-xl">
            搜索
          </button>
        </form>
      </div>

      <div className="flex flex-grow w-full max-w-5xl mx-auto space-x-10">
        <div className="flex-grow w-1/2">
          {answer && (
            <>
              <h2 className="text-3xl font-semibold text-[#003366]">AI 回答</h2>
              <div className="mt-4 p-6 bg-white bg-opacity-70 border rounded-lg shadow-md text-lg text-[#003366]">
                {answer}
              </div>
            </>
          )}
        </div>

        <div className="flex-grow w-1/2">
          {results.length > 0 && (
            <>
              <h2 className="text-3xl font-semibold text-[#003366]">搜索结果</h2>
              <ul className="mt-4 space-y-6">
                {results.map((result, index) => (
                  <li key={index} className="p-4 bg-white bg-opacity-70 border rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-[#003366]">{result.title}</h3>
                    <p className="text-lg text-gray-700">{result.snippet}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}