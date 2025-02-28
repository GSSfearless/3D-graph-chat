import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles, faGears, faUserGroup, faInfinity } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import Image from 'next/image';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

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

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-32 relative">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-medium">🎉 重新定义知识管理 | Think Graph</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text leading-tight">
            AI驱动的知识图谱平台<br />
            让知识管理更智能
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            结合AI与知识图谱技术，将零散知识转化为系统化的知识网络<br />
            让学习更高效，让思维更清晰
          </p>
        </div>

        {/* Search Bar */}
        <div className={`max-w-2xl mx-auto relative group transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-purple-200/50 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity rounded-full"></div>
          <div className="relative flex items-center bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.05)] group-hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，开始你的知识探索之旅..."
              className="w-full px-8 py-5 text-lg rounded-full bg-transparent border-2 border-transparent focus:border-blue-100 focus:ring-2 focus:ring-blue-50 transition-all outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all transform hover:translate-x-1 hover:shadow-lg group"
            >
              <span className="hidden md:inline font-medium">开始探索</span>
              <FontAwesomeIcon icon={faSearch} className="text-lg transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`flex justify-center gap-8 mt-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">100,000+</div>
            <div className="text-gray-600">知识节点</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">50,000+</div>
            <div className="text-gray-600">活跃用户</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">1,000,000+</div>
            <div className="text-gray-600">知识连接</div>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
          为什么选择 Think Graph
        </h2>
        <p className="text-xl text-gray-600 text-center mb-20 max-w-3xl mx-auto">
          我们将AI技术与知识图谱完美结合，打造最智能的知识管理平台
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI智能分析</h3>
            <p className="text-gray-600 leading-relaxed">
              采用最新的大语言模型技术，自动分析文本内容，提取关键概念，构建知识连接，让知识管理更智能高效
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">知识图谱可视化</h3>
            <p className="text-gray-600 leading-relaxed">
              独特的3D知识图谱展示，支持实时交互，帮助你直观理解知识结构，发现知识间的潜在联系
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faGears} className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">智能知识推荐</h3>
            <p className="text-gray-600 leading-relaxed">
              基于图神经网络的推荐系统，为你推荐相关知识点，帮助你构建完整的知识体系
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
          适用场景
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          无论是个人学习还是团队协作，Think Graph 都能满足你的需求
        </p>
        
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            个人使用
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${
              activeTab === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            团队协作
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {activeTab === 'personal' ? (
            <>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">个人知识管理</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faLightbulb} className="text-sm text-green-600" />
                    </div>
                    <p className="text-gray-600">构建个人知识库，将零散知识系统化</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faBrain} className="text-sm text-blue-600" />
                    </div>
                    <p className="text-gray-600">AI辅助学习，快速掌握新知识</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faInfinity} className="text-sm text-purple-600" />
                    </div>
                    <p className="text-gray-600">发现知识间的关联，拓展知识边界</p>
                  </li>
                </ul>
              </div>
              <div className="relative h-[400px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden">
                {/* 这里可以放置个人使用场景的示意图 */}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">团队知识协作</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faUserGroup} className="text-sm text-blue-600" />
                    </div>
                    <p className="text-gray-600">团队共享知识库，促进知识流通</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faChartNetwork} className="text-sm text-indigo-600" />
                    </div>
                    <p className="text-gray-600">可视化团队知识结构，优化知识管理</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faLock} className="text-sm text-purple-600" />
                    </div>
                    <p className="text-gray-600">安全的权限管理，保护团队知识资产</p>
                  </li>
                </ul>
              </div>
              <div className="relative h-[400px] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden">
                {/* 这里可以放置团队协作场景的示意图 */}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              开启智能知识管理之旅
            </h2>
            <p className="text-xl mb-12 opacity-90">
              加入数万名用户的行列，重新定义你的知识管理方式
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                <FontAwesomeIcon icon={faRocket} className="transform group-hover:rotate-45 transition-transform" />
                免费开始使用
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2 group"
              >
                查看演示
                <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

