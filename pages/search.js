import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
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
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [collectedPages, setCollectedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('🎨 Preparing the canvas...');
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
    let currentTopic = null;
    
    // 处理每一行
    lines.forEach((line, index) => {
      // 清理行内容
      const cleanLine = line.trim();
      
      // 跳过空行
      if (!cleanLine) return;
      
      // 处理标题作为主题
      if (cleanLine.startsWith('#')) {
        currentTopic = {
          id: `topic${index}`,
          content: cleanLine.replace(/^#+\s+/, '').trim()
        };
        nodes.push(currentTopic);
      }
      // 处理列表项
      else if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
        const content = cleanLine.replace(/^[•-]\s+/, '').trim();
        // 确保内容不为空
        if (content) {
          nodes.push({
            id: `node${index}`,
            content: content,
            parentId: currentTopic ? currentTopic.id : 'main'
          });
        }
      }
    });

    // 如果没有提取到任何节点，创建一个默认节点
    if (nodes.length === 0) {
      nodes.push({
        id: 'main',
        content: '主要内容',
        parentId: null
      });
    }

    // 生成Mermaid语法
    let mermaidCode = 'graph TD\n';
    
    // 添加节点
    nodes.forEach(node => {
      // 使用双引号包裹内容，避免特殊字符问题
      const safeContent = node.content.replace(/"/g, '\\"');
      mermaidCode += `    ${node.id}["${safeContent}"]\n`;
    });
    
    // 添加关系
    nodes.forEach(node => {
      if (node.parentId) {
        mermaidCode += `    ${node.parentId} --> ${node.id}\n`;
      }
    });

    console.log('Generated Mermaid code:', mermaidCode);
    return mermaidCode;
  };

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setIsCollecting(true);
    setIsProcessing(false);
    setCollectedPages(0);
    setTotalPages(0);
    setSearchResults([]);
    setStreamedAnswer('');
    setMermaidContent('');

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
      let answer = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkValue = decoder.decode(value);
        answer += chunkValue;
        setStreamedAnswer(answer);
      }

      // 生成Mermaid图表
      const mermaidDiagram = generateMermaidContent(answer);
      setMermaidContent(mermaidDiagram);

      // 完成处理
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
  }, [searchResults]);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingStep((prev) => (prev + 1) % processingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, processingMessages.length]);

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
  }, [loading, loadingMessages]);

  useEffect(() => {
    if (q && initialLoad) {
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [q, initialLoad, handleSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Think Graph</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧搜索区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                  placeholder={defaultQuery}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => handleSearch(query)}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              
              {/* 状态显示 */}
              {(isCollecting || isProcessing) && (
                <div className="mt-4 text-sm text-gray-600">
                  {isCollecting ? (
                    <div>
                      <p className="font-medium">{loadingMessage}</p>
                      <p>已收集 {collectedPages} / {totalPages} 页</p>
                    </div>
                  ) : (
                    <p className="font-medium">{processingMessages[processingStep]}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 中间内容显示区域 */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex p-4">
                  <button
                    className={`px-4 py-2 rounded-lg mr-2 ${
                      contentType === 'markdown'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setContentType('markdown')}
                  >
                    Markdown视图
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      contentType === 'mermaid'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setContentType('mermaid')}
                  >
                    流程图视图
                  </button>
                </div>
              </div>
              
              <div className="p-4" style={{ minHeight: '500px' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-lg">{loadingMessage}</p>
                  </div>
                ) : streamedAnswer ? (
                  <ContentViewer
                    content={contentType === 'markdown' ? streamedAnswer : mermaidContent}
                    type={contentType}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">在左侧输入问题开始查询</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧参考资料区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">参考资料</h3>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <p className="font-medium">{result.title}</p>
                    <p className="mt-1">{result.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}