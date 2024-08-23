import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const Home = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch('/api/rag-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            console.log(data);
            router.push(`/search?query=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Search Page</title>
                <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
                <style>{`
                    body {
                        font-family: 'Noto Sans SC', sans-serif;
                        background-color: #f8f9fa;
                    }
                `}</style>
            </Head>
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-4xl font-semibold mb-8 text-center">
                    <span role="img" aria-label="funny dog">😏</span> Share the Joy
                </h1>
                <div className="w-full max-w-2xl relative">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300" style={{ height: '8rem' }}>
                        <input
                            type="text"
                            placeholder="Just ask for meme image..."
                            className="w-full p-4 border-none outline-none text-xl"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            className={`bg-teal-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ top: 'calc(50% - 2rem)' }}
                            disabled={loading}
                            onClick={handleSearch}
                        >
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;