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
    <div className="min-h-screen bg-white">
      {/* 主内容区 */}
      <main className="pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 左侧标题和介绍 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-center">
            <div>
              <div className="inline-block mb-3 px-3 py-1 bg-blue-50 rounded-full">
                <span className="text-blue-600 text-sm font-medium">革命性的知识可视化工具</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                <div className="text-blue-600">3D<span className="text-indigo-600">立体知识图谱</span></div>
                <div className="text-indigo-600">重新<span className="text-purple-600">定义思考方式</span></div>
              </h1>
              
              <p className="text-gray-600 mb-8">
                突破传统平面限制，以沉浸式3D体验<br/>
                将复杂知识立体化展现，让思维触手可及
              </p>
              
              {/* 统计数据 - 横向布局 */}
              <div className="flex flex-wrap gap-6 sm:gap-10">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600 mr-2">360°</span>
                  <span className="text-sm text-gray-500">立体可视化</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-indigo-600 mr-2">98.5%</span>
                  <span className="text-sm text-gray-500">识别准确率</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-purple-600 mr-2">1M+</span>
                  <span className="text-sm text-gray-500">知识连接</span>
                </div>
              </div>
            </div>
            
            {/* 右侧：3D知识图谱展示框 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden shadow-lg h-[400px]">
              <div className="relative w-full h-full">
                <DemoKnowledgeGraph className="demo-graph-container" />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium z-10">
                  <FontAwesomeIcon icon={faCube} className="mr-1.5" />
                  3D立体视图
                </div>
              </div>
            </div>
          </div>
          
          {/* 搜索和体验区域 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-16 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">体验您自己的知识图谱</h2>
            <p className="text-gray-600 mb-6 text-center">输入任何主题，即刻创建专属3D知识可视化</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入任何主题..."
                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
              />
              
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center whitespace-nowrap"
              >
                <span>开始3D知识探索</span>
                <FontAwesomeIcon icon={faSearch} className="ml-2" />
              </button>
            </div>
          </div>
          
          {/* 技术特点展示 */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-10">
              <span className="text-indigo-600">先进的技术</span>
              <span className="mx-2">,</span>
              <span className="text-purple-600">卓越的体验</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faNetworkWired} className="text-lg text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">NLP实体关系抽取</h3>
                <p className="text-gray-600 text-sm">
                  采用先进的自然语言处理技术，精准识别文本中的概念实体与关系
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faCube} className="text-lg text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3D立体图谱</h3>
                <p className="text-gray-600 text-sm">
                  突破传统平面限制，提供沉浸式立体可视化体验，支持360°全方位探索
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faBrain} className="text-lg text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">实时图谱生成</h3>
                <p className="text-gray-600 text-sm">
                  强大的实时计算架构，支持边提问边构建，将思维过程即时可视化
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部CTA */}
      <footer className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">开始您的知识可视化之旅</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              免费体验Think Graph，重新发现知识连接的力量
            </p>
            <a
              href="/signup"
              className="inline-block bg-white text-indigo-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition duration-200"
            >
              免费开始使用
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

