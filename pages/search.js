import { faArrowUp, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <p>加载知识图谱中...</p>
});

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [memeImage, setMemeImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [memeLoading, setMemeLoading] = useState(false);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [graphError, setGraphError] = useState(null);
  const [memeError, setMemeError] = useState(null);

  const defaultQuery = "宇宙和一切的答案是什么？";

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setMemeLoading(true);
    setGraphError(null);
    setMemeError(null);
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
        setKnowledgeGraphData(graphData);
      } catch (error) {
        console.error('获取知识图谱时出错:', error);
        setGraphError('无法加载知识图谱');
        setKnowledgeGraphData(null);
      }

      // 生成表情包
      try {
        const memeResponse = await fetch('/api/meme-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: actualQuery }),
        });
        if (!memeResponse.ok) {
          throw new Error('表情包生成失败');
        }
        const memeBlob = await memeResponse.blob();
        setMemeImage(URL.createObjectURL(memeBlob));
      } catch (error) {
        console.error('生成表情包时出错:', error);
        setMemeError('无法生成表情包');
        setMemeImage('');
      }

      setQuery('');
    } catch (error) {
      console.error('搜索过程中出错:', error);
    }
    setLoading(false);
    setMemeLoading(false);
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

  const handleDownload = () => {
    if (memeImage) {
      const link = document.createElement('a');
      link.href = memeImage;
      link.download = 'meme.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div className="flex flex-row min-h-screen">
      <div className="w-1/6 p-4 bg-gray-300 flex flex-col justify-between fixed h-full" style={{ fontFamily: 'Open Sans, sans-serif' }}>
        <div>
          <Link href="/">
            <a className="text-3xl font-extrabold mb-4 text-center block transition-all duration-300 hover:opacity-80" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', letterSpacing: '-1px', color: 'black' }}>memedog</a>
          </Link>
          <div className="mb-4 relative">
            <input 
              type="text" 
              placeholder="随便问问..." 
              className="w-full p-4 border-2 border-gray-300 rounded-full outline-none text-xl hover:border-gray-400 focus:border-gray-500 transition-all duration-300"
              value={query}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Link href="/">
            <a className="block bg-gray-300 text-center p-2 rounded hover:bg-gray-400 transition duration-300 text-2xl font-medium text-gray-600 ml-0">🏠 主页</a>
          </Link>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Link href="/about">
            <a className="text-gray-600 hover:text-gray-800">我们在招聘</a>
          </Link>
          <a href="https://discord.gg/G66pESH3gm" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
          ❤️加入我们的Discord
          </a>
        </div>
      </div>
      <div className="w-5/6 p-4 ml-[16.666667%] overflow-y-auto">
        <div className="flex">
          <div className="w-2/3 pr-4">
            <div className="result-item mb-4">
              <h3 className="result-title">😲 回答</h3>
              <div className="min-h-40 p-4">
                {loading ? (
                  <div className="h-full bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="result-snippet">{aiAnswer}</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="result-title">🧠 知识图谱</h3>
              {loading ? (
                <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
              ) : graphError ? (
                <p className="text-red-500">{graphError}</p>
              ) : (
                knowledgeGraphData && <KnowledgeGraph data={knowledgeGraphData} />
              )}
            </div>
            <div className="result-item flex flex-col items-center">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🍳</span>
                <h3 className="text-xl font-bold">正在烹饪表情包</h3>
              </div>
              <div className="flex flex-col items-center w-full p-4">
                {memeLoading ? (
                  <div className="w-full h-64 bg-gray-200 animate-pulse rounded"></div>
                ) : memeError ? (
                  <p className="text-red-500">{memeError}</p>
                ) : memeImage ? (
                  <>
                    <img src={memeImage} alt="表情包生成中..." className="max-w-full max-h-64 object-contain mb-4" />
                    <div className="flex space-x-4">
                      <button onClick={handleDownload} className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        下载
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-500">烹饪中...</div>
                )}
              </div>
            </div>
          </div>
          <div className="w-1/3 p-4 bg-white">
            <h3 className="result-title">📚 参考资料</h3>
            <div className="space-y-2">
              {loading ? (
                <>
                  <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
                </>
              ) : (
                searchResults.map((result, index) => (
                  <div key={index} className="result-item bg-white p-2 rounded">
                    <h4 className="result-title">{result.title}</h4>
                    <p className="result-snippet">{result.snippet}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
            className="bg-black text-white rounded-full h-10 w-10 flex items-center justify-center absolute right-2 hover:bg-gray-800 transition duration-300" 
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </div>
  );
}