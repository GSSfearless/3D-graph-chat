import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (query.trim() !== '') {
      setIsSearching(true);
      try {
        await router.push(`/search?q=${encodeURIComponent(query)}&side=both`);
      } catch (error) {
        console.error('搜索跳转错误:', error);
        setIsSearching(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform rotate-12 animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl transform -rotate-12 animate-[pulse_4s_ease-in-out_infinite_1s]"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-6 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600 font-medium">🎉 欢迎使用 Think Graph</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text leading-tight">
            用AI重新定义<br className="hidden sm:block" />知识管理方式
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            将零散的知识点连接成完整的知识网络<br className="hidden sm:block" />
            让思维可视化，让学习更高效
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto px-4 relative">
          <div className="relative flex items-center bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.05)] group-hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，开始你的知识探索..."
              className="w-full px-4 sm:px-8 py-3 sm:py-5 text-base sm:text-lg rounded-full bg-transparent border-2 border-transparent focus:border-blue-100 focus:ring-2 focus:ring-blue-50 transition-all outline-none"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 transition-all transform hover:translate-x-1 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0"
            >
              <span className="hidden sm:inline font-medium">
                {isSearching ? '搜索中...' : '开始探索'}
              </span>
              <FontAwesomeIcon 
                icon={faSearch} 
                className={`text-lg transition-transform group-hover:scale-110 ${isSearching ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 px-4">
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">100,000+</div>
            <div className="text-gray-600 mt-2">知识节点</div>
          </div>
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600">50,000+</div>
            <div className="text-gray-600 mt-2">活跃用户</div>
          </div>
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">1,000,000+</div>
            <div className="text-gray-600 mt-2">知识连接</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
          为什么选择 Think Graph
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI智能分析</h3>
            <p className="text-gray-600 leading-relaxed">
              强大的AI引擎自动分析文本内容，提取关键概念，构建知识连接，让知识管理更智能
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">实时可视化</h3>
            <p className="text-gray-600 leading-relaxed">
              直观的知识图谱展示，实时互动，帮助你快速理解和记忆复杂的知识体系
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faMagicWandSparkles} className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">智能推荐</h3>
            <p className="text-gray-600 leading-relaxed">
              基于你的学习历史和兴趣，智能推荐相关知识点，帮助你拓展知识边界
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              开启你的知识探索之旅
            </h2>
            <p className="text-xl mb-12 opacity-90">
              已有超过5万名学习者正在使用 Think Graph 重新定义他们的学习方式
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faSearch} />
                立即开始
              </button>
              <a
                href="https://docs.thinkgraph.ai/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                观看演示
                <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

