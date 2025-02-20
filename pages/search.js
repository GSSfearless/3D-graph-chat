import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
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
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Think Graph</span>
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="hidden md:inline">Powered by</span>
                <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Deepseek</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* 知识图谱显示区域 */}
          {loading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : graphData ? (
            <KnowledgeGraph
              data={graphData}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <div className="flex items-center justify-center h-screen">
              <p className="text-gray-400">在下方输入问题开始查询</p>
            </div>
          )}

          {/* 文本显示区域 - 改为浮动面板 */}
          {(useDeepThinking && reasoningProcess || streamedAnswer) && (
            <div className="fixed top-20 right-4 w-96 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-6 max-h-[calc(100vh-180px)] overflow-auto text-white">
              {useDeepThinking && reasoningProcess && (
                <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-purple-300">💭 思考过程</h3>
                  </div>
                  <div className="prose prose-invert prose-purple max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reasoningProcess}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {streamedAnswer && (
                <div className={useDeepThinking && reasoningProcess ? "mt-6" : ""}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                    {streamedAnswer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部搜索区域 */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white/80">联网搜索</span>
                    <button
                      onClick={() => setUseWebSearch(!useWebSearch)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        useWebSearch ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useWebSearch ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white/80">深度思考</span>
                    <button
                      onClick={() => setUseDeepThinking(!useDeepThinking)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        useDeepThinking ? 'bg-purple-500' : 'bg-gray-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useDeepThinking ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder={defaultQuery}
                  className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                />
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
                </button>
              </div>
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
        
        :global(body) {
          background: var(--neutral-900);
          color: white;
        }
        
        :global(.prose-invert) {
          color: var(--neutral-300);
        }
        
        :global(.prose-invert strong) {
          color: white;
        }
        
        :global(.prose-invert a) {
          color: var(--blue-400);
        }
      `}</style>
    </div>
  );
}