import { faArrowRight, faDiscord } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeProcessor } from '../utils/knowledge-processor';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading knowledge graph...</div>
});

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [reasoningProcess, setReasoningProcess] = useState('');
  const searchInputRef = useRef(null);
  const knowledgeProcessor = useRef(new KnowledgeProcessor());

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    console.log('=== 搜索开始 ===');
    console.log('查询内容:', searchQuery);
    console.log('深度思考模式:', useDeepThinking ? '开启' : '关闭');
    console.log('联网搜索:', useWebSearch ? '开启' : '关闭');
    
    setLoading(true);
    setStreamedAnswer('');
    setGraphData(null);
    setSelectedNode(null);
    setReasoningProcess('');

    try {
      // 只在启用联网搜索时执行 RAG 搜索
      if (useWebSearch) {
        console.log('执行联网搜索...');
        const searchResponse = await fetch(`/api/rag-search?query=${encodeURIComponent(searchQuery)}`);
        if (!searchResponse.ok) {
          throw new Error('搜索请求失败');
        }
        const searchResults = await searchResponse.json();
        console.log('搜索结果:', searchResults);
      }

      // 发送聊天请求
      console.log('生成AI回答...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          useDeepThinking
        })
      });

      if (!chatResponse.ok) {
        throw new Error(`HTTP error! status: ${chatResponse.status}`);
      }

      // 处理流式响应
      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (!parsed) continue;

                switch (parsed.type) {
                  case 'reasoning':
                    if (parsed.content) {
                      const decodedContent = decodeURIComponent(parsed.content);
                      setReasoningProcess(prev => prev + '\n' + decodedContent);
                    }
                    break;
                  case 'delta':
                    if (parsed.content) {
                      const decodedContent = decodeURIComponent(parsed.content);
                      answer += decodedContent;
                      setStreamedAnswer(answer);
                      
                      // 实时更新知识图谱
                      const graphData = knowledgeProcessor.current.processSearchResponse(answer);
                      setGraphData(graphData);
                    }
                    break;
                  case 'complete':
                    if (parsed.content) {
                      const completeAnswer = decodeURIComponent(parsed.content);
                      setStreamedAnswer(completeAnswer);
                      
                      // 处理完整回答，生成最终知识图谱
                      const finalGraphData = knowledgeProcessor.current.processSearchResponse(completeAnswer);
                      setGraphData(finalGraphData);
                    }
                    break;
                }
              } catch (e) {
                console.error('解析响应数据失败:', e);
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Search process error:', error);
      alert('搜索过程中出错，请重试');
    } finally {
      setLoading(false);
    }
  }, [useWebSearch, useDeepThinking]);

  useEffect(() => {
    if (q && initialLoad) {
      setQuery(q);
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [q, initialLoad, handleSearch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push({
        pathname: '/search',
        query: { q: query }
      });
      handleSearch(query);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航栏 - 减小高度 */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 h-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Think Graph</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
                <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
              </a>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Powered by deepseek</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 - 扩大高度 */}
      <main className="w-full px-4 py-2">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
          {/* 3D知识图谱显示区域 - 扩大比例 */}
          <div className="col-span-9 relative">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : graphData ? (
                <KnowledgeGraph
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  style={{ height: '100%' }}
                  defaultMode="3d"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">在下方输入问题开始查询</p>
                </div>
              )}
            </div>
          </div>

          {/* 文本显示区域 - 减小比例但增加高度 */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-auto p-4">
              {useDeepThinking && reasoningProcess && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-semibold text-purple-700">💭 思考过程</h3>
                  </div>
                  <div className="prose prose-sm prose-purple max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reasoningProcess}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {streamedAnswer && (
                <div className={useDeepThinking && reasoningProcess ? "mt-4" : ""}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                    {streamedAnswer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部搜索区域 - 简化并减小高度 */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">深度思考</span>
                <button
                  onClick={() => setUseDeepThinking(!useDeepThinking)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    useDeepThinking ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useDeepThinking ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder={defaultQuery}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm"
              />
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}