// pages/index.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import SearchInput from './components/SearchInput';


export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      router.push(`/search?q=${query}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">Blue Space</h1>
        <SearchInput 
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
        />
      </div>
    </div>
  );
}