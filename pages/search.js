import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiagramGenerator } from '../utils/diagram-generator';
import { processSearchResponse } from '../utils/data-processor';

const EnhancedChart = dynamic(() => import('../components/EnhancedChart'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading chart...</div>
});

const ContentViewer = dynamic(() => import('../components/ContentViewer'), {
  ssr: false,
  loading: () => <p>Loading content viewer...</p>
});

// 更新按钮布局
const contentTypes = [
  { id: 'answer', icon: '🤖', tooltip: 'AI回答' },
  { id: 'mindmap', icon: '🌳', tooltip: '思维导图' },
  { id: 'conceptmap', icon: '🎯', tooltip: '概念图' },
  { id: 'orgchart', icon: '📊', tooltip: '层级图' },
  { id: 'bracket', icon: '🔄', tooltip: '分类图' },
  { id: 'tagSphere', icon: '🌐', tooltip: '3D标签云' },
  { id: 'fluid', icon: '💫', tooltip: '流体动画' },
  { id: 'radar', icon: '📡', tooltip: '雷达图' },
  { id: 'geoBubble', icon: '🌍', tooltip: '地理图' },
  { id: 'network', icon: '🕸️', tooltip: '网络图' },
  { id: 'waveform', icon: '〰️', tooltip: '声波图' }
];

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [contentType, setContentType] = useState('answer');
  const [mermaidContent, setMermaidContent] = useState({
    flowchart: '',
    mindmap: '',
    fishbone: '',
    orgchart: '',
    conceptmap: '',
    bracket: ''
  });
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [reasoningProcess, setReasoningProcess] = useState('');
  const [selectedChartType, setSelectedChartType] = useState('tagSphere');
  const searchInputRef = useRef(null);

  // 添加处理下拉菜单的状态
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    console.log('=== 搜索开始 ===');
    console.log('查询内容:', searchQuery);
    console.log('深度思考模式:', useDeepThinking ? '开启' : '关闭');
    console.log('联网搜索:', useWebSearch ? '开启' : '关闭');
    
    setLoading(true);
    setStreamedAnswer('');
    setMermaidContent({ flowchart: '', mindmap: '', fishbone: '', orgchart: '', conceptmap: '', bracket: '' });
    setSearchResults(null);
    setReasoningProcess('');

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
        console.group('🔍 执行联网搜索');
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
      console.group('🤖 生成AI回答');
      console.log('准备发送聊天请求...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          context: useWebSearch ? searchResults : [],
          query: searchQuery,
          useDeepThinking
        }),
      });

      if (!chatResponse.ok) {
        console.error('❌ 聊天请求失败:', chatResponse.status);
        throw new Error(`HTTP error! status: ${chatResponse.status}`);
      }

      console.log('✅ 聊天请求成功，开始接收响应...');
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
                    if (parsed.content) {
                      const decodedContent = decodeURIComponent(parsed.content);
                      console.log('📝 收到推理过程:', decodedContent);
                      setReasoningProcess(prev => {
                        const newContent = prev.endsWith('\n') ? decodedContent : '\n' + decodedContent;
                        return prev + newContent;
                      });
                    }
                    break;
                  case 'delta':
                    if (parsed.content) {
                      const decodedContent = decodeURIComponent(parsed.content);
                      answer += decodedContent;
                      // 处理增量内容
                      setStreamedAnswer(processAnswer(answer));
                      tokenCount++;
                    }
                    break;
                  case 'complete':
                    console.log('收到 complete 信号');
                    if (parsed.content) {
                      console.log('开始处理完整回答...');
                      const completeAnswer = decodeURIComponent(parsed.content);
                      console.log('回答长度:', completeAnswer.length);
                      
                      // 处理完整回答
                      answer = completeAnswer;
                      setStreamedAnswer(processAnswer(answer));
                    }
                    break;
                  case 'end':
                    logApiStatus('Chat API', 'success', `生成完成，共 ${tokenCount} 个token`);
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
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [q, initialLoad, handleSearch]);

  // 添加一个函数来过滤Mermaid代码块
  const filterMermaidBlocks = (text) => {
    if (!text) return '';
    return text.replace(/```mermaid[\s\S]*?```/g, '').trim();
  };

  // 在处理回答内容时自动生成图表
  const processAnswer = (answer) => {
    // 生成图表
    const diagrams = DiagramGenerator.parseMarkdown(answer);
    
    // 更新状态
    setMermaidContent(diagrams);
    
    // 返回过滤后的文本
    return filterMermaidBlocks(answer);
  };

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
    }
  };

  // 处理图表类型切换
  const handleTypeChange = (typeId, parentId = null) => {
    if (parentId === 'enhanced') {
      setContentType(typeId);
      setDropdownOpen(false);
    } else {
      setContentType(typeId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D3047] to-[#93B7BE]">
      {/* 顶部导航栏 */}
      <nav className="bg-[#1B1B2F]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#E84855]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#E84855] to-[#F9DC5C] text-transparent bg-clip-text">Think Graph</span>
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-[#93B7BE]">
                <span className="hidden md:inline">Powered by</span>
                <span className="font-medium bg-gradient-to-r from-[#F9DC5C] to-[#E84855] text-transparent bg-clip-text">Deepseek</span>
              </div>
              <a
                href="https://discord.gg/yourdiscord"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#93B7BE] hover:text-[#F9DC5C] transition-colors"
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
          {/* 内容显示区域 */}
          <div className="lg:col-span-12">
            <div className="bg-[#1B1B2F]/90 backdrop-blur-sm rounded-xl shadow-lg border border-[#E84855]/10">
              {/* 图表切换工具栏 */}
              <div className="flex items-center justify-center p-4 border-b border-[#E84855]/10">
                <div className="flex items-center space-x-2 bg-[#2D3047] rounded-lg p-2">
                  <button
                    onClick={() => {
                      const currentIndex = contentTypes.findIndex(type => type.id === contentType);
                      const newIndex = currentIndex > 0 ? currentIndex - 1 : contentTypes.length - 1;
                      setContentType(contentTypes[newIndex].id);
                    }}
                    className="p-2 rounded-lg bg-[#93B7BE]/10 text-[#93B7BE] hover:bg-[#93B7BE]/20 transition-all"
                  >
                    ◀
                  </button>
                  
                  {contentTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`p-3 rounded-lg transition-all ${
                        contentType === type.id
                          ? 'bg-[#E84855] text-white shadow-lg scale-110'
                          : 'bg-[#93B7BE]/10 text-[#93B7BE] hover:bg-[#93B7BE]/20'
                      }`}
                      title={type.tooltip}
                    >
                      <span className="text-xl">{type.icon}</span>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => {
                      const currentIndex = contentTypes.findIndex(type => type.id === contentType);
                      const newIndex = currentIndex < contentTypes.length - 1 ? currentIndex + 1 : 0;
                      setContentType(contentTypes[newIndex].id);
                    }}
                    className="p-2 rounded-lg bg-[#93B7BE]/10 text-[#93B7BE] hover:bg-[#93B7BE]/20 transition-all"
                  >
                    ▶
                  </button>
                </div>
              </div>

              <div className="h-[calc(100vh-24rem)] overflow-auto p-6">
                {loading && !streamedAnswer ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : streamedAnswer ? (
                  contentType === 'answer' ? (
                    <div className="prose max-w-none">
                      {useDeepThinking && reasoningProcess && (
                        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-purple-700">💭 思考过程</h3>
                            <span className="text-sm text-purple-500">(DeepSeek R1)</span>
                          </div>
                          <div className="prose prose-purple max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {filterMermaidBlocks(reasoningProcess)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <div className={useDeepThinking && reasoningProcess ? "mt-6" : ""}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamedAnswer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : contentType.startsWith('enhanced') ? (
                    <EnhancedChart
                      chartData={searchResults}
                      initialType={contentType}
                      onChartUpdate={(data) => console.log('图表更新:', data)}
                    />
                  ) : (
                    <ContentViewer
                      content={mermaidContent[contentType]}
                      type="mermaid"
                      key={`${contentType}-${Object.values(mermaidContent).join('-')}`}
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
          <div className="bg-[#1B1B2F]/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E84855]/10 p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#93B7BE]">联网搜索</span>
                    <button
                      onClick={() => setUseWebSearch(!useWebSearch)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        useWebSearch ? 'bg-[#E84855]' : 'bg-[#93B7BE]/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useWebSearch ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#93B7BE]">深度思考</span>
                    <button
                      onClick={() => setUseDeepThinking(!useDeepThinking)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        useDeepThinking ? 'bg-[#F9DC5C]' : 'bg-[#93B7BE]/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useDeepThinking ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder={defaultQuery}
                  className="flex-1 p-3 border border-[#E84855]/20 rounded-xl focus:ring-2 focus:ring-[#E84855] focus:border-[#E84855] transition-all bg-[#2D3047]/50 text-white placeholder-[#93B7BE]"
                />
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-[#E84855] to-[#F9DC5C] text-white p-3 rounded-xl hover:from-[#F9DC5C] hover:to-[#E84855] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}