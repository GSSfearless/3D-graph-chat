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

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
        <div className="mt-2">Loading knowledge graph...</div>
      </div>
    </div>
  )
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
          throw new Error('Search request failed');
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
                        console.error('Error generating knowledge graph:', error);
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
                        console.error('Error generating final knowledge graph:', error);
                        setGraphData(null);
                      }
                    }
                    break;
                }
              } catch (e) {
                console.error('Error parsing response data:', e);
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
      alert('An error occurred during search. Please try again.');
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

            {/* Search form */}
            <div className="col-span-12 p-4">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Enter your question..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md ${
                    loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </form>
            </div>
          </div>
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