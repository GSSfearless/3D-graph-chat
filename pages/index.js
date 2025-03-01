import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles, faGraduationCap, faCode, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import { motion } from 'framer-motion';

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

  const features = [
    {
      icon: faBrain,
      title: "AI 驱动的知识连接",
      description: "利用先进的AI技术，自动发现知识点之间的关联，构建完整的知识网络"
    },
    {
      icon: faChartNetwork,
      title: "可视化知识图谱",
      description: "直观展示知识结构，让学习和理解变得更加轻松自然"
    },
    {
      icon: faGraduationCap,
      title: "智能学习路径",
      description: "根据你的学习目标，自动规划最优学习路径，提供个性化的学习建议"
    },
    {
      icon: faDatabase,
      title: "知识库整合",
      description: "轻松导入和管理各类知识资源，构建你的个人知识库"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* 动态背景元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform rotate-12"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl transform -rotate-12"
        />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32 relative">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block mb-4 px-6 py-2 bg-blue-50 rounded-full">
            <span className="text-blue-600 font-medium">🎉 欢迎使用 Think Graph</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text leading-tight">
            用AI重新定义<br />知识管理方式
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            将零散的知识点连接成完整的知识网络<br />
            让思维可视化，让学习更高效
          </p>
        </motion.div>
        
        {/* 搜索框 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-purple-200/50 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity rounded-full"></div>
          <div className="relative flex items-center bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.05)] group-hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，开始你的知识探索..."
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
        </motion.div>
      </div>

      {/* 特性展示 */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              为什么选择 Think Graph
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们提供最先进的知识管理工具，帮助你更好地组织和理解信息
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={feature.icon} className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 演示部分 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">
              开启你的知识探索之旅
            </h2>
            <p className="text-xl mb-12 opacity-90">
              加入数千名学习者的行列，重新定义你的学习方式
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/search')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faRocket} />
                立即开始
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                观看演示
                <FontAwesomeIcon icon={faArrowRight} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;

