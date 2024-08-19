// pages/search.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SearchResult from './components/SearchResult';
import MemeCard from './components/MemeCard';


export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [memeData, setMemeData] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q) return;
      
      const res = await fetch(`/api/rag-search?query=${q}`);
      const data = await res.json();
      
      setResults(data.results);

      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: data.results }),
      });
      const chatData = await chatRes.json();
      
      setMemeData(chatData.meme);
      setLoading(false);
    };

    fetchResults();
  }, [q]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{q}"</h1>
      <SearchResult results={results} />
      {memeData && <MemeCard memeData={memeData} />}
    </div>
  );
}