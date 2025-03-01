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
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingState } from '../components/ui/LoadingState';
import { showToast } from '../components/ui/ToastManager';
import { ProgressManager } from '../utils/progress';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <LoadingState message="正在加载知识图谱..." size="lg" />
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
    ProgressManager.start();

    try {
      // 只在启用联网搜索时执行 RAG 搜索
      if (useWebSearch) {
        const searchResponse = await fetch(`/api/rag-search?query=${encodeURIComponent(searchQuery)}`);
        if (!searchResponse.ok) {
          throw new Error('联网搜索失败，请稍后重试');
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
        throw new Error(`服务器响应错误 (${chatResponse.status})`);
      }

      // 处理流式响应
      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      let progress = 0;

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
                      
                      // 更新进度
                      progress += 0.1;
                      ProgressManager.set(Math.min(progress, 0.9));
                      
                      try {
                        // 实时更新知识图谱
                        const graphData = await knowledgeProcessor.current.processText(answer);
                        if (graphData?.nodes?.length && graphData?.edges?.length) {
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
                          setGraphData(formattedData);
                        }
                      } catch (error) {
                        console.error('生成知识图谱失败:', error);
                        showToast.error('知识图谱生成失败，但不影响搜索结果的显示');
                      }
                    }
                    break;
                  case 'complete':
                    if (parsed.content) {
                      const completeAnswer = decodeURIComponent(parsed.content);
                      setStreamedAnswer(completeAnswer);
                      showToast.success('搜索完成！');
                    }
                    break;
                }
              } catch (e) {
                console.error('解析响应数据失败:', e);
                showToast.error('解析响应数据时出错');
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
      showToast.error(error.message || '搜索过程中出错，请重试');
    } finally {
      setLoading(false);
      ProgressManager.done();
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
          <div className="grid grid-cols-12 gap-4 h-screen">
            {/* Left Content Area */}
            <div className="col-span-6 p-4 overflow-y-auto">
              {/* Search Input */}
              <div className="mb-4">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="输入你想了解的任何主题..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md ${
                      loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors`}
                  >
                    {loading ? '搜索中...' : '搜索'}
                  </button>
                </form>
              </div>

              {/* Options */}
              <div className="mb-4 flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useWebSearch}
                    onChange={(e) => setUseWebSearch(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>联网搜索</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useDeepThinking}
                    onChange={(e) => setUseDeepThinking(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>深度思考模式</span>
                </label>
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                {loading && <LoadingState message="正在思考中..." />}
                
                {useDeepThinking && reasoningProcess && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">思考过程</h3>
                    <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
                      {reasoningProcess}
                    </ReactMarkdown>
                  </div>
                )}

                {streamedAnswer && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
                      {streamedAnswer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Right Graph Area */}
            <div className="col-span-6 p-4">
              {graphData ? (
                <KnowledgeGraph
                  data={graphData}
                  onNodeClick={handleNodeClick}
                />
              ) : loading ? (
                <LoadingState message="正在构建知识图谱..." size="lg" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>输入关键词开始探索知识图谱</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}