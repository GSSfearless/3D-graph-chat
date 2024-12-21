import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <p>Loading knowledge graph...</p>
});

function sanitizeHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const allowedTags = ['h3', 'strong', 'ul', 'li', 'p'];
  const allowedAttributes = {};
  
  function sanitizeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        const text = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(text, node);
      } else {
        for (let i = node.attributes.length - 1; i >= 0; i--) {
          const attr = node.attributes[i];
          if (!(node.tagName.toLowerCase() in allowedAttributes) || 
              !allowedAttributes[node.tagName.toLowerCase()].includes(attr.name)) {
            node.removeAttribute(attr.name);
          }
        }
        Array.from(node.childNodes).forEach(sanitizeNode);
      }
    }
  }
  
  Array.from(temp.childNodes).forEach(sanitizeNode);
  return temp.innerHTML;
}

function renderMarkdown(text) {
  // Handle headings (only h3)
  text = text.replace(/^###\s(.*)$/gm, '<h3>$1</h3>');
  
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle unordered lists
  text = text.replace(/•\s(.*)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>(\n|$))+/g, '<ul>$&</ul>');
  
  // Handle paragraphs (excluding list items and headings)
  text = text.split('\n').map(line => {
    if (!line.startsWith('<h3>') && !line.startsWith('<li>') && !line.startsWith('<ul>') && line.trim() !== '') {
      return `<p>${line}</p>`;
    }
    return line;
  }).join('\n');
  
  return text;
}

// 添加语言检测函数
function detectLanguage(text) {
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const hasJapaneseChars = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
  const hasKoreanChars = /[\uac00-\ud7af\u1100-\u11ff]/.test(text);

  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  return 'en';
}

// 添加多语言文本
const i18n = {
  zh: {
    deepThink: '深度思考',
    graphInsight: '图谱洞察',
    loading: '加载中...',
    loadingGraph: '正在加载知识图谱...',
    noGraphData: '暂无知识图谱数据',
    searchPlaceholder: '输入你的问题...',
    defaultQuery: '生命、宇宙以及一切的答案是什么？',
    loadingMessages: [
      '🎨 准备画布...',
      '🧚 唤醒知识精灵...',
      '🏰 构建思维宫殿...',
      '🌌 连接知识星座...',
      '🧠 激活大脑神经元...',
      '🗺️ 绘制智慧蓝图...',
      '🔓 解锁知识宝库...',
      '🧙‍♀️ 召唤智慧女神...',
      '💡 点亮思维灯塔...',
      '🚀 启动知识引擎...'
    ],
    processingMessages: [
      "正在执行检索增强生成(RAG)...",
      "正在使用大语言模型(LLM)分析信息...",
      "正在整合搜索结果并生成答案...",
      "AI正在处理检索到的信息..."
    ],
    hiring: '招聘',
    hiringDesc: '加入我们，共同创造未来',
    discord: 'Discord',
    discordDesc: '加入我们的社区，与我们互动'
  },
  en: {
    deepThink: 'Deep Think',
    graphInsight: 'Graph Insight',
    loading: 'Loading...',
    loadingGraph: 'Loading knowledge graph...',
    noGraphData: 'No knowledge graph data available',
    searchPlaceholder: 'Just ask...',
    defaultQuery: 'What is the answer to life, the universe, and everything?',
    loadingMessages: [
      '🎨 Preparing the canvas...',
      '🧚 Awakening knowledge fairies...',
      '🏰 Constructing mind palace...',
      '🌌 Connecting knowledge constellation...',
      '🧠 Activating brain neurons...',
      '🗺️ Drawing wisdom blueprint...',
      '🔓 Unlocking knowledge vault...',
      '🧙‍♀️ Summoning wisdom goddess...',
      '💡 Illuminating thought lighthouse...',
      '🚀 Launching knowledge engine...'
    ],
    processingMessages: [
      "Performing Retrieval-Augmented Generation (RAG)...",
      "Analyzing information with Large Language Model (LLM)...",
      "Integrating search results and generating answer...",
      "AI processing retrieved information..."
    ],
    hiring: 'Hiring',
    hiringDesc: 'Join us to create the future',
    discord: 'Discord',
    discordDesc: 'Join our community and interact with us'
  }
};

export default function Search() {
  const router = useRouter();
  const { q, side = 'both' } = router.query;

  const [query, setQuery] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [largeSearchQuery, setLargeSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [renderedAnswer, setRenderedAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [graphError, setGraphError] = useState(null);
  const [showLargeSearch, setShowLargeSearch] = useState(false);
  const [expandingNode, setExpandingNode] = useState(null);
  const [graphHistory, setGraphHistory] = useState([]);
  const [graphFuture, setGraphFuture] = useState([]);
  const [hasPreviousGraph, setHasPreviousGraph] = useState(false);
  const [collectedPages, setCollectedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('🎨 Preparing the canvas...');
  const [nodeExplanations, setNodeExplanations] = useState({});
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isLoadingNodeExplanation, setIsLoadingNodeExplanation] = useState(false);
  const initialAnswerRef = useRef('');
  const [viewingChildNode, setViewingChildNode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('radialTree');
  const [currentLang, setCurrentLang] = useState('en');

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  const loadingMessages = [
    '🎨 Preparing the canvas...',
    '🧚 Awakening knowledge fairies...',
    '🏰 Constructing mind palace...',
    '🌌 Connecting knowledge constellation...',
    '🧠 Activating brain neurons...',
    '🗺️ Drawing wisdom blueprint...',
    '🔓 Unlocking knowledge vault...',
    '🧙‍♀️ Summoning wisdom goddess...',
    '💡 Illuminating thought lighthouse...',
    '🚀 Launching knowledge engine...'
  ];

  const processingMessages = [
    "Performing Retrieval-Augmented Generation (RAG)...",
    "Analyzing information with Large Language Model (LLM)...",
    "Integrating search results and generating answer...",
    "AI processing retrieved information..."
  ];

  // 监听路由参数变化，更新当前问题
  useEffect(() => {
    if (q) {
      setCurrentQuestion(q);
    }
  }, [q]);

  const handleSearch = useCallback(async (searchQuery) => {
    setQuery('');
    setStreamedAnswer('');
    setRenderedAnswer('');
    setKnowledgeGraphData(null);
    setCurrentQuestion(searchQuery);
    setLoading(true);
    setIsCollecting(true);
    setIsProcessing(false);
    setCollectedPages(0);
    setTotalPages(0);
    setGraphError(null);
    setSearchResults([]);

    try {
      const eventSource = new EventSource(`/api/rag-search?query=${encodeURIComponent(searchQuery)}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.done) {
          eventSource.close();
          setIsCollecting(false);
          setIsProcessing(true);
        } else {
          setCollectedPages(data.progress);
          setTotalPages(data.total);
          setSearchResults(prev => [...prev, data.result]);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setIsCollecting(false);
        setIsProcessing(false);
      };

      // Get AI answer with streaming
      setStreamedAnswer('');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchResults, query: searchQuery }),
      });

      if (!chatResponse.ok) {
        throw new Error(`HTTP error! status: ${chatResponse.status}`);
      }

      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            if (data.type === 'structure') {
              // 使用结构数据生成知识图谱
              try {
                const graphResponse = await fetch('/api/knowledgeGraph', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ structure: data.data }),
                });

                if (!graphResponse.ok) {
                  throw new Error(`HTTP error! status: ${graphResponse.status}`);
                }

                const graphData = await graphResponse.json();
                if (graphData && graphData.nodes && graphData.edges) {
                  setKnowledgeGraphData(graphData);
                  const explanations = {};
                  graphData.nodes.forEach(node => {
                    if (node.data.content) {
                      explanations[node.id] = node.data.content;
                    }
                  });
                  setNodeExplanations(explanations);
                }
              } catch (error) {
                console.error('Error fetching knowledge graph:', error);
                setGraphError('Failed to load knowledge graph');
              }
            } else if (data.type === 'content') {
              // 累积内容数据
              setStreamedAnswer(prev => prev + data.data);
            } else if (data.type === 'error') {
              console.error('Error from chat API:', data.error);
              setStreamedAnswer(data.content);
            }
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }

      // After all processing is complete
      setIsProcessing(false);
      setIsCollecting(false);
      setCollectedPages(0);
      setTotalPages(0);
    } catch (error) {
      console.error('Error during search:', error);
      setIsProcessing(false);
      setIsCollecting(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingStep((prev) => (prev + 1) % processingMessages.length);
      }, 2000); // Switch every 2 seconds
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    let interval;
    if (loading || expandingNode) {
      interval = setInterval(() => {
        setLoadingMessage(prevMessage => {
          const currentIndex = loadingMessages.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, expandingNode]);

  useEffect(() => {
    console.log('Search component mounted');
    if (initialLoad && q) {
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [initialLoad, q, handleSearch]);

  useEffect(() => {
    if (streamedAnswer) {
      const markdown = renderMarkdown(streamedAnswer);
      const sanitized = sanitizeHtml(markdown);
      setRenderedAnswer(sanitized);
    }
  }, [streamedAnswer]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.trim() !== '') {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    } else {
      e.target.style.height = '2.5rem'; // 重置为默认高度
    }
    setQuery(value);
  }

  const handleLargeSearchChange = (e) => {
    const value = e.target.value;
    if (value.trim() !== '') {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    } else {
      e.target.style.height = '3rem'; // 重置为默认高度
    }
    setLargeSearchQuery(value);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (query.trim() === '') {
        e.preventDefault(); // 阻止空输入时的回车键默认行为
        return;
      }
      e.preventDefault();
      // 重置搜索框高度
      const textarea = e.target;
      textarea.style.height = '2.5rem';
      handleSearch(query);
    }
  }

  const handleButtonClick = () => {
    if (query.trim() !== '') {
      // 重置搜索框高度
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '2.5rem';
      }
      handleSearch(query);
    }
  }

  const handleLargeSearch = () => {
    if (largeSearchQuery.trim() !== '') {
      handleSearch(largeSearchQuery);
      setShowLargeSearch(false);
      setLargeSearchQuery('');
    }
  };

  const handleLargeSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (largeSearchQuery.trim() === '') {
        e.preventDefault(); // 阻止空输入时的回车键默认行为
        return;
      }
      e.preventDefault();
      // 重置搜索框高度
      const textarea = e.target;
      textarea.style.height = '3rem';
      handleLargeSearch();
    }
  };

  const generateNodeExplanation = useCallback(async (nodeId, label) => {
    try {
      const response = await fetch('/api/nodeExplanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodeId, 
          label, 
          graphData: knowledgeGraphData 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.explanation;
    } catch (error) {
      console.error('Error generating node explanation:', error);
      return `Unable to generate explanation for "${label}".`;
    }
  }, [knowledgeGraphData]);

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNodeId(node.id);
    setIsLoadingNodeExplanation(true);
    setLoadingMessage('Loading explanation...');

    if (node.id === 'root') {
      // 如果是根节点，显示完整答案
      setStreamedAnswer(initialAnswerRef.current);
      setViewingChildNode(false);
    } else {
      // 如果是子节点，显示该节点的内容
      setViewingChildNode(true);
      const explanation = nodeExplanations[node.id];
      if (explanation) {
        setStreamedAnswer(explanation);
      } else {
        setStreamedAnswer('No detailed explanation available for this node.');
      }
    }

    setIsLoadingNodeExplanation(false);
    setLoadingMessage('');
  }, [nodeExplanations, initialAnswerRef]);

  const handleNodeDragStop = useCallback((node) => {
    setGraphHistory(prev => {
      const newHistory = [...prev, knowledgeGraphData];
      setHasPreviousGraph(newHistory.length > 0);
      return newHistory;
    });
    setGraphFuture([]); // Clear future states
    setKnowledgeGraphData(prevData => {
      const updatedNodes = prevData.nodes.map(n => 
        n.id === node.id ? { ...n, position: node.position } : n
      );
      return { ...prevData, nodes: updatedNodes };
    });
  }, [knowledgeGraphData]);

  const handleNodeDelete = useCallback((node) => {
    setGraphHistory(prev => {
      const newHistory = [...prev, knowledgeGraphData];
      setHasPreviousGraph(newHistory.length > 0);
      return newHistory;
    });
    setGraphFuture([]); // Clear future states
    setKnowledgeGraphData(prevData => {
      const updatedNodes = prevData.nodes.filter(n => n.id !== node.id);
      const updatedEdges = prevData.edges.filter(e => e.source !== node.id && e.target !== node.id);
      return { nodes: updatedNodes, edges: updatedEdges };
    });
  }, [knowledgeGraphData]);

  const handleUndo = useCallback(() => {
    if (graphHistory.length > 0) {
      const previousState = graphHistory[graphHistory.length - 1];
      setGraphFuture(prev => [knowledgeGraphData, ...prev]);
      setKnowledgeGraphData(previousState);
      setGraphHistory(prev => {
        const newHistory = prev.slice(0, -1);
        setHasPreviousGraph(newHistory.length > 0);
        return newHistory;
      });
    }
  }, [graphHistory, knowledgeGraphData]);

  const handleRedo = useCallback(() => {
    if (graphFuture.length > 0) {
      const nextState = graphFuture[0];
      setGraphHistory(prev => {
        const newHistory = [...prev, knowledgeGraphData];
        setHasPreviousGraph(true);
        return newHistory;
      });
      setKnowledgeGraphData(nextState);
      setGraphFuture(prev => prev.slice(1));
    }
  }, [graphFuture, knowledgeGraphData]);

  const handleReturnToInitialResult = useCallback(() => {
    setStreamedAnswer(initialAnswerRef.current);
    setViewingChildNode(false);
  }, [initialAnswerRef]);

  const handleLayoutChange = useCallback((newLayout) => {
    setCurrentLayout(newLayout);
    if (knowledgeGraphData) {
      const newGraphData = relayoutGraph(knowledgeGraphData.nodes, knowledgeGraphData.edges, newLayout);
      setKnowledgeGraphData(newGraphData);
    }
  }, [knowledgeGraphData]);

  useEffect(() => {
    console.log('knowledgeGraphData updated:', knowledgeGraphData);
  }, [knowledgeGraphData]);

  // 更新语言检测逻辑
  useEffect(() => {
    if (q) {
      const detectedLang = detectLanguage(q);
      setCurrentLang(detectedLang);
    }
  }, [q]);

  // 获取当前语言的文本
  const getText = useCallback((key) => {
    return i18n[currentLang]?.[key] || i18n.en[key];
  }, [currentLang]);

  // 在组件加载时检测语言
  useEffect(() => {
    if (q) {
      const detectedLang = detectLanguage(q);
      setCurrentLang(detectedLang);
    } else {
      // 如果没有查询参数，尝试从浏览器语言设置中检测
      const browserLang = navigator.language.toLowerCase();
      setCurrentLang(browserLang.startsWith('zh') ? 'zh' : 'en');
    }
  }, [q]);

  return (
    <div className="flex flex-row min-h-screen relative pb-20">
      <div className="w-full p-4 overflow-y-auto mb-16">
        <div className="flex space-x-4">
          <div className="w-1/2">
            <div className="bg-white p-6">
              {loading || expandingNode ? (
                <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">{loadingMessage}</p>
                  </div>
                </div>
              ) : graphError ? (
                <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-red-500 text-center">{graphError}</p>
                </div>
              ) : knowledgeGraphData && knowledgeGraphData.nodes && knowledgeGraphData.nodes.length > 0 ? (
                <div className="h-[600px] rounded-lg border border-gray-200">
                  <KnowledgeGraph 
                    data={knowledgeGraphData} 
                    onNodeClick={handleNodeClick}
                    onNodeDragStop={handleNodeDragStop}
                    onNodeDelete={handleNodeDelete}
                    layout={currentLayout}
                  />
                </div>
              ) : (
                <div className="h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">{getText('noGraphData')}</p>
                </div>
              )}
              <div className="flex justify-center mt-4 space-x-2">
                <button 
                  onClick={handleUndo} 
                  disabled={!hasPreviousGraph}
                  className="text-2xl opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30"
                  title="Undo last action"
                >
                  ↩️
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={graphFuture.length === 0}
                  className="text-2xl opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30"
                  title="Redo next action"
                >
                  ↪️
                </button>
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="bg-white p-6">
              <h3 className="text-3xl mb-6 text-left font-semibold break-words whitespace-pre-wrap" style={{
                fontSize: currentQuestion.length > 100 ? '1.5rem' : currentQuestion.length > 50 ? '1.875rem' : '2.25rem',
                lineHeight: '1.4',
                maxWidth: '100%'
              }}>
                {currentQuestion}
              </h3>
              {viewingChildNode && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={handleReturnToInitialResult}
                    className="text-3xl hover:scale-110 transition-transform duration-200 focus:outline-none"
                    title="Return to initial result"
                  >
                    🔙
                  </button>
                </div>
              )}
              {isLoadingNodeExplanation ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <p className="text-sm text-gray-500 text-center mt-2">{loadingMessage}</p>
                </div>
              ) : (
                <div className="prose max-w-none px-8">
                  <div 
                    dangerouslySetInnerHTML={{ __html: renderedAnswer }} 
                    className="text-base leading-normal"
                    style={{
                      '& h3': { fontSize: '1.5rem', marginBottom: '0.75rem', marginTop: '1.5rem' },
                      '& p': { fontSize: '1rem', marginBottom: '0.75rem' },
                      '& ul': { marginLeft: '1.25rem', marginBottom: '0.75rem' },
                      '& li': { fontSize: '1rem', marginBottom: '0.25rem' },
                      '& strong': { color: '#2563EB' }
                    }}
                  />
                </div>
              )}
              {!streamedAnswer && query && (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLargeSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl p-4">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300 transition-all duration-300 relative" style={{ minHeight: '8rem' }}>
              <button 
                className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowLargeSearch(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex-grow pl-16 pr-14">
                <textarea 
                  placeholder="Just ask..." 
                  className="w-full p-4 border-none outline-none text-xl whitespace-pre-wrap break-words overflow-hidden"
                  value={largeSearchQuery}
                  onChange={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                    handleLargeSearchChange(e);
                  }}
                  onKeyPress={handleLargeSearchKeyPress}
                  autoFocus
                  style={{ 
                    wordWrap: 'break-word',
                    resize: 'none',
                    minHeight: '3rem',
                    height: 'auto'
                  }}
                  rows="1"
                />
              </div>
              <button 
                className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4 hover:from-blue-600 hover:to-yellow-600 transition duration-300" 
                style={{ top: '1rem' }}
                onClick={handleLargeSearch}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white p-2 rounded-lg shadow-md flex items-center border-2 border-gray-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400 group" style={{ minHeight: '4rem' }}>
          <div className="flex-grow pr-14">
            <textarea 
              placeholder={getText('searchPlaceholder')}
              className="w-full p-2 border-none outline-none text-xl group-hover:placeholder-blue-400 transition-colors duration-300 min-h-[2.5rem] whitespace-pre-wrap break-words overflow-hidden"
              value={query}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              style={{ 
                wordWrap: 'break-word',
                resize: 'none',
                minHeight: '2.5rem',
                height: 'auto'
              }}
              rows="1"
            />
          </div>
          <button 
            className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full h-10 w-10 flex items-center justify-center absolute right-4 hover:from-blue-600 hover:to-yellow-600 transition duration-300 group-hover:scale-110" 
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        {/* Hiring Link */}
        <div className="group relative">
          <Link href="/we-are-hiring">
            <a className="block bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <span className="text-2xl">🪐</span>
            </a>
          </Link>
          <div className="absolute right-full mr-2 bottom-0 bg-white p-4 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap">
            <h4 className="text-lg font-medium text-gray-800">{getText('hiring')}</h4>
            <p className="text-sm text-gray-600">{getText('hiringDesc')}</p>
          </div>
        </div>

        {/* Discord Link */}
        <div className="group relative">
          <a 
            href="https://discord.gg/G66pESH3gm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-2xl">🍻</span>
          </a>
          <div className="absolute right-full mr-2 bottom-0 bg-white p-4 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap">
            <h4 className="text-lg font-medium text-gray-800">{getText('discord')}</h4>
            <p className="text-sm text-gray-600">{getText('discordDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}