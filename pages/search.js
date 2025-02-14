import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const ContentViewer = dynamic(() => import('../components/ContentViewer'), {
  ssr: false,
  loading: () => <p>Loading content viewer...</p>
});

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
  const [showLargeSearch, setShowLargeSearch] = useState(false);
  const [collectedPages, setCollectedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('🎨 Preparing the canvas...');
  const initialAnswerRef = useRef('');
  const [contentType, setContentType] = useState('markdown');
  const [mermaidContent, setMermaidContent] = useState('');

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

  const generateMermaidContent = (answer) => {
    // 从回答中提取关键信息并生成Mermaid图表
    const lines = answer.split('\n');
    let nodes = [];
    let relationships = [];
    
    // 简单的处理逻辑示例
    lines.forEach((line, index) => {
      if (line.startsWith('•') || line.startsWith('- ')) {
        const content = line.replace(/^[•-]\s+/, '').trim();
        nodes.push({
          id: `node${index}`,
          content: content
        });
        if (nodes.length > 1) {
          relationships.push({
            from: 'main',
            to: `node${index}`
          });
        }
      }
    });

    // 生成Mermaid语法
    let mermaidCode = 'graph TD\n';
    mermaidCode += '    main[回答]\n';
    
    // 添加节点
    nodes.forEach(node => {
      mermaidCode += `    ${node.id}["${node.content}"]\n`;
    });
    
    // 添加关系
    relationships.forEach(rel => {
      mermaidCode += `    ${rel.from} --> ${rel.to}\n`;
    });

    return mermaidCode;
  };

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setIsCollecting(true);
    setIsProcessing(false);
    setCollectedPages(0);
    setTotalPages(0);
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
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessage(prevMessage => {
          const currentIndex = loadingMessages.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (streamedAnswer) {
      // 生成并设置Mermaid内容
      const mermaidDiagram = generateMermaidContent(streamedAnswer);
      setMermaidContent(mermaidDiagram);
    }
  }, [streamedAnswer]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleLargeSearchChange = (e) => {
    setLargeSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query);
    }
  };

  const handleButtonClick = () => {
    if (query.trim()) {
      handleSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 左侧搜索区域 */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={defaultQuery}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleButtonClick}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              
              {/* 搜索结果和状态显示 */}
              {(isCollecting || isProcessing) && (
                <div className="text-sm text-gray-600">
                  {isCollecting ? (
                    <div>
                      <p>{loadingMessage}</p>
                      <p>已收集 {collectedPages} / {totalPages} 页</p>
                    </div>
                  ) : (
                    <p>{processingMessages[processingStep]}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 中间内容显示区域 */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded ${
                    contentType === 'markdown' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setContentType('markdown')}
                >
                  Markdown视图
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    contentType === 'mermaid' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setContentType('mermaid')}
                >
                  流程图视图
                </button>
              </div>
              
              <div className="h-[calc(100vh-200px)]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">{loadingMessage}</p>
                  </div>
                ) : (
                  <ContentViewer
                    content={contentType === 'markdown' ? streamedAnswer : mermaidContent}
                    type={contentType}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 右侧回答区域 */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedAnswer }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}