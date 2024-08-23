// pages/search.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function SearchResults() {
    const router = useRouter();
    const [query, setQuery] = useState(router.query.q || '');
    const [searchResults, setSearchResults] = useState([]);
    const [aiAnswer, setAiAnswer] = useState('');
    const [memeImage, setMemeImage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            handleSearch(query);
        }
    }, [query]);

    const handleSearch = async (searchQuery) => {
        if (loading) return;
        setLoading(true);
        try {
            // Fetch search results
            const searchResponse = await fetch('/api/rag-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery }),
            });
            const searchData = await searchResponse.json();
            setSearchResults(searchData);

            // Fetch AI answer
            const chatResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: searchData, query: searchQuery }),
            });
            const chatData = await chatResponse.json();
            setAiAnswer(chatData.answer);

            // Generate meme
            const memeResponse = await fetch('/api/meme-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: searchQuery }),
            });
            const memeBlob = await memeResponse.blob();
            setMemeImage(URL.createObjectURL(memeBlob));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white text-gray-800 p-4 md:p-8 min-h-screen">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/3">
                    <h1 className="text-3xl font-bold mb-4">{query}</h1>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2 flex items-center">
                            <i className="fas fa-question-circle mr-2"></i>
                            Answer
                        </h2>
                        <p className="mb-4">{aiAnswer}</p>
                    </div>
                </div>
                <div className="w-full md:w-1/3 md:pl-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2 flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            Reference
                        </h2>
                        <div className="flex flex-col space-y-2">
                            {searchResults.map((result, index) => (
                                <div key={index} className="bg-gray-100 p-2 rounded flex items-center space-x-2">
                                    <i className="fas fa-link text-lg text-blue-500"></i>
                                    <span>{result.title}</span>
                                    <span className="text-gray-500">{result.site}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 w-full max-w-2xl flex space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Better meme image..."
                    className="w-full p-4 border rounded-full"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                />
                <button
                    className="bg-teal-500 p-2 rounded-full flex items-center justify-center w-10 h-10"
                    onClick={() => handleSearch(query)}
                    disabled={loading}
                >
                    <i className="fas fa-arrow-up text-lg text-white"></i>
                </button>
            </div>
        </div>
    );
}