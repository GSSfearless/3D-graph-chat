// pages/index.js
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState } from 'react';
import 'tailwindcss/tailwind.css'; // 引入 Tailwind CSS

export default function Home() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim() !== '') {
            router.push(`/search?q=${query}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f8f9fa]">
            <h1 className="text-4xl font-semibold mb-8 text-center">
            Visulize your knowledge
            </h1>
            <div className="w-full max-w-2xl relative">
                <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300 transition-all duration-300" style={{ height: '8rem' }}>
                    <input 
                        type="text" 
                        placeholder="Just ask memedog..." 
                        className="w-full p-4 border-none outline-none text-xl"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button 
                        className="bg-teal-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4" 
                        style={{ top: 'calc(50% - 2rem)' }}
                        onClick={handleSearch}
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            </div>
            <div className="mt-8 text-gray-500 text-center">
                <span>English (English)</span>
            </div>
        </div>
    );
}