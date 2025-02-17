import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [contentType, setContentType] = useState('answer');
  const [mermaidContent, setMermaidContent] = useState('');
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);

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
        alert('搜索资料时出错，请重试');
      };

      // 发送聊天请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchResults, query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      let buffer = '';

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                switch (parsed.type) {
                  case 'start':
                    // 开始接收数据
                    break;
                  case 'reasoning':
                    answer += `### 思维过程：\n${decodeURIComponent(parsed.content)}\n\n`;
                    setStreamedAnswer(answer);
                    break;
                  case 'answer':
                    answer += `### 最终回答：\n${decodeURIComponent(parsed.content)}\n\n`;
                    setStreamedAnswer(answer);
                    break;
                  case 'content':
                    answer += decodeURIComponent(parsed.content);
                    setStreamedAnswer(answer);
                    break;
                  case 'delta':
                    answer += decodeURIComponent(parsed.content);
                    setStreamedAnswer(answer);
                    break;
                  case 'error':
                    throw new Error(parsed.message);
                  case 'end':
                    // 生成 Mermaid 图表
                    const mermaidDiagram = generateMermaidContent(answer);
                    setMermaidContent(mermaidDiagram);
                    break;
                }
              } catch (e) {
                console.error('Error parsing message:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        throw error;
      } finally {
        reader.releaseLock();
      }

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
      alert(error.message === 'Failed to fetch' ? '连接服务器失败，请检查网络连接' : '搜索过程中出错，请重试');
    }
    setLoading(false);
  }, [searchResults]);

  const generateMindMap = async () => {
    if (!streamedAnswer) return;
    
    setIsGeneratingMindMap(true);
    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: streamedAnswer,
          model: 'deepseek-chat'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { mermaidCode } = await response.json();
      if (mermaidCode) {
        setMermaidContent(mermaidCode);
        setContentType('mermaid');
      } else {
        throw new Error('No mermaid code received');
      }
    } catch (error) {
      console.error('Error generating mind map:', error);
      // 显示错误提示
      alert('生成思维导图时出错，请重试');
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Think Graph</span>
                </a>
              </div>
              <div className="hidden md:flex md:ml-6 space-x-4">
                <a href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  首页
                </a>
                <a href="/search" className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all">
                  智能搜索
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="hidden md:inline">Powered by</span>
                <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">OpenAI</span>
              </div>
              <a
                href="https://github.com/yourusername/think-graph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 视图切换按钮区域 */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-center space-x-4">
                <button
                  className={`px-6 py-2 rounded-lg transition-all ${
                    contentType === 'answer'
                      ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setContentType('answer')}
                >
                  AI回答
                </button>
                <button
                  className={`px-6 py-2 rounded-lg transition-all ${
                    contentType === 'mermaid'
                      ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setContentType('mermaid')}
                >
                  流程图
                </button>
                <button
                  className={`px-6 py-2 rounded-lg transition-all ${
                    isGeneratingMindMap
                      ? 'bg-gray-300 cursor-not-allowed'
                      : streamedAnswer
                      ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={generateMindMap}
                  disabled={isGeneratingMindMap || !streamedAnswer}
                >
                  {isGeneratingMindMap ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      生成中...
                    </span>
                  ) : (
                    '生成思维导图'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 内容显示区域 */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="h-[calc(100vh-24rem)] overflow-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500 text-lg">{loadingMessage}</p>
                    </div>
                  </div>
                ) : streamedAnswer ? (
                  contentType === 'answer' ? (
                    <div className="prose max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamedAnswer}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <ContentViewer
                      content={mermaidContent}
                      type="mermaid"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">在下方输入问题开始查询</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部搜索区域 */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder={defaultQuery}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50"
              />
              <button
                onClick={() => handleSearch(query)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
              </button>
            </div>
            
            {/* 状态显示 */}
            {(isCollecting || isProcessing) && (
              <div className="mt-3 text-sm text-gray-600">
                {isCollecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <div>
                      <p className="font-medium">{loadingMessage}</p>
                      <p>已收集 {collectedPages} / {totalPages} 页</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse h-4 w-4 rounded-full bg-blue-500"></div>
                    <p className="font-medium">{processingMessages[processingStep]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}