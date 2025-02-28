import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, 
  faLightbulb,
  faNetworkWired,
  faSearch,
  faArrowRight,
  faChartNetwork
} from '@fortawesome/free-solid-svg-icons';

function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-6 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600 font-medium">🎉 欢迎使用 Think Graph</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
            用AI重新定义<br />知识管理方式
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            将零散的知识点连接成完整的知识网络，让思维可视化，让学习更高效
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-100">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入任何主题，开始你的知识探索..."
                className="w-full px-8 py-4 rounded-full bg-transparent focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all"
              >
                开始探索
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            为什么选择 Think Graph
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={faBrain}
              title="AI智能分析"
              description="强大的AI引擎自动分析文本内容，提取关键概念，构建知识连接"
            />
            <FeatureCard
              icon={faChartNetwork}
              title="实时可视化"
              description="直观的知识图谱展示，帮助快速理解和记忆复杂的知识体系"
            />
            <FeatureCard
              icon={faLightbulb}
              title="智能推荐"
              description="基于学习历史和兴趣，智能推荐相关知识点，拓展知识边界"
            />
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              看看它是如何工作的
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              输入任何主题，让AI帮你构建完整的知识网络
            </p>
            <div className="bg-white rounded-2xl shadow-xl p-8 aspect-video">
              {/* 这里可以放置一个演示视频或动态图表 */}
              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-500">演示视频</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              准备好开始你的知识探索之旅了吗？
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              加入成千上万的学习者，重新定义你的学习方式
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                免费开始使用
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all"
              >
                查看演示
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
        <FontAwesomeIcon icon={icon} className="text-2xl text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default Home;

