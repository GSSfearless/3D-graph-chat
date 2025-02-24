import { faArrowRight, faDiscord, faHistory, faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeGraphProcessor } from '../utils/knowledge-processor';
import Link from 'next/link';
import SelectedNodes from '../components/SelectedNodes';

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
  const knowledgeProcessor = useRef(new KnowledgeGraphProcessor());
  const [selectedNodes, setSelectedNodes] = useState([]);

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
      // 搜索完成后清空搜索框
      setQuery('');
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    // 更新选中节点列表
    setSelectedNodes(prevNodes => {
      const isSelected = prevNodes.some(n => n.id === node.id);
      if (isSelected) {
        return prevNodes.filter(n => n.id !== node.id);
      } else {
        return [...prevNodes, node];
      }
    });
  };

  const handleRemoveNode = (node) => {
    setSelectedNodes(prevNodes => prevNodes.filter(n => n.id !== node.id));
  };

  const handleMultiNodeSearch = (nodes) => {
    setSelectedNodes(nodes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* 顶部导航栏 - 减小高度 */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 h-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center">
              <Link href="/">
                <a className="flex items-center space-x-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Think Graph</span>
                </a>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <a href="https://discord.gg/your-discord" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center space-x-2 text-gray-500 hover:text-[#5865F2] transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 - 扩大高度 */}
      <main className="w-full px-4 py-2">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
          {/* 左侧区域：搜索历史和控制面板 */}
          <div className="col-span-2 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            {/* 搜索历史 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 control-panel">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FontAwesomeIcon icon={faHistory} className="w-4 h-4 mr-2" />
                搜索历史
              </h3>
              <div className="space-y-2">
                <div className="history-item p-2 rounded-lg cursor-pointer">
                  <p className="text-sm text-gray-600 truncate">示例搜索记录1</p>
                  <p className="text-xs text-gray-400 mt-1">2024-01-01 12:00</p>
                </div>
                <div className="history-item p-2 rounded-lg cursor-pointer">
                  <p className="text-sm text-gray-600 truncate">示例搜索记录2</p>
                  <p className="text-xs text-gray-400 mt-1">2024-01-01 11:00</p>
                </div>
              </div>
            </div>

            {/* 交互控制面板 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 control-panel">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FontAwesomeIcon icon={faSliders} className="w-4 h-4 mr-2" />
                显示控制
              </h3>
              
              {/* 线条样式 */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 block mb-2">线条样式</label>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    曲线
                  </button>
                  <button className="px-3 py-1.5 text-xs rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                    直线
                  </button>
                </div>
              </div>

              {/* 主题切换 */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 block mb-2">主题风格</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="theme-button aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer"></div>
                  <div className="theme-button aspect-square rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 cursor-pointer"></div>
                  <div className="theme-button aspect-square rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 cursor-pointer"></div>
                  <div className="theme-button aspect-square rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 cursor-pointer"></div>
                </div>
              </div>

              {/* 显示设置 */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">显示设置</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-xs text-gray-600">显示节点标签</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-xs text-gray-600">显示关系标签</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-xs text-gray-600">节点发光效果</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3D知识图谱显示区域 - 调整宽度 */}
          <div className="col-span-7 relative">
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
            
            {/* 选中节点显示区域 */}
            <div className="mt-4">
              <SelectedNodes 
                nodes={selectedNodes}
                onRemoveNode={handleRemoveNode}
                onSearch={handleMultiNodeSearch}
              />
            </div>
          </div>
        </div>

        {/* 底部搜索区域 */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Deepseek</span>
                <button
                  onClick={() => setUseDeepThinking(!useDeepThinking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    useDeepThinking ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                      useDeepThinking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
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
      </main>

      {/* 全局样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.5);
        }

        /* 主题切换按钮动画 */
        .theme-button {
          transition: transform 0.2s ease;
        }

        .theme-button:hover {
          transform: scale(1.05);
        }

        /* 控制面板卡片悬浮效果 */
        .control-panel {
          transition: all 0.3s ease;
        }

        .control-panel:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* 搜索历史项动画 */
        .history-item {
          transition: all 0.2s ease;
        }

        .history-item:hover {
          background-color: rgba(243, 244, 246, 0.8);
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}