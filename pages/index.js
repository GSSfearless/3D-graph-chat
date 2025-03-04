import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles, faCube, faCode, faNetworkWired, faAtom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Footer from '../components/ui/Footer';

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
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>Think Graph</title>
        <meta name="description" content="Think Graph - 革命性的知识可视化工具" />
        <meta name="keywords" content="Think Graph, 3D知识图谱, 知识可视化, 人工智能, 自然语言处理" />
        <meta name="author" content="Think Graph" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {/* Hero Section - 全屏展示主要内容和3D知识图谱 */}
      <section className="relative min-h-screen flex items-center py-12 lg:py-16 overflow-hidden">
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50 rounded-bl-full opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50 rounded-tr-full opacity-80"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-50 rounded-full opacity-60 blur-xl"></div>
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-50 rounded-full opacity-60 blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* 左侧：标题和介绍 */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full shadow-sm">
                  革命性的知识可视化工具
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-blue-600">3D</span><span className="text-indigo-600">立体知识图谱</span>
                <br />
                <span className="text-indigo-600">重新</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">定义思考方式</span>
              </h1>
              
              <p className="text-gray-600 text-lg mb-8 max-w-lg leading-relaxed">
                突破传统平面限制，以沉浸式3D体验
                将复杂知识立体化展现，让思维触手可及
              </p>
              
              {/* 搜索体验区 */}
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">体验您自己的知识图谱</h2>
                <p className="text-gray-600 mb-4">输入任何主题，即刻创建专属3D知识可视化</p>
                
                <div className="mb-4">
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <span>开始3D知识探索</span>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
              
              {/* 数据统计 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-xl shadow-md text-center transform hover:scale-105 transition duration-300">
                  <div className="text-2xl font-bold text-blue-600">360°</div>
                  <div className="text-xs text-gray-500">立体可视化</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-md text-center transform hover:scale-105 transition duration-300">
                  <div className="text-2xl font-bold text-indigo-600">98%</div>
                  <div className="text-xs text-gray-500">识别准确率</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-md text-center transform hover:scale-105 transition duration-300">
                  <div className="text-2xl font-bold text-purple-600">1M+</div>
                  <div className="text-xs text-gray-500">知识连接</div>
                </div>
              </div>
            </div>
            
            {/* 右侧：3D知识图谱展示 */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl overflow-hidden shadow-xl border border-indigo-100" style={{ height: "600px", maxHeight: "calc(100vh - 200px)" }}>
                {/* 确保给3D图谱足够的空间并加上明确的z-index */}
                <div className="absolute inset-0 z-10">
                  <DemoKnowledgeGraph className="w-full h-full" />
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium z-20 shadow-md">
                  <FontAwesomeIcon icon={faCube} className="mr-1" />
                  3D立体视图
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - 展示产品特点和技术优势 */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-purple-600">卓越的体验</span>
              </h2>
            </div>
            
            {/* 特性卡片组 */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
                <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faNetworkWired} className="text-2xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">实体关系抽取</h3>
                <p className="text-gray-600 leading-relaxed">
                  采用自然语言处理技术，精准识别文本中的概念实体与关系，构建完整知识网络
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
                <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faCube} className="text-2xl text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3D立体图谱</h3>
                <p className="text-gray-600 leading-relaxed">
                  突破传统平面限制，提供沉浸式立体可视化体验，支持360°全方位探索，从多角度理解知识结构
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
                <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faBrain} className="text-2xl text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">实时图谱生成</h3>
                <p className="text-gray-600 leading-relaxed">
                  强大的实时计算架构，支持边提问边构建，将思维过程即时可视化，真正实现思考与呈现同步
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - 纵向布局 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5 mx-auto">
                <FontAwesomeIcon icon={faRocket} className="text-2xl text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">开始您的知识可视化之旅</h2>
            <p className="text-blue-100 mb-10 leading-relaxed max-w-xl mx-auto">
              免费体验Think Graph，重新发现知识连接的力量。我们的平台助您将复杂信息转化为直观可视化的知识图谱，激发创新思维。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
              <a
                href="/search"
                className="bg-white text-indigo-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-center text-sm w-auto inline-block"
              >
                免费开始使用
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}

export default Home;

