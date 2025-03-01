import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faGraduationCap, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl transform -rotate-12 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section - 重新设计 */}
      <div className="container mx-auto px-4 pt-16 lg:pt-24 pb-32 relative">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-100">
            <span className="text-blue-700 font-medium">✨ 知识的可视化探索</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 text-transparent bg-clip-text leading-tight">
            用AI驱动的知识图谱<br />重塑思维方式
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            将零散的信息连接成网络化知识体系<br />
            让复杂概念清晰可见，让学习更加深入
          </p>
        </div>
        
        {/* 重新设计的搜索框 */}
        <div className={`max-w-2xl mx-auto relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative flex items-center bg-white border-2 border-blue-100 rounded-2xl shadow-lg shadow-blue-100/30 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，探索相关知识..."
              className="w-full px-6 py-5 text-lg bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="mr-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:shadow-md hover:shadow-blue-200"
            >
              <FontAwesomeIcon icon={faSearch} className="text-lg" />
              <span className="font-medium">探索</span>
            </button>
          </div>
        </div>

        {/* Quick Stats - 视觉上更加引人注目 */}
        <div className={`flex flex-wrap justify-center gap-8 mt-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-50 text-center min-w-[120px]">
            <div className="text-3xl font-bold text-blue-600 mb-1">100,000+</div>
            <div className="text-gray-600">知识节点</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-50 text-center min-w-[120px]">
            <div className="text-3xl font-bold text-indigo-600 mb-1">50,000+</div>
            <div className="text-gray-600">活跃用户</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-50 text-center min-w-[120px]">
            <div className="text-3xl font-bold text-purple-600 mb-1">1,000,000+</div>
            <div className="text-gray-600">知识连接</div>
          </div>
        </div>
      </div>

      {/* Features Section - 重新设计，修正功能描述 */}
      <div className="container mx-auto px-4 py-24 bg-white rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-gray-800 to-gray-700 text-transparent bg-clip-text">
          Think Graph 的核心优势
        </h2>
        <p className="text-xl text-gray-600 text-center mb-20 max-w-3xl mx-auto">
          我们专注于打造最直观、最高效的知识管理与学习体验
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-blue-800">AI驱动分析</h3>
            <p className="text-gray-700 leading-relaxed">
              先进的AI引擎自动分析文本内容，精准提取关键概念和知识点，构建有意义的知识连接，让复杂信息变得清晰可见。
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-indigo-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-indigo-800">知识图谱可视化</h3>
            <p className="text-gray-700 leading-relaxed">
              交互式知识图谱让抽象概念具象化，通过视觉化展示知识间的关联，帮助你快速理解复杂主题，建立系统性思维。
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
              <FontAwesomeIcon icon={faLink} className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-purple-800">智能知识关联</h3>
            <p className="text-gray-700 leading-relaxed">
              自动发现不同领域知识间的潜在联系，帮助你构建更加完整的知识体系，促进跨领域思考和创新。
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              开启你的知识探索之旅
            </h2>
            <p className="text-xl mb-12 opacity-90">
              加入thousands of learners已经开始使用 Think Graph 重新定义他们的学习方式
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faRocket} />
                立即开始
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
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

