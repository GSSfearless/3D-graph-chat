import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeGraphProcessor } from '../utils/knowledge-processor';
import LeftSidebar from '../components/LeftSidebar';
import { HistoryManager } from '../utils/history-manager';
import { useAuth } from '../contexts/AuthContext';
import { useWindowSize } from '../hooks/useWindowSize';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading knowledge graph...</div>
});

export default function Search() {
  const router = useRouter();
  
  // 增强路由参数处理的健壮性
  const initialQuery = useMemo(() => {
    // 如果router.query未就绪或为空对象，返回null
    if (!router.isReady || !router.query) return null;
    
    const { q } = router.query;
    // 参数验证
    return typeof q === 'string' && q.trim() !== '' ? q : null;
  }, [router.query, router.isReady]);
  
  // 基于新的initialQuery逻辑调整query状态初始化
  const [query, setQuery] = useState('');
  
  // 将initialQuery的副作用独立出来
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [reasoningProcess, setReasoningProcess] = useState('');
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);  // 控制移动端侧边栏显示
  const searchInputRef = useRef(null);
  const knowledgeProcessor = useRef(new KnowledgeGraphProcessor());
  const { user } = useAuth();
  const { width } = useWindowSize();
  
  // 使用useMemo确保服务端和客户端一致性
  const isMobile = useMemo(() => {
    // 在服务端渲染时返回默认值
    if (typeof window === 'undefined') return false;
    return typeof width === 'number' ? width < 768 : false;
  }, [width]);

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  useEffect(() => {
    if (initialQuery && typeof initialQuery === 'string' && user) {
      // 初始查询时添加到搜索历史
      HistoryManager.addSearchHistory(initialQuery.toString());
    }
  }, [initialQuery, user]);

  const handleSearch = useCallback(async (searchQuery) => {
    // 添加更严格的类型检查
    if (!searchQuery || typeof searchQuery !== 'string' || !searchQuery.trim()) {
      console.warn('无效的搜索查询:', searchQuery);
      return;
    }
    
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
          useDeepThinking: false // 强制设置为false，忽略用户设置
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
      // 搜索完成后清空搜索框
      setQuery('');
    }
  }, [useWebSearch, useDeepThinking, user]);

  useEffect(() => {
    // 添加try-catch以防止初始化错误
    try {
      // 增强initialQuery检查，确保只有在router准备好且有有效查询时才进行搜索
      if (initialQuery && initialLoad && router.isReady) {
        handleSearch(initialQuery);
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('初始化搜索失败:', error);
      // 向Sentry报告错误
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error);
      }
      setInitialLoad(false);
    }
  }, [initialQuery, initialLoad, handleSearch, router.isReady]);

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
      // 清空搜索框
      setQuery('');
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  // 添加分享功能
  const handleShare = () => {
    // 获取当前URL
    const currentUrl = window.location.href;
    
    // 复制URL到剪贴板
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        // 显示提示信息
        alert('链接已复制到剪贴板，现在您可以分享给他人了！');
      })
      .catch(err => {
        console.error('无法复制链接: ', err);
      });
  };

  // 在组件顶部添加浏览器历史监听
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    // 处理浏览器的popstate事件(回退/前进按钮)
    const handlePopState = () => {
      // 如果回退到搜索页但没有查询参数，回到首页
      if (window.location.pathname === '/search' && !window.location.search.includes('q=')) {
        console.log('检测到无参数回退到搜索页，重定向到首页');
        window.location.href = '/';
        return;
      }
      
      // 如果当前是搜索页，尝试从URL获取参数
      if (window.location.pathname === '/search') {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        
        if (queryParam && queryParam.trim() !== '') {
          // 手动设置查询并触发搜索
          setQuery(queryParam);
          handleSearch(queryParam);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleSearch]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 在移动端，只有当showLeftSidebar为true时才显示侧边栏 */}
      {(!isMobile || showLeftSidebar) && (
        <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : ''}`}>
          <LeftSidebar onClose={() => setShowLeftSidebar(false)} />
          {isMobile && (
            <button 
              onClick={() => setShowLeftSidebar(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              aria-label="关闭侧边栏"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* 主要内容区域 */}
          <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-12 gap-4'} h-screen`}>
            {/* 在移动端显示的菜单按钮 */}
            {isMobile && !showLeftSidebar && (
              <button 
                onClick={() => setShowLeftSidebar(true)}
                className="fixed top-4 left-4 z-40 p-2 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-50"
                aria-label="打开菜单"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            )}
            
            {/* 3D知识图谱显示区域 - 在移动端和PC端使用不同的布局 */}
            <div className={`${isMobile ? 'flex-1' : 'col-span-9'} relative`}>
              <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${isMobile ? 'h-[60vh]' : 'h-full'} sticky top-0`}>
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

            {/* 文本显示区域 - 在移动端使用全宽设计 */}
            <div className={`${isMobile ? 'flex-1 h-[40vh]' : 'col-span-3 h-[calc(100vh-4rem)]'} overflow-y-auto custom-scrollbar`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {/* 在回答区域上方显示用户提问 - 添加更多安全检查 */}
                {initialQuery && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-semibold text-blue-700">您的提问</h3>
                    </div>
                    <p className="text-gray-800">{initialQuery}</p>
                  </div>
                )}
                
                {!initialQuery && !streamedAnswer && (
                  <div className="text-center py-8 text-gray-500">
                    <p>请在下方输入您想了解的问题</p>
                  </div>
                )}
                
                {/* 隐藏DeepThinking思考过程显示 */}
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
                  <div className="">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                      {streamedAnswer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部搜索区域 - 调整移动端的尺寸和位置 */}
          <div className={`fixed bottom-4 ${isMobile ? 'left-0 w-full px-4' : 'left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4'}`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
              <div className="flex items-center space-x-4">
                {/* 分享按钮 */}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center w-10 h-10 rounded-xl 
                         bg-black text-white shadow-md transition-all duration-300
                         hover:bg-gray-800 hover:shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="分享"
                >
                  <FontAwesomeIcon icon={faShare} className="w-4 h-4" />
                </button>
                
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder={isMobile ? "输入问题..." : defaultQuery}
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
        
        /* 移动端样式调整 */
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
}