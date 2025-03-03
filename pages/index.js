import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles, faCube, faCode, faNetworkWired, faAtom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import dynamic from 'next/dynamic';

// 动态导入3D知识图谱组件
const DemoKnowledgeGraph = dynamic(() => import('../components/DemoKnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "500px" }}>
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
    </div>
  )
});

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    console.log("Home component mounted");
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    console.log("Search triggered with query:", query);
    if (query.trim() !== '') {
      router.push(`/search?q=${query}&side=both`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-x-hidden">
      {/* Hero Section - 更简洁的布局 */}
      <div className="container mx-auto px-6 pt-16 pb-24">
        <div className={`text-center transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-4 py-1.5 bg-blue-50 rounded-full">
            <span className="text-blue-600 text-sm font-medium">革命性的知识可视化工具</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text inline-block">
              3D立体知识图谱
            </div>
            <div className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text inline-block">
              重新定义思考方式
            </div>
          </h1>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            突破传统平面限制，以沉浸式3D体验
            将复杂知识立体化展现，让思维触手可及
          </p>
        </div>

        {/* 核心功能区：左侧搜索，右侧3D图谱 */}
        <div className="grid md:grid-cols-12 gap-8 items-center mb-20">
          {/* 左侧：搜索栏和体验区 */}
          <div className={`md:col-span-5 transform transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">体验您自己的知识图谱</h2>
              <p className="text-gray-600 mb-6">输入任何主题，即刻创建专属3D知识可视化</p>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入任何主题..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                />
              </div>
              
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <span>开始3D知识探索</span>
                <FontAwesomeIcon icon={faSearch} />
              </button>
              
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">360°</div>
                  <div className="text-sm text-gray-500">立体可视化</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">98.5%</div>
                  <div className="text-sm text-gray-500">识别准确率</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1M+</div>
                  <div className="text-sm text-gray-500">知识连接</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧：3D知识图谱展示 */}
          <div className={`md:col-span-7 transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden shadow-lg" style={{ height: "500px" }}>
              <DemoKnowledgeGraph />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <FontAwesomeIcon icon={faCube} className="mr-1.5" />
                3D立体视图
              </div>
            </div>
          </div>
        </div>

        {/* 核心优势 - 更简洁的设计 */}
        <div className={`transform transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">先进的技术</span>
            <span className="mx-2">,</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">卓越的体验</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faNetworkWired} className="text-xl text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">NLP实体关系抽取</h3>
              <p className="text-gray-600 text-sm">
                采用先进的自然语言处理技术，精准识别文本中的概念实体与关系
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faCube} className="text-xl text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3D立体图谱</h3>
              <p className="text-gray-600 text-sm">
                突破传统平面限制，提供沉浸式立体可视化体验，支持360°全方位探索
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faBrain} className="text-xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">实时图谱生成</h3>
              <p className="text-gray-600 text-sm">
                强大的实时计算架构，支持边提问边构建，将思维过程即时可视化
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 简约版底部CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">开始您的知识可视化之旅</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            免费体验Think Graph，重新发现知识连接的力量
          </p>
          <button 
            onClick={() => router.push('/signup')}
            className="bg-white text-indigo-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition duration-200"
          >
            免费开始使用
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

