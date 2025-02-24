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

  const [graphControls, setGraphControls] = useState({
    nodeSize: 50,
    edgeWidth: 2,
    edgeAnimated: true
  });

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
  };

  const handleGraphControlsChange = (controls) => {
    setGraphControls(controls);
    // 这里可以根据需要更新图表的样式
    if (graphData) {
      const updatedGraphData = {
        ...graphData,
        nodes: graphData.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            size: controls.nodeSize
          }
        })),
        edges: graphData.edges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            width: controls.edgeWidth,
            animated: controls.edgeAnimated
          }
        }))
      };
      setGraphData(updatedGraphData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleSubmit}
              placeholder={defaultQuery}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ref={searchInputRef}
            />
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>

      <main className="w-full">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* 左侧边栏 */}
          <LeftSidebar onControlsChange={handleGraphControlsChange} />

          {/* 主要内容区域 */}
          <div className="flex-1 grid grid-cols-12 gap-4 p-4">
            {/* 3D知识图谱显示区域 */}
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
                    <p className="text-gray-400">在上方输入问题开始查询</p>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧文本显示区域 */}
            <div className="col-span-3 space-y-4 overflow-y-auto">
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
      </main>
    </div>
  );
}