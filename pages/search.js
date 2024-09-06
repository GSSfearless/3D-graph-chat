import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <p>正在加载知识图谱...</p>
});

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [graphError, setGraphError] = useState(null);
  const [showLargeSearch, setShowLargeSearch] = useState(false);

  const defaultQuery = "生命、宇宙以及一切的答案是什么？";

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setGraphError(null);
    try {
      const actualQuery = searchQuery || defaultQuery;
      
      // 获取搜索结果
      const searchResponse = await fetch('/api/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: actualQuery }),
      });
      const searchData = await searchResponse.json();
      setSearchResults(searchData);

      // 获取AI回答
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchData, query: actualQuery }),
      });
      const chatData = await chatResponse.json();
      setAiAnswer(chatData.answer);

      // 获取知识图谱数据
      try {
        const graphResponse = await fetch('/api/knowledgeGraph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: actualQuery }),
        });

        if (!graphResponse.ok) {
          throw new Error(`知识图谱API错误: ${graphResponse.status}`);
        }

        const graphData = await graphResponse.json();
        console.log('知识图谱数据:', graphData);
        setKnowledgeGraphData(graphData);
      } catch (error) {
        console.error('获取知识图谱时出错:', error);
        setGraphError('无法加载知识图谱');
        setKnowledgeGraphData(null);
      }

      setQuery('');
    } catch (error) {
      console.error('搜索过程中出错:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialLoad && q) {
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [initialLoad, q, handleSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleButtonClick = () => {
    handleSearch(query);
  }

  const handleLargeSearch = () => {
    if (query.trim() !== '') {
      handleSearch(query);
      setShowLargeSearch(false);
    }
  };

  const handleLargeSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLargeSearch();
    }
  };

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/6 p-4 bg-[#ECF5FD] flex flex-col justify-between fixed h-full" style={{ fontFamily: 'Open Sans, sans-serif' }}>
        <div>
          <Link href="/">
            <a className="text-3xl font-extrabold mb-4 text-center block transition-all duration-300 hover:text-[#6CB6EF]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', letterSpacing: '-1px', color: 'black' }}>Think-Graph</a>
          </Link>
          <div className="mb-4 relative">
            <input 
              type="text" 
              placeholder="Just Ask..." 
              className="w-full p-4 border-2 border-gray-300 rounded-full outline-none text-xl hover:border-gray-400 focus:border-gray-500 transition-all duration-300 cursor-pointer"
              onClick={() => setShowLargeSearch(true)}
              readOnly
            />
          </div>
          <Link href="/">
            <a className="block bg-[#ECF5FD] text-center p-2 rounded hover:bg-[#B6DBF7] transition duration-300 text-xl font-medium text-gray-600">🏠 Homepage</a>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/about">
              <a className="block bg-[#ECF5FD] text-center p-2 rounded hover:bg-[#B6DBF7] transition duration-300 text-2xl font-medium text-gray-600">🪐</a>
            </Link>
            <span className="text-xs ml-2">We are hiring</span>
          </div>
          <div className="text-gray-400 mx-2">|</div>
          <div className="flex items-center">
            <a href="https://discord.gg/G66pESH3gm" target="_blank" rel="noopener noreferrer" className="block bg-[#ECF5FD] text-center p-2 rounded hover:bg-[#B6DBF7] transition duration-300 text-2xl font-medium text-gray-600">
            🍻
            </a>
            <span className="text-xs ml-2">Join our discord</span>
          </div>
        </div>
      </div>
      <div className="w-5/6 p-4 ml-[16.666667%] overflow-y-auto">
        <div className="flex">
          <div className="w-2/3 pr-4">
            <div className="result-item mb-4">
              <h3 className="result-title text-4xl">📝Answer</h3>
              <p className="text-xs text-gray-500 text-center mb-2">搜集了 {searchResults.length} 个网页</p>
              <div className="min-h-40 p-4">
                {loading ? (
                  <div className="h-full bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="result-snippet">{aiAnswer}</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="result-title text-4xl">🧠Knowledge Graph</h3>
              {loading ? (
                <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
              ) : graphError ? (
                <p className="text-red-500">{graphError}</p>
              ) : knowledgeGraphData ? (
                <div style={{ height: 400, width: '100%', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <KnowledgeGraph 
                    data={knowledgeGraphData} 
                    options={{
                      layout: {
                        improvedLayout: true,
                        hierarchical: false
                      },
                      edges: {
                        smooth: {
                          type: 'cubicBezier',
                          forceDirection: 'horizontal',
                          roundness: 0.4
                        }
                      },
                      physics: {
                        stabilization: true,
                        barnesHut: {
                          gravitationalConstant: -80000,
                          springConstant: 0.001,
                          springLength: 200
                        }
                      },
                      nodes: {
                        shape: 'box',
                        margin: 10,
                        widthConstraint: {
                          minimum: 60,
                          maximum: 120
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <p>没有可用的知识图谱数据</p>
              )}
            </div>
          </div>
          <div className="w-1/3 p-4 bg-white">
            <h3 className="result-title text-lg mb-2">📚 Bookmark</h3>
            <div className="space-y-1">
              {/* 暂时留为空白 */}
            </div>
          </div>
        </div>
      </div>

      {showLargeSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl p-4">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300 transition-all duration-300" style={{ height: '8rem' }}>
              <input 
                type="text" 
                placeholder="Just ask..." 
                className="w-full p-4 border-none outline-none text-xl"
                value={query}
                onChange={handleChange}
                onKeyPress={handleLargeSearchKeyPress}
                autoFocus
              />
              <button 
                className="bg-[#105C93] text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-8 hover:bg-[#3A86C8] transition duration-300" 
                style={{ top: 'calc(50% - 1.5rem)' }}
                onClick={handleLargeSearch}
              >
                <FontAwesomeIcon icon={faArrowUp} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-[calc(50%-110px)] transform -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-white p-2 rounded-lg shadow-md flex items-center border-2 border-gray-300 transition-all duration-300" style={{ height: '4rem' }}>
          <input 
            type="text" 
            placeholder={defaultQuery}
            className="w-full p-2 border-none outline-none text-xl"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-[#105C93] text-white rounded-full h-10 w-10 flex items-center justify-center absolute right-2 hover:bg-[#3A86C8] transition duration-300" 
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </div>
  );
}