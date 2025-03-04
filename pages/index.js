import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles, faCube, faCode, faNetworkWired, faAtom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Layout from '../components/ui/Layout';

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
    <Layout title="Think Graph - 重新定义知识可视化" description="Think Graph - 革命性的知识可视化工具，通过3D知识图谱帮助您更好地理解和组织信息">
      {/* Hero Section - 全屏展示主要内容和3D知识图谱 */}
      <section className="bg-gradient-to-b from-gray-900 to-indigo-900 text-white pt-20 pb-16 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                用立体思维<br />构建知识图谱
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Think Graph 重新定义知识可视化体验，让您以全新视角探索信息世界，发现隐藏的关联，激发创新思维。
              </p>

              {/* 搜索框 */}
              <div className="flex flex-col sm:flex-row bg-white/10 backdrop-blur-sm p-1.5 rounded-lg max-w-xl mb-8">
                <div className="flex-1 flex items-center bg-white/10 rounded-md px-4 py-2 mb-2 sm:mb-0">
                  <FontAwesomeIcon icon={faSearch} className="text-blue-300 mr-3" />
                  <input
                    type="text"
                    placeholder="输入关键词，开始您的知识探索..."
                    className="bg-transparent border-none outline-none text-white placeholder-blue-200 flex-1"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200 w-full sm:w-auto"
                >
                  探索
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-blue-300">热门探索：</span>
                <button onClick={() => router.push('/search?q=人工智能&side=both')} className="text-blue-100 hover:text-white transition duration-200">
                  人工智能
                </button>
                <button onClick={() => router.push('/search?q=知识图谱&side=both')} className="text-blue-100 hover:text-white transition duration-200">
                  知识图谱
                </button>
                <button onClick={() => router.push('/search?q=自然语言处理&side=both')} className="text-blue-100 hover:text-white transition duration-200">
                  自然语言处理
                </button>
              </div>
            </div>

            <div className={`h-[500px] transition-all duration-1000 delay-300 relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl"></div>
              <div className="absolute inset-0">
                <DemoKnowledgeGraph />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能亮点展示 */}
      <section className="py-20 bg-white w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">为何选择 Think Graph</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Think Graph结合先进的人工智能和3D可视化技术，提供前所未有的知识探索体验，让复杂信息变得直观易懂。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faCube} className="text-2xl text-blue-600" />
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

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faNetworkWired} className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">智能关联</h3>
              <p className="text-gray-600 leading-relaxed">
                AI驱动的关联分析，自动识别知识点之间的联系，挖掘隐藏关系，构建完整知识网络
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-14 h-14 rounded-lg bg-yellow-100 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faLightbulb} className="text-2xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">知识发现</h3>
              <p className="text-gray-600 leading-relaxed">
                基于图谱分析，提供创新性知识发现功能，启发新思路，帮助用户挖掘信息间的潜在价值
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-14 h-14 rounded-lg bg-red-100 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faLock} className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">隐私保护</h3>
              <p className="text-gray-600 leading-relaxed">
                企业级安全措施，保障用户数据安全，支持私有部署和数据本地化，满足企业合规需求
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-gray-200">
              <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faCode} className="text-2xl text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">开放API</h3>
              <p className="text-gray-600 leading-relaxed">
                提供丰富的API接口，支持与第三方系统无缝集成，实现知识图谱能力的灵活调用和扩展
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - 纵向布局 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 w-full">
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

