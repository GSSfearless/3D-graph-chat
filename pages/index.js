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
      {/* Hero Section - 全屏展示主要内容和3D知识图谱 */}
      <section className="relative min-h-screen flex items-center py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50 rounded-bl-full opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50 rounded-tr-full opacity-80"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-50 rounded-full opacity-60 blur-xl"></div>
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-50 rounded-full opacity-60 blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* 左侧：标题和介绍 */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="mb-3 sm:mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full shadow-sm">
                  革命性的知识可视化工具
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                <span className="text-blue-600">3D</span><span className="text-indigo-600">立体知识图谱</span>
                <br />
                <span className="text-indigo-600">重新</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">定义思考方式</span>
              </h1>
              
              <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-lg leading-relaxed">
                突破传统平面限制，以沉浸式3D体验
                将复杂知识立体化展现，让思维触手可及
              </p>
              
              {/* 搜索体验区 */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-6 sm:mb-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">体验您自己的知识图谱</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">输入任何主题，即刻创建专属3D知识可视化</p>
                
                <div className="mb-3 sm:mb-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入任何主题..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                  />
                </div>
                
                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <span>开始3D知识探索</span>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
              
              {/* 数据统计 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white p-2 sm:p-3 rounded-xl shadow-md text-center transform hover:scale-105 transition duration-300">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">360°</div>
                  <div className="text-xs text-gray-500">立体可视化</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-xl shadow-md text-center transform hover:scale-105 transition duration-300">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600">98%</div>
                  <div className="text-xs text-gray-500">识别准确率</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-xl shadow-md text-center transform hover:scale-105 transition duration-300">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">1M+</div>
                  <div className="text-xs text-gray-500">知识连接</div>
                </div>
              </div>
            </div>
            
            {/* 右侧：3D知识图谱展示 */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl overflow-hidden shadow-xl border border-indigo-100" style={{ height: "450px", minHeight: "450px", maxHeight: "calc(100vh - 120px)" }}>
                {/* 移除容器边界限制，让球体更自由展示 */}
                <div className="absolute inset-0 z-10 overflow-visible" style={{ transform: "scale(1.05)", transformOrigin: "center center" }}>
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
      <section className="py-10 md:py-12 lg:py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              <span className="text-indigo-600">先进的技术</span>
              <span className="mx-2">·</span>
              <span className="text-purple-600">卓越的体验</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              整合尖端技术，为您带来无与伦比的知识可视化体验
            </p>
          </div>
          
          {/* 特性卡片组 - 移动端单列，平板两列，桌面三列 */}
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-4 sm:mb-6">
                <FontAwesomeIcon icon={faNetworkWired} className="text-xl sm:text-2xl text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">实体关系抽取</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                采用自然语言处理技术，精准识别文本中的概念实体与关系，构建完整知识网络
              </p>
            </div>
            
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 sm:mb-6">
                <FontAwesomeIcon icon={faCube} className="text-xl sm:text-2xl text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">3D立体图谱</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                突破传统平面限制，提供沉浸式立体可视化体验，支持360°全方位探索，从多角度理解知识结构
              </p>
            </div>
            
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-4 sm:mb-6">
                <FontAwesomeIcon icon={faBrain} className="text-xl sm:text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">实时图谱生成</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                强大的实时计算架构，支持边提问边构建，将思维过程即时可视化，真正实现思考与呈现同步
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - 纵向布局，移动端更紧凑 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 sm:py-12 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            <div className="mb-4 sm:mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <FontAwesomeIcon icon={faRocket} className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 md:mb-5">开始您的知识可视化之旅</h2>
            <p className="text-blue-100 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
              免费体验Think Graph，重新发现知识连接的力量。我们的平台助您将复杂信息转化为直观可视化的知识图谱，激发创新思维。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
              <a
                href="/signup"
                className="flex-1 bg-white text-indigo-700 hover:bg-blue-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-center text-sm sm:text-base"
              >
                免费开始使用
              </a>
              <a
                href="/demo"
                className="flex-1 bg-transparent text-white border border-white hover:bg-white/10 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition duration-200 text-center text-sm sm:text-base"
              >
                查看演示
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold text-white mb-2">Think Graph</h3>
              <p className="text-sm">重新定义知识可视化体验</p>
            </div>
            <div className="flex space-x-8">
              <div>
                <h4 className="text-white text-sm font-medium mb-3">产品</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">功能</a></li>
                  <li><a href="#" className="hover:text-white transition">价格</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-medium mb-3">资源</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">帮助中心</a></li>
                  <li><a href="#" className="hover:text-white transition">文档</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-medium mb-3">公司</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">关于我们</a></li>
                  <li><a href="#" className="hover:text-white transition">联系我们</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Think Graph. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

