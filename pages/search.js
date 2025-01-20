import { faArrowRight, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <p>正在加载知识图谱...</p>
});

const NodeContentDialog = dynamic(() => import('../components/NodeContentDialog'), {
  ssr: false
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

// 添加布局选择器组件
const LayoutSelector = ({ currentLayout, onLayoutChange }) => {
  const layouts = [
    { id: 'thinkingCycle', name: '思考环', icon: '🔄' },
    { id: 'rightLogical', name: '逻辑树', icon: '🌲' },
    { id: 'mindMap', name: '思维导图', icon: '🧠' }
  ];

  return (
    <div className="absolute right-4 top-4 bg-white rounded-lg shadow-lg p-2 space-y-2 border border-gray-200 z-10">
      {layouts.map(layout => (
        <button
          key={layout.id}
          onClick={() => onLayoutChange(layout.id)}
          className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentLayout === layout.id
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
        >
          <span className="mr-2">{layout.icon}</span>
          <span className="text-sm">{layout.name}</span>
        </button>
      ))}
    </div>
  );
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
  const [currentLayout, setCurrentLayout] = useState('thinkingCycle');
  const [currentLang, setCurrentLang] = useState('en');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNodeContentVisible, setIsNodeContentVisible] = useState(false);
  const [cachedExplanations, setCachedExplanations] = useState(new Map());
  const [initialAnswerVisible, setInitialAnswerVisible] = useState(false);
  const [initialAnswerNode, setInitialAnswerNode] = useState(null);

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

    const maxRetries = 3;
    let retryCount = 0;

    async function tryRequest() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

        const response = await fetch('/api/rag-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchQuery }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if ((response.status === 504 || response.status === 500) && retryCount < maxRetries) {
            retryCount++;
            console.log(`重试第 ${retryCount} 次...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // 递增延迟
            return tryRequest();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const searchData = await response.json();
        if (!searchData || !searchData.results) {
          throw new Error('搜索结果格式无效');
        }

        setSearchResults(searchData.results);
        setIsCollecting(false);
        setIsProcessing(true);

        // Get AI answer with timeout
        const chatController = new AbortController();
        const chatTimeoutId = setTimeout(() => chatController.abort(), 30000);

        try {
          const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: searchData.results, query: searchQuery }),
            signal: chatController.signal
          });

          clearTimeout(chatTimeoutId);

          if (!chatResponse.ok) {
            throw new Error(`Chat API error! status: ${chatResponse.status}`);
          }

          const chatData = await chatResponse.json();
          
          if (!chatData || typeof chatData !== 'object') {
            throw new Error('回答格式无效');
          }
          
          if (!chatData.content || typeof chatData.content !== 'string') {
            throw new Error('回答内容无效');
          }
          
          if (!chatData.structure || typeof chatData.structure !== 'object') {
            throw new Error('知识图谱结构无效');
          }
          
          setStreamedAnswer(chatData.content);
          
          // 创建初始回答节点
          const initialNode = {
            id: 'initial-answer',
            data: {
              label: '完整回答',
              content: chatData.content,
              type: 'center'
            }
          };
          setInitialAnswerNode(initialNode);
          setInitialAnswerVisible(true);
          
          // 生成知识图谱
          const graphController = new AbortController();
          const graphTimeoutId = setTimeout(() => graphController.abort(), 30000);

          try {
            const graphResponse = await fetch('/api/knowledgeGraph', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ structure: chatData.structure }),
              signal: graphController.signal
            });

            clearTimeout(graphTimeoutId);

            if (!graphResponse.ok) {
              throw new Error(`Knowledge Graph API error! status: ${graphResponse.status}`);
            }

            const graphData = await graphResponse.json();
            
            if (!graphData || !graphData.nodes || !graphData.edges) {
              throw new Error('知识图谱数据无效');
            }

            setKnowledgeGraphData(graphData);
            const explanations = {};
            graphData.nodes.forEach(node => {
              if (node.data?.content) {
                explanations[node.id] = node.data.content;
              }
            });
            setNodeExplanations(explanations);
          } catch (error) {
            console.error('Error fetching knowledge graph:', error);
            if (error.name === 'AbortError') {
              setGraphError('知识图谱生成超时，请重试');
            } else {
              setGraphError('知识图谱生成失败，请稍后重试');
            }
          }

        } catch (error) {
          console.error('Chat API error:', error);
          if (error.name === 'AbortError') {
            throw new Error('回答生成超时，请重试');
          }
          throw error;
        }

      } catch (error) {
        console.error('Error during search:', error);
        if (error.name === 'AbortError') {
          setGraphError('请求超时，请重试');
        } else if (error.message.includes('504')) {
          setGraphError('服务暂时无响应，请稍后重试');
        } else {
          setGraphError(error.message || '搜索过程中出现错误，请重试');
        }
        setIsProcessing(false);
        setIsCollecting(false);
      }
    }

    try {
      await tryRequest();
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setIsCollecting(false);
    }
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

  const handleNodeClick = useCallback((node, cachedExplanation) => {
    setSelectedNode(node);
    setIsNodeContentVisible(true);
    if (cachedExplanation) {
      setCachedExplanations(prev => new Map(prev).set(node.id, cachedExplanation));
    }
  }, []);

  const handleCloseNodeContent = useCallback(() => {
    setIsNodeContentVisible(false);
  }, []);

  const handleNodeDragStop = useCallback((node) => {
    if (knowledgeGraphData) {
      const updatedNodes = knowledgeGraphData.nodes.map(n => 
        n.id === node.id ? { ...n, position: node.position } : n
      );
      setKnowledgeGraphData(prev => ({
        ...prev,
        nodes: updatedNodes
      }));
    }
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

  // 处理节点笔记
  const handleNodeNote = useCallback((nodeId, noteContent) => {
    // 更新节点的笔记
    if (knowledgeGraphData) {
      const updatedNodes = knowledgeGraphData.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              notes: [...(node.data.notes || []), noteContent]
            }
          };
        }
        return node;
      });

      setKnowledgeGraphData({
        ...knowledgeGraphData,
        nodes: updatedNodes
      });
    }
  }, [knowledgeGraphData]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="w-full h-full relative">
        <div className="absolute inset-0">
          {loading || expandingNode ? (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-gray-600">{loadingMessage}</p>
              </div>
            </div>
          ) : graphError ? (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <p className="text-red-500 text-center">{graphError}</p>
            </div>
          ) : knowledgeGraphData && knowledgeGraphData.nodes && knowledgeGraphData.nodes.length > 0 ? (
            <div className="w-full h-full relative">
              <LayoutSelector
                currentLayout={currentLayout}
                onLayoutChange={setCurrentLayout}
              />
              <div className="w-full h-full">
                <KnowledgeGraph
                  data={knowledgeGraphData}
                  onNodeClick={handleNodeClick}
                  onNodeDragStop={handleNodeDragStop}
                  onNodeDelete={handleNodeDelete}
                  layout={currentLayout}
                  onNodeNote={handleNodeNote}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <p className="text-gray-500">{getText('noGraphData')}</p>
            </div>
          )}
        </div>

        {/* 底部搜索框 */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
          <div className="bg-white p-2 rounded-lg shadow-md flex items-center border-2 border-gray-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400 group mx-4 relative">
            <div className="flex-grow pr-14">
              <textarea 
                placeholder={getText('searchPlaceholder')}
                className="w-full p-2 border-none outline-none text-xl group-hover:placeholder-blue-400 transition-colors duration-300 min-h-[2.5rem] whitespace-pre-wrap break-words overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
                value={query}
                onChange={(e) => {
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                  handleChange(e);
                }}
                onKeyPress={handleKeyPress}
                style={{ 
                  wordWrap: 'break-word',
                  resize: 'none',
                  maxHeight: '120px',
                  minHeight: '2.5rem',
                  height: 'auto'
                }}
                rows="1"
              />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 transform transition-transform duration-300 group-hover:scale-110 origin-center">
              <button 
                className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full h-10 w-10 flex items-center justify-center hover:from-blue-600 hover:to-yellow-600 transition-colors duration-300" 
                onClick={handleButtonClick}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
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

      <NodeContentDialog
        node={selectedNode || initialAnswerNode}
        isVisible={isNodeContentVisible || initialAnswerVisible}
        onClose={() => {
          if (selectedNode) {
            setIsNodeContentVisible(false);
            setSelectedNode(null);
          } else {
            setInitialAnswerVisible(false);
          }
        }}
        currentQuestion={currentQuestion}
        cachedExplanation={selectedNode ? cachedExplanations.get(selectedNode.id) : null}
        isInitialAnswer={!selectedNode && initialAnswerVisible}
      />
    </div>
  );
}