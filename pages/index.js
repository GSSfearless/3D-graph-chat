import { faArrowRight, faRocket, faLightbulb, faSearch, faNetworkWired, faBrain, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import Image from 'next/image';

function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl transform -rotate-12 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className={`lg:w-1/2 mb-12 lg:mb-0 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
                知识不再零散，<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">智慧尽在连接</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-xl">
                Think Graph 利用 AI 技术，将您的碎片化知识构建成一张完整的思维导图，让学习和记忆变得更加高效、直观。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/search')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faRocket} />
                  立即开始探索
                </button>
                <button
                  onClick={() => router.push('/demo')}
                  className="px-8 py-4 bg-transparent border-2 border-indigo-600 text-indigo-600 rounded-full text-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  观看演示
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
            <div className={`lg:w-1/2 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="relative h-80 md:h-96 lg:h-[500px] w-full bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-2xl overflow-hidden shadow-2xl">
                {/* 这里可以放置一个知识图谱动画或者截图 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg text-indigo-800 font-medium">知识图谱预览图</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">强大功能，重塑知识管理方式</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Think Graph 集成多种先进功能，让您的学习和知识管理体验达到新高度
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <FontAwesomeIcon icon={faBrain} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">AI 智能分析</h3>
              <p className="text-slate-600">
                强大的 AI 引擎自动分析文本内容，提取关键概念，构建知识连接，帮助您更深入理解复杂信息。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                <FontAwesomeIcon icon={faNetworkWired} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">实时可视化</h3>
              <p className="text-slate-600">
                直观的知识图谱展示，帮助快速理解知识结构，清晰展现概念之间的关联，增强记忆效果。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-6">
                <FontAwesomeIcon icon={faSearch} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">语义搜索</h3>
              <p className="text-slate-600">
                深度理解搜索意图，返回最相关的知识内容，不再局限于关键词匹配，发现更有价值的关联信息。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                <FontAwesomeIcon icon={faLightbulb} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">智能推荐</h3>
              <p className="text-slate-600">
                基于学习历史和兴趣偏好，智能推荐相关知识点，帮助您持续扩展知识边界，发现新的学习方向。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
                <FontAwesomeIcon icon={faProjectDiagram} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">知识连接</h3>
              <p className="text-slate-600">
                自动发现知识点之间的关联，构建完整知识网络，帮助您建立全面而系统的知识体系。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6">
                <FontAwesomeIcon icon={faBrain} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">深度思考</h3>
              <p className="text-slate-600">
                支持深度思考模式，提供更全面的知识分析，揭示隐藏的知识关联，培养批判性思维能力。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              开启你的知识探索之旅
            </h2>
            <p className="text-xl mb-12 opacity-90">
              加入数千名学习者的行列，使用 Think Graph 重新定义您的学习方式
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

