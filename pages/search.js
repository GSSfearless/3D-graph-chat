import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeGraphProcessor } from '../utils/knowledge-processor';
import LeftSidebar from '../components/LeftSidebar';
import { HistoryManager } from '../utils/history-manager';
import { useAuth } from '../contexts/AuthContext';
import { Star } from 'lucide-react';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading knowledge graph...</div>
});

export default function Search() {
  const router = useRouter();
  const { q: initialQuery } = router.query;
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [reasoningProcess, setReasoningProcess] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const searchInputRef = useRef(null);
  const knowledgeProcessor = useRef(new KnowledgeGraphProcessor());
  const { user } = useAuth();

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  useEffect(() => {
    if (initialQuery && user) {
      // 初始查询时添加到搜索历史
      HistoryManager.addSearchHistory(initialQuery.toString());
    }
  }, [initialQuery, user]);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setStreamedAnswer('');
    setGraphData(null);
    setSelectedNode(null);
    setReasoningProcess('');

    try {
      // 只在启用联网搜索时执行 RAG 搜索
      if (useWebSearch) {
        const searchResponse = await fetch(`/api/rag-search?query=${encodeURIComponent(searchQuery)}`);
        if (!searchResponse.ok) {
          throw new Error('搜索请求失败');
        }
      }

      // 发送聊天请求
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
                      
                      try {
                        // 实时更新知识图谱
                        const graphData = await knowledgeProcessor.current.processText(answer);
                        if (graphData && Array.isArray(graphData.nodes) && Array.isArray(graphData.edges)) {
                          // 转换数据格式以适配 KnowledgeGraph 组件
                          const formattedData = {
                            nodes: graphData.nodes.map(node => ({
                              data: {
                                id: node.id,
                                label: node.label || node.text,
                                type: node.type,
                                size: node.size,
                                color: node.color,
                                properties: node.properties || {}
                              }
                            })),
                            edges: graphData.edges.map(edge => ({
                              data: {
                                id: edge.id,
                                source: edge.source,
                                target: edge.target,
                                label: edge.label,
                                type: edge.type,
                                weight: edge.weight
                              }
                            }))
                          };
                          console.log('Formatted graph data:', formattedData);
                          setGraphData(formattedData);
                        } else {
                          console.warn('Invalid graph data structure:', graphData);
                          setGraphData(null);
                        }
                      } catch (error) {
                        console.error('生成知识图谱失败:', error);
                        setGraphData(null);
                      }
                    }
                    break;
                  case 'complete':
                    if (parsed.content) {
                      const completeAnswer = decodeURIComponent(parsed.content);
                      setStreamedAnswer(completeAnswer);
                      
                      try {
                        // 处理完整回答，生成最终知识图谱
                        const finalGraphData = await knowledgeProcessor.current.processText(completeAnswer);
                        if (finalGraphData && Array.isArray(finalGraphData.nodes) && Array.isArray(finalGraphData.edges)) {
                          // 转换数据格式以适配 KnowledgeGraph 组件
                          const formattedData = {
                            nodes: finalGraphData.nodes.map(node => ({
                              data: {
                                id: node.id,
                                label: node.label || node.text,
                                type: node.type,
                                size: node.size,
                                color: node.color,
                                properties: node.properties || {}
                              }
                            })),
                            edges: finalGraphData.edges.map(edge => ({
                              data: {
                                id: edge.id,
                                source: edge.source,
                                target: edge.target,
                                label: edge.label,
                                type: edge.type,
                                weight: edge.weight
                              }
                            }))
                          };
                          console.log('Formatted final graph data:', formattedData);
                          setGraphData(formattedData);
                        } else {
                          console.warn('Invalid final graph data structure:', finalGraphData);
                          setGraphData(null);
                        }
                      } catch (error) {
                        console.error('生成最终知识图谱失败:', error);
                        setGraphData(null);
                      }
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
  }, [useWebSearch, useDeepThinking, user]);

  useEffect(() => {
    if (initialQuery && initialLoad) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
      setInitialLoad(false);
    }
  }, [initialQuery, initialLoad, handleSearch]);

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
      // 搜索完成后清空搜索框
      setQuery('');
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleAddFavorite = async () => {
    if (!user || !streamedAnswer) return;

    try {
      if (isFavorited) {
        // 如果已经收藏，则取消收藏
        // 这里需要先获取当前收藏的ID，然后删除
        // 由于目前的数据结构限制，这个功能暂时不实现
        return;
      }

      await HistoryManager.addFavorite({
        title: query,
        description: streamedAnswer.slice(0, 200) + (streamedAnswer.length > 200 ? '...' : ''),
        graph_data: graphData
      });

      setIsFavorited(true);
      setShowFavoriteToast(true);
      setTimeout(() => setShowFavoriteToast(false), 2000);
    } catch (error) {
      console.error('Add favorite error:', error);
      alert('收藏失败，请重试');
    }
  };

  // 在每次搜索时重置收藏状态
  useEffect(() => {
    setIsFavorited(false);
  }, [query]);

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* 主要内容区域 */}
          <div className="grid grid-cols-12 gap-4 h-screen">
            {/* 3D知识图谱显示区域 - 固定位置 */}
            <div className="col-span-9 relative">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full sticky top-0">
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

            {/* 文本显示区域 - 可滚动 */}
            <div className="col-span-3 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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

          {/* 底部搜索区域 */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
              <div className="flex flex-col space-y-3">
                {/* 工具栏 */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setUseDeepThinking(!useDeepThinking)}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                        useDeepThinking ? 'bg-purple-500' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                          useDeepThinking ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </div>
                      <span className="text-gray-600">深度思考</span>
                    </button>
                    <button
                      onClick={() => setUseWebSearch(!useWebSearch)}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                        useWebSearch ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                          useWebSearch ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </div>
                      <span className="text-gray-600">联网搜索</span>
                    </button>
                  </div>
                  {user && streamedAnswer && (
                    <button
                      onClick={handleAddFavorite}
                      disabled={loading}
                      className="flex items-center space-x-1 text-sm text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                    >
                      <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      <span>{isFavorited ? '已收藏' : '收藏'}</span>
                    </button>
                  )}
                </div>

                {/* 搜索框 */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={handleInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                      placeholder={defaultQuery}
                      className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl 
                               text-sm transition-all duration-300
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               hover:border-blue-300 hover:shadow-sm"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center justify-center w-10 h-10 rounded-xl 
                             bg-gradient-to-r from-blue-500 to-blue-600 
                             text-white shadow-md transition-all duration-300
                             hover:from-blue-600 hover:to-blue-700 hover:shadow-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:shadow-none"
                  >
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 收藏成功提示 */}
          {showFavoriteToast && (
            <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
              收藏成功
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}