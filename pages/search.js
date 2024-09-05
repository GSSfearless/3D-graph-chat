import { faArrowUp, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), { ssr: false });

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
  const [errors, setErrors] = useState({});

  const defaultQuery = "What is the answer to the universe and everything?";

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setMemeLoading(true);
    setErrors({});
    try {
      const actualQuery = searchQuery || defaultQuery;
      
      // 获取搜索结果
      try {
        const searchResponse = await fetch('/api/rag-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: actualQuery }),
        });
        if (!searchResponse.ok) throw new Error('搜索结果获取失败');
        const searchData = await searchResponse.json();
        setSearchResults(searchData);
      } catch (error) {
        console.error('搜索结果错误:', error);
        setErrors(prev => ({ ...prev, search: '搜索结果获取失败' }));
      }

      // 获取AI回答
      try {
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context: searchResults, query: actualQuery }),
        });
        if (!chatResponse.ok) throw new Error('AI回答获取失败');
        const chatData = await chatResponse.json();
        setAiAnswer(chatData.answer);
      } catch (error) {
        console.error('AI回答错误:', error);
        setErrors(prev => ({ ...prev, aiAnswer: 'AI回答获取失败' }));
      }

      // 获取知识图表数据
      try {
        const graphResponse = await fetch('/api/knowledgeGraph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: actualQuery }),
        });
        if (!graphResponse.ok) throw new Error('知识图表获取失败');
        const graphData = await graphResponse.json();
        setKnowledgeGraphData(graphData);
      } catch (error) {
        console.error('知识图表错误:', error);
        setErrors(prev => ({ ...prev, knowledgeGraph: '知识图表获取失败' }));
      }

      // 生成梗图
      try {
        const memeResponse = await fetch('/api/meme-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: actualQuery }),
        });
        if (!memeResponse.ok) throw new Error('梗图生成失败');
        const memeBlob = await memeResponse.blob();
        setMemeImage(URL.createObjectURL(memeBlob));
      } catch (error) {
        console.error('梗图错误:', error);
        setErrors(prev => ({ ...prev, meme: '梗图生成失败' }));
      }

      setQuery('');
    } catch (error) {
      console.error('整体错误:', error);
      setErrors(prev => ({ ...prev, general: '搜索过程中发生错误' }));
    } finally {
      setLoading(false);
      setMemeLoading(false);
    }
  }, [searchResults]);

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
      {/* 侧边栏和其他UI元素保持不变 */}
      <div className="w-5/6 p-4 ml-[16.666667%] overflow-y-auto">
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="result-title">🧠 知识图表</h3>
            {loading ? (
              <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
            ) : errors.knowledgeGraph ? (
              <div className="h-64 bg-red-100 flex items-center justify-center text-red-500">{errors.knowledgeGraph}</div>
            ) : (
              knowledgeGraphData && <KnowledgeGraph data={knowledgeGraphData} />
            )}
          </div>
          {/* 其他UI元素保持不变 */}
        </div>
      </div>
      {/* 底部搜索栏保持不变 */}
    </div>
  );
}