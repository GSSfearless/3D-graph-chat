import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // 添加refs用于滚动动画
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 计算视差效果
  const heroParallax = -scrollY * 0.2;
  const statsParallax = -(scrollY - 400) * 0.1;
  const featuresParallax = -(scrollY - 800) * 0.05;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      router.push(`/search?q=${query}&side=both`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/10 to-purple-100/10 rounded-full blur-3xl transform rotate-12 animate-pulse"
          style={{ transform: `rotate(12deg) translate3d(0, ${scrollY * 0.1}px, 0)` }}
        ></div>
        <div 
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/10 to-pink-100/10 rounded-full blur-3xl transform -rotate-12 animate-pulse delay-1000"
          style={{ transform: `rotate(-12deg) translate3d(0, ${-scrollY * 0.15}px, 0)` }}
        ></div>
      </div>

      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="container mx-auto px-4 pt-8 lg:pt-16 pb-24 relative"
        style={{ transform: `translate3d(0, ${heroParallax}px, 0)` }}
      >
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-medium">✨ 重新定义知识管理</span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text leading-tight tracking-tight">
            让知识<br />可视化探索
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Think Graph 帮助你将零散的知识点连接成网络<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">让学习更高效，让思维更清晰</span>
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto group px-4">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-purple-200/20 opacity-20 blur-3xl group-hover:opacity-30 transition-opacity rounded-[32px]"
            style={{ transform: `translate3d(0, ${-scrollY * 0.05}px, 0)` }}
          ></div>
          <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all duration-500">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，开始你的知识探索..."
              className="w-full px-8 py-7 text-lg rounded-[24px] bg-transparent border-2 border-transparent focus:border-blue-50/50 focus:ring-4 focus:ring-blue-50/30 transition-all duration-300 outline-none placeholder:text-gray-400"
            />
            <button
              onClick={handleSearch}
              className="mr-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-[16px] flex items-center gap-3 transition-all duration-500 transform hover:translate-x-1 hover:shadow-lg hover:shadow-blue-500/25 group/btn"
            >
              <span className="font-medium">探索</span>
              <FontAwesomeIcon icon={faSearch} className="text-base transition-transform duration-500 group-hover/btn:rotate-12" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div 
          ref={statsRef}
          className={`flex justify-center gap-12 mt-20 transform transition-all duration-1000 delay-500`}
          style={{ 
            transform: `translate3d(0, ${statsParallax}px, 0)`,
            opacity: Math.max(0, Math.min(1, 1 - (scrollY - 300) / 400))
          }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">100,000+</div>
            <div className="text-gray-500 mt-2 text-sm font-medium">知识节点</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">50,000+</div>
            <div className="text-gray-500 mt-2 text-sm font-medium">活跃用户</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">1,000,000+</div>
            <div className="text-gray-500 mt-2 text-sm font-medium">知识连接</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div 
        ref={featuresRef}
        className="container mx-auto px-4 py-24 relative"
        style={{ 
          transform: `translate3d(0, ${featuresParallax}px, 0)`,
          opacity: Math.max(0, Math.min(1, 1 - (scrollY - 600) / 400))
        }}
      >
        <h2 className="text-4xl lg:text-6xl font-bold text-center mb-24 bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
          为什么选择 Think Graph
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div 
            className="p-10 rounded-3xl bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            style={{ 
              transform: `translate3d(0, ${Math.max(0, (scrollY - 800) * 0.1)}px, 0)`,
              opacity: Math.max(0, Math.min(1, 1 - (scrollY - 800) / 400))
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-8">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">AI智能分析</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              强大的AI引擎自动分析文本内容，提取关键概念，构建知识连接，让知识管理更智能
            </p>
          </div>
          <div 
            className="p-10 rounded-3xl bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            style={{ 
              transform: `translate3d(0, ${Math.max(0, (scrollY - 900) * 0.1)}px, 0)`,
              opacity: Math.max(0, Math.min(1, 1 - (scrollY - 900) / 400))
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mb-8">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">实时可视化</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              直观的知识图谱展示，实时互动，帮助你快速理解和记忆复杂的知识体系
            </p>
          </div>
          <div 
            className="p-10 rounded-3xl bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            style={{ 
              transform: `translate3d(0, ${Math.max(0, (scrollY - 1000) * 0.1)}px, 0)`,
              opacity: Math.max(0, Math.min(1, 1 - (scrollY - 1000) / 400))
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mb-8">
              <FontAwesomeIcon icon={faMagicWandSparkles} className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">智能推荐</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              基于你的学习历史和兴趣，智能推荐相关知识点，帮助你拓展知识边界
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        ref={ctaRef}
        className="relative overflow-hidden"
        style={{ 
          opacity: Math.max(0, Math.min(1, 1 - (scrollY - 1200) / 400))
        }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-95"
          style={{ transform: `translate3d(0, ${Math.max(0, (scrollY - 1200) * 0.05)}px, 0)` }}
        ></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              开启你的知识探索之旅
            </h2>
            <p className="text-xl mb-12 opacity-90 font-light">
              加入数千名学习者的行列，重新定义你的学习方式
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="px-10 py-5 bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-3 border-2 border-white/20 backdrop-blur-xl"
              >
                <FontAwesomeIcon icon={faRocket} className="text-blue-600" />
                立即开始
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white rounded-2xl text-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                观看演示
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

