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
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [contentType, setContentType] = useState('answer');
  const [mermaidContent, setMermaidContent] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(true);

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setStreamedAnswer('');
    setMermaidContent('');
    setSearchResults([]);

    const logApiStatus = (api, status, details = '') => {
      const style = status === 'success' 
        ? 'color: #22c55e; font-weight: bold;'
        : status === 'error'
        ? 'color: #ef4444; font-weight: bold;'
        : 'color: #3b82f6; font-weight: bold;';
      
      console.log(
        `%c[${api}] ${status.toUpperCase()}${details ? ': ' + details : ''}`,
        style
      );
    };

    try {
      // 只在启用联网搜索时执行 RAG 搜索
      if (useWebSearch) {
        logApiStatus('RAG Search', 'start', '开始搜索相关内容');
        const searchResponse = await fetch(`/api/rag-search?query=${encodeURIComponent(searchQuery)}`);
        if (!searchResponse.ok) {
          logApiStatus('RAG Search', 'error', `HTTP ${searchResponse.status}`);
          throw new Error('搜索请求失败');
        }

        // 读取搜索响应流
        const searchReader = searchResponse.body.getReader();
        const searchDecoder = new TextDecoder();
        let searchResults = [];
        let searchResultCount = 0;

        try {
          while (true) {
            const { value, done } = await searchReader.read();
            if (done) break;

            const chunk = searchDecoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.result) {
                    searchResults.push(parsed.result);
                    searchResultCount++;
                  }
                } catch (e) {
                  logApiStatus('RAG Search', 'error', '解析搜索结果失败');
                  console.error('Search result parse error:', e);
                }
              }
            }
          }
          logApiStatus('RAG Search', 'success', `找到 ${searchResultCount} 条相关内容`);
        } finally {
          searchReader.releaseLock();
        }

        setSearchResults(searchResults);
      }

      // 发送聊天请求
      logApiStatus('Chat API', 'start', '开始生成回答');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          context: useWebSearch ? searchResults : [],
          query: searchQuery 
        }),
      });

      if (!chatResponse.ok) {
        logApiStatus('Chat API', 'error', `HTTP ${chatResponse.status}`);
        throw new Error(`HTTP error! status: ${chatResponse.status}`);
      }

      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      let buffer = '';
      let tokenCount = 0;

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
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (!parsed) continue;

                switch (parsed.type) {
                  case 'reasoning':
                  case 'answer':
                  case 'content':
                  case 'delta':
                    if (parsed.content) {
                      const decodedContent = decodeURIComponent(parsed.content);
                      answer += decodedContent;
                      setStreamedAnswer(answer);
                      tokenCount++;
                    }
                    break;
                  case 'complete':
                    if (parsed.content) {
                      const completeAnswer = decodeURIComponent(parsed.content);
                      if (completeAnswer.length > answer.length) {
                        answer = completeAnswer;
                        setStreamedAnswer(answer);
                      }
                    }
                    break;
                  case 'end':
                    logApiStatus('Chat API', 'success', `生成完成，共 ${tokenCount} 个token`);
                    // 自动生成思维导图
                    if (answer) {
                      logApiStatus('Mind Map', 'start', '开始生成思维导图');
                      try {
                        const response = await fetch('/api/generate-mindmap', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: answer }),
                        });

                        if (response.ok) {
                          const { mermaidCode } = await response.json();
                          if (mermaidCode) {
                            setMermaidContent(mermaidCode);
                            logApiStatus('Mind Map', 'success', '思维导图生成完成');
                          }
                        } else {
                          logApiStatus('Mind Map', 'error', `HTTP ${response.status}`);
                        }
                      } catch (error) {
                        logApiStatus('Mind Map', 'error', error.message);
                        console.error('Mind map generation error:', error);
                      }
                    }
                    break;
                }
              } catch (e) {
                logApiStatus('Chat API', 'error', '解析响应数据失败');
                console.error('Message parse error:', e, 'Raw data:', data);
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
  }, [useWebSearch]);

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
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="hidden md:inline">Powered by</span>
                <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Deepseek</span>
              </div>
              <a
                href="https://discord.gg/yourdiscord"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <span className="sr-only">Discord</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
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
                  思维导图
                </button>
              </div>
            </div>
          </div>

          {/* 内容显示区域 */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="h-[calc(100vh-24rem)] overflow-auto p-6">
                {loading && !streamedAnswer ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">联网搜索</span>
                  <button
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      useWebSearch ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useWebSearch ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}