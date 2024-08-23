// pages/index.js
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
import { useState } from 'react';
import 'tailwindcss/tailwind.css';
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export default function Home() {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim() !== '') {
            window.location.href = `/search?q=${query}`;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f8f9fa]">
            <h1 className="text-4xl font-semibold mb-8 text-center">
                <span role="img" aria-label="funny dog">😏</span> Share the Joy
            </h1>
            <div className="w-full max-w-2xl relative">
                <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300" style={{ height: '8rem' }}>
                    <input 
                        type="text" 
                        placeholder="Just ask..." 
                        className="w-full p-4 border-none outline-none text-xl"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button 
                        className="bg-teal-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4" 
                        style={{ top: 'calc(50% - 2rem)' }}
                        onClick={handleSearch}
                    >
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
            <div className="mt-8 text-gray-500 text-center">
                <span>English (English)</span>
            </div>
        </div>
    );
}