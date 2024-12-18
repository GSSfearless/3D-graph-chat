import { faArrowRight, faBrain, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
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
    ]
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
    ]
  }
};

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState('');
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

  const handleSearch = useCallback(async (searchQuery) => {
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

      // Get AI answer
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
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setStreamedAnswer((prev) => prev + chunkValue);
      }

      // Store the initial answer
      initialAnswerRef.current = streamedAnswer;

      // Get knowledge graph data
      try {
        const graphResponse = await fetch('/api/knowledgeGraph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (!graphResponse.ok) {
          throw new Error(`HTTP error! status: ${graphResponse.status}`);
        }

        const graphData = await graphResponse.json();
        
        // 确保 graphData 有正确的结构
        if (graphData && graphData.nodes && graphData.edges) {
          setKnowledgeGraphData(graphData);
        } else {
          console.error('Invalid graph data structure:', graphData);
          setGraphError('Invalid graph data structure');
        }
      } catch (error) {
        console.error('Error fetching knowledge graph:', error);
        setGraphError('Failed to load knowledge graph');
      }

      // After all processing is complete
      setIsProcessing(false);
      setIsCollecting(false);
      setQuery('');
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
    setQuery(e.target.value);
  }

  const handleLargeSearchChange = (e) => {
    setLargeSearchQuery(e.target.value);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleButtonClick = () => {
    handleSearch(query);
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

    if (knowledgeGraphData && knowledgeGraphData.nodes && knowledgeGraphData.nodes.length > 0) {
      if (node.id === knowledgeGraphData.nodes[0].id) {
        // If it's the root node, always show the initial answer
        setStreamedAnswer(initialAnswerRef.current);
        setViewingChildNode(false);
      } else {
        // If it's a child node
        setViewingChildNode(true);
        if (!nodeExplanations[node.id]) {
          // If explanation doesn't exist, fetch it
          try {
            const explanation = await generateNodeExplanation(node.id, node.data.label);
            setNodeExplanations(prev => ({...prev, [node.id]: explanation}));
            setStreamedAnswer(explanation);
          } catch (error) {
            console.error('Error fetching node explanation:', error);
            setStreamedAnswer('Failed to load explanation. Please try again.');
          }
        } else {
          // If explanation exists, just set it
          setStreamedAnswer(nodeExplanations[node.id]);
        }
      }
    } else {
      console.error('Knowledge graph data is incomplete or missing');
      setStreamedAnswer('Unable to load node information. Please try again.');
    }
  
    setIsLoadingNodeExplanation(false);
    setLoadingMessage('');
  }, [knowledgeGraphData, nodeExplanations, generateNodeExplanation, initialAnswerRef]);

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

  return (
    <div className="flex flex-row min-h-screen relative pb-20">
      <div className="w-full p-4 overflow-y-auto mb-16">
        <div className="flex space-x-4">
          <div className="w-1/2">
            <div className="bg-white p-6">
              <h3 className="text-4xl mb-6 text-center font-semibold">
                <FontAwesomeIcon icon={faBrain} className="text-blue-600 mr-2" />
                {q || getText('deepThink')}
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
                <div className="prose prose-lg max-w-none px-8">
                  <div 
                    dangerouslySetInnerHTML={{ __html: renderedAnswer }} 
                    className="text-lg leading-relaxed"
                    style={{
                      '& h3': { fontSize: '1.75rem', marginBottom: '1rem', marginTop: '2rem' },
                      '& p': { fontSize: '1.125rem', marginBottom: '1rem' },
                      '& ul': { marginLeft: '1.5rem', marginBottom: '1rem' },
                      '& li': { fontSize: '1.125rem', marginBottom: '0.5rem' },
                      '& strong': { color: '#2563EB' }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="w-1/2">
            <div className="bg-white p-6">
              <h3 className="text-4xl mb-6 text-center font-semibold">
                <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 mr-2" />
                {getText('graphInsight')}
              </h3>
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
        </div>
      </div>

      {showLargeSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl p-4">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300 transition-all duration-300 relative" style={{ height: '8rem' }}>
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowLargeSearch(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <input 
                type="text" 
                placeholder="Just ask..." 
                className="w-full p-4 border-none outline-none text-xl pl-16"
                value={largeSearchQuery}
                onChange={handleLargeSearchChange}
                onKeyPress={handleLargeSearchKeyPress}
                autoFocus
              />
              <button 
                className="bg-[#105C93] text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4 hover:bg-[#3A86C8] transition duration-300" 
                style={{ top: 'calc(50% - 1.5rem)' }}
                onClick={handleLargeSearch}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white p-2 rounded-lg shadow-md flex items-center border-2 border-gray-300 transition-all duration-300" style={{ height: '4rem' }}>
          <input 
            type="text" 
            placeholder={getText('searchPlaceholder')}
            className="w-full p-2 border-none outline-none text-xl"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-[#105C93] text-white rounded-full h-10 w-10 flex items-center justify-center absolute right-4 hover:bg-[#3A86C8] transition duration-300" 
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
}