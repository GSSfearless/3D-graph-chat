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
    <div className="w-full h-[400px] bg-white/30 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl transform -rotate-12 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section - 重新设计以突出3D知识图谱 */}
      <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-16 relative">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-6 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600 font-medium">🔮 革命性的知识可视化工具</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text leading-tight">
            3D立体知识图谱<br />重新定义思考方式
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            突破传统平面限制，以沉浸式3D体验<br />
            将复杂知识立体化展现，让思维触手可及
          </p>
        </div>
        
        {/* 3D旋转知识图谱展示 */}
        <div className={`w-full max-w-4xl mx-auto mb-16 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="h-[400px] relative">
            <DemoKnowledgeGraph />
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <FontAwesomeIcon icon={faCube} className="mr-2" />
              3D立体视图
            </div>
          </div>
        </div>
        
        {/* Search Bar - 移动到图谱下方 */}
        <div className={`max-w-2xl mx-auto relative group transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800">体验您自己的知识图谱</h3>
            <p className="text-gray-600 mt-2">输入任何主题，即刻创建专属3D知识可视化</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-purple-200/50 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity rounded-xl"></div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，体验3D知识图谱的魅力..."
              className="w-full px-8 py-5 text-lg rounded-xl bg-white shadow-md border-2 border-transparent focus:border-blue-100 focus:ring-2 focus:ring-blue-50 transition-all outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg group"
          >
            <span className="font-medium">开始我的3D知识探索</span>
            <FontAwesomeIcon icon={faSearch} className="text-lg transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Quick Stats - 更新数据突出技术优势 */}
        <div className={`flex flex-wrap justify-center gap-8 mt-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">360°</div>
            <div className="text-gray-600">立体可视化</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">98.5%</div>
            <div className="text-gray-600">关系识别准确率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1,000,000+</div>
            <div className="text-gray-600">知识连接</div>
          </div>
        </div>
      </div>

      {/* 技术优势展示 - 新增部分 */}
      <div className="container mx-auto px-4 py-20 relative">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-700 to-purple-700 text-transparent bg-clip-text">
          先进的技术，卓越的体验
        </h2>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* 左侧：技术特点介绍 */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faAtom} className="text-xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">NLP实体关系抽取</h3>
                <p className="text-gray-600">
                  采用先进的自然语言处理技术，精准识别文本中的概念实体与关系，实现超过98%的关系识别准确率
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faCode} className="text-xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">三维力导向布局算法</h3>
                <p className="text-gray-600">
                  自研三维力导向布局算法，通过物理模拟实现节点自动定位，让知识图谱布局更自然、更美观
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faNetworkWired} className="text-xl text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">实时图谱构建</h3>
                <p className="text-gray-600">
                  强大的流处理架构支持边输入边构建，知识图谱实时呈现，让思维可视化无需等待
                </p>
              </div>
            </div>
          </div>
          
          {/* 右侧：技术流程图 */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">1</div>
                  <div>
                    <h4 className="font-semibold">文本分析与实体识别</h4>
                    <p className="text-sm text-gray-600">利用深度学习模型识别文本中的实体与概念</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <FontAwesomeIcon icon={faArrowRight} className="text-xl text-gray-400 rotate-90" />
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">2</div>
                  <div>
                    <h4 className="font-semibold">智能关系抽取</h4>
                    <p className="text-sm text-gray-600">分析实体间语义关联，自动构建知识网络结构</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <FontAwesomeIcon icon={faArrowRight} className="text-xl text-gray-400 rotate-90" />
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">3</div>
                  <div>
                    <h4 className="font-semibold">3D可视化与交互</h4>
                    <p className="text-sm text-gray-600">三维空间立体呈现，支持旋转、缩放与深度交互</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - 保留并优化 */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
          Think Graph 核心优势
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faCube} className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">3D立体知识图谱</h3>
            <p className="text-gray-600 leading-relaxed">
              突破传统平面限制，提供沉浸式立体可视化体验，支持360°旋转与缩放，从多角度理解知识结构
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">智能关系抽取</h3>
            <p className="text-gray-600 leading-relaxed">
              采用先进的自然语言处理算法，自动分析文本内容，精准识别实体与关系，构建完整知识网络
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">实时图谱生成</h3>
            <p className="text-gray-600 leading-relaxed">
              强大的实时计算架构，支持边提问边构建，将思维过程即时可视化，实现思考与呈现同步
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section - 保留并优化 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              体验未来的知识可视化方式
            </h2>
            <p className="text-xl mb-12 opacity-90">
              告别平面思考的限制，立即体验3D立体知识图谱带来的全新认知体验
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCube} />
                立即体验3D图谱
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                了解技术细节
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

