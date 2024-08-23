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
        <div className="bg-white text-gray-800 p-4 md:p-8">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/3">
                    <h1 className="text-3xl font-bold mb-4">memedog</h1>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2 flex items-center">
                            <i className="fas fa-question-circle mr-2"></i>
                            答案
                        </h2>
                        <p className="mb-4">{aiAnswer}</p>
                        <h3 className="text-lg font-semibold mb-2">Key Aspects of Meme Dog</h3>
                        <ul className="list-disc list-inside">
                            <li className="mb-2"><strong>GIFs and Videos:</strong> Platforms like GIPHY and YouTube host a variety of Meme Dog GIFs and videos, showcasing dogs in funny scenarios, such as the &quot;Funny Laughing Dog Meme&quot; and others that have garnered millions of views <span className="text-gray-500">1 2</span>.</li>
                            <li><strong>Merchandise:</strong> The Meme Dog phenomenon has inspired a range of products available on platforms like Etsy and Redbubble. These include unique items such as laptop decals, T-shirts, posters, and stickers, all featuring Meme Dog designs created by fans.</li>
                        </ul>
                    </div>
                </div>
                <div className="w-full md:w-1/3 md:pl-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2 flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            来源
                        </h2>
                        <div className="flex flex-col space-y-2">
                            {searchResults.map((result, index) => (
                                <div key={index} className="bg-gray-100 p-2 rounded flex items-center space-x-2">
                                    <i className={`fas ${result.icon} text-lg ${result.color}`}></i>
                                    <span>{result.title}</span>
                                    <span className="text-gray-500">{result.site}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex items-center space-x-4">
                <input
                    type="text"
                    className="w-full p-4 border rounded-full"
                    placeholder="提出后续问题"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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