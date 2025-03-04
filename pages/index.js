import { faArrowRight, faBrain, faLightbulb, faSearch, faLock, faRocket, faMagicWandSparkles, faCube, faCode, faNetworkWired, faAtom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/ui/Layout';

// 动态导入3D知识图谱组件
const DemoKnowledgeGraph = dynamic(() => import('../components/DemoKnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Layout title="Think Graph - 重新定义知识可视化" description="一种全新的思考和展示知识结构的方式，通过3D可视化帮助您更好地理解和组织信息。">
      {/* Hero Section - 全屏展示主要内容和3D知识图谱 */}
      <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 左侧：主要内容 */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                重新定义<br />
                <span className="text-blue-600">3D</span><span className="text-indigo-600">立体知识图谱</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                突破传统平面限制，以沉浸式3D体验
                <br className="hidden md:block" />
                展现知识间的复杂关联，激发创新思维
              </p>
              
              <div className="mb-8">
                <p className="text-gray-600 mb-4">输入任何主题，即刻创建专属3D知识可视化</p>
                <div className="flex flex-col sm:flex-row max-w-md mx-auto md:mx-0">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入关键词或问题..."
                    className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 sm:mb-0 sm:mr-2"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <span>开始3D知识探索</span>
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">实时生成</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">AI驱动</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">沉浸式体验</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">多维分析</span>
              </div>
            </div>
            
            {/* 右侧：3D知识图谱展示 */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              {/* 确保给3D图谱足够的空间并加上明确的z-index */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <DemoKnowledgeGraph className="w-full h-full" />
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  3D立体视图
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特性展示 Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">强大功能，重塑知识管理体验</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Think Graph提供一系列创新功能，帮助您以全新方式组织、探索和分享知识
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faLightbulb} className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">智能知识提取</h3>
              <p className="text-gray-600 leading-relaxed">
                先进的AI算法自动从文本中提取关键概念和关系，快速构建结构化知识图谱，节省大量手动整理时间
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
    </Layout>
  );
}

export default Home;

