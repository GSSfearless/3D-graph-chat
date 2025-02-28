import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  LightBulbIcon,
  SparklesIcon,
  BoltIcon,
  ArrowRightIcon,
  BeakerIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import 'tailwindcss/tailwind.css';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6 }
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block mb-4 px-6 py-2 bg-white/10 backdrop-blur-lg rounded-full">
            <span className="text-white/90">🚀 重新定义知识管理</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Think Graph
          </h1>
          <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
            用AI和图谱技术，构建你的第二大脑
          </p>
        </motion.div>

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto relative"
        >
          <div className="relative flex items-center bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="开始你的知识探索之旅..."
              className="w-full px-8 py-5 text-lg rounded-full bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              探索
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* 特点展示 */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
              <BoltIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">AI 驱动</h3>
            <p className="text-white/70">
              强大的AI引擎自动分析内容，提取关键概念，构建知识连接，让知识管理更智能高效
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
              <SparklesIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">知识图谱</h3>
            <p className="text-white/70">
              直观的可视化展示，帮助你理解知识间的关联，发现新的见解和灵感
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center mb-6">
              <BeakerIcon className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">智能推荐</h3>
            <p className="text-white/70">
              基于你的学习历史和兴趣，智能推荐相关知识点，帮助你拓展知识边界
            </p>
          </motion.div>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">100K+</div>
            <div className="text-white/70 mt-2">知识节点</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">50K+</div>
            <div className="text-white/70 mt-2">活跃用户</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 text-transparent bg-clip-text">1M+</div>
            <div className="text-white/70 mt-2">知识连接</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text">98%</div>
            <div className="text-white/70 mt-2">用户满意度</div>
          </motion.div>
        </div>

        {/* CTA 部分 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold mb-8">准备好开始了吗？</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              免费开始
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
            >
              查看演示
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;

