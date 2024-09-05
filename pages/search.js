import { faArrowUp, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import KnowledgeGraph from '../components/KnowledgeGraph';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState(q || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setResults(data.results || []);

      // 获取知识图谱数据
      const graphResponse = await fetch('/api/knowledgeGraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const graphData = await graphResponse.json();
      setKnowledgeGraphData(graphData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad) {
      handleSearch(q || '');
      setInitialLoad(false);
    }
  }, [initialLoad, q, handleSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    handleSearch(query);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <Link href="/">
            <a className="text-2xl font-bold">Blue Space</a>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
            Search
          </button>
        </form>

        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="result-title">🧠 Knowledge Graph</h3>
              {knowledgeGraphData && (
                <div className="h-64">
                  <KnowledgeGraph data={knowledgeGraphData} />
                </div>
              )}
            </div>
            <div>
              {results.map((result, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                  <h2 className="text-xl font-bold mb-2">{result.title}</h2>
                  <p className="mb-2">{result.snippet}</p>
                  <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {result.link}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-200 p-4 text-center">
        <p>&copy; 2024 Blue Space. All rights reserved.</p>
      </footer>
    </div>
  );
}