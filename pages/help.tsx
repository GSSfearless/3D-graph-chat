import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faSearch, faComments, faBook, faVideo } from '@fortawesome/free-solid-svg-icons';

// FAQ数据
const faqData = [
  {
    id: 1,
    question: 'Think Graph是什么？',
    answer: 'Think Graph是一款创新的知识可视化工具，它能够将复杂的信息结构以直观、立体的方式呈现出来。通过Think Graph，您可以轻松地创建、管理和探索知识图谱，帮助您更好地理解和组织信息。'
  },
  {
    id: 2,
    question: '我需要具备什么技术背景才能使用Think Graph？',
    answer: 'Think Graph设计得非常直观易用，不需要特定的技术背景。无论您是学生、教师、研究人员还是企业管理者，只要您有组织和可视化信息的需求，都可以轻松上手使用Think Graph。我们提供详细的教程和文档来帮助您入门。'
  },
  {
    id: 3,
    question: 'Think Graph支持哪些平台？',
    answer: 'Think Graph是一个基于Web的应用，可以在任何现代浏览器中运行，包括Chrome、Firefox、Safari和Edge等。这意味着您可以在Windows、macOS、Linux等各种操作系统上使用它，无需安装任何额外软件。我们计划在未来推出移动应用版本。'
  },
  {
    id: 4,
    question: '我可以导出或分享我创建的知识图谱吗？',
    answer: '是的，Think Graph支持多种格式的导出功能，包括PNG、SVG、PDF以及数据格式如JSON和CSV等。您还可以通过生成分享链接，将您的知识图谱分享给其他人查看或协作编辑。'
  },
  {
    id: 5,
    question: 'Think Graph的数据安全性如何？',
    answer: '数据安全是我们的首要关注点。Think Graph采用行业标准的加密技术保护您的数据，并实施严格的访问控制。您的数据存储在安全的云服务器上，定期备份，确保不会丢失。同时，我们的隐私政策确保您的数据不会被未经授权的第三方访问。'
  },
  {
    id: 6,
    question: '有没有免费版本可以试用？',
    answer: '是的，Think Graph提供免费版本，您可以创建有限数量的知识图谱并体验核心功能。对于需要更高级功能和更大存储容量的用户，我们提供多个付费计划选择。您可以随时从免费版本升级到付费版本，而不会丢失任何数据。'
  }
];

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id: number) => {
    if (expandedFaqs.includes(id)) {
      setExpandedFaqs(expandedFaqs.filter(faqId => faqId !== id));
    } else {
      setExpandedFaqs([...expandedFaqs, id]);
    }
  };

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="帮助中心 - Think Graph" description="获取Think Graph的使用帮助、常见问题解答和技术支持">
      {/* 页面标题 */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">帮助中心</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              获取Think Graph的使用帮助，解答常见问题，让您的体验更加流畅
            </p>
            <div className="mt-8 relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索问题或关键词..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 主要内容区域 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* 选项卡导航 */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('faq')}
            >
              常见问题
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'guides' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('guides')}
            >
              使用指南
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'videos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab('videos')}
            >
              视频教程
            </button>
          </div>

          {/* 常见问题内容 */}
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-gray-900">常见问题解答</h2>
              
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">未找到与"{searchQuery}"相关的问题。</p>
                  <button 
                    className="mt-4 text-blue-600 hover:underline"
                    onClick={() => setSearchQuery('')}
                  >
                    清除搜索
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map(faq => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <span className="font-semibold text-gray-900">{faq.question}</span>
                        <FontAwesomeIcon 
                          icon={expandedFaqs.includes(faq.id) ? faChevronUp : faChevronDown} 
                          className="text-gray-500"
                        />
                      </button>
                      {expandedFaqs.includes(faq.id) && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 使用指南内容 */}
          {activeTab === 'guides' && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-gray-900">使用指南</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <a href="/docs/getting-started" className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition duration-200">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">入门指南</h3>
                  <p className="text-gray-700 mb-4">快速上手Think Graph，了解基本功能和操作方法</p>
                  <span className="text-blue-600 font-medium">了解更多 →</span>
                </a>
                <a href="/docs/create-graph" className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition duration-200">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">创建知识图谱</h3>
                  <p className="text-gray-700 mb-4">学习如何创建、编辑和组织您的第一个知识图谱</p>
                  <span className="text-blue-600 font-medium">了解更多 →</span>
                </a>
                <a href="/docs/advanced-features" className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition duration-200">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">高级功能</h3>
                  <p className="text-gray-700 mb-4">探索Think Graph的高级功能，实现更多可能性</p>
                  <span className="text-blue-600 font-medium">了解更多 →</span>
                </a>
                <a href="/docs/sharing" className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition duration-200">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">分享与协作</h3>
                  <p className="text-gray-700 mb-4">学习如何与他人分享您的知识图谱并进行协作</p>
                  <span className="text-blue-600 font-medium">了解更多 →</span>
                </a>
              </div>
            </div>
          )}

          {/* 视频教程内容 */}
          {activeTab === 'videos' && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-gray-900">视频教程</h2>
              <p className="text-gray-700 mb-8">观看我们精心准备的视频教程，帮助您更直观地了解Think Graph的使用方法。</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">视频缩略图</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Think Graph入门教程</h3>
                    <p className="text-sm text-gray-600">了解Think Graph的基本功能和操作流程</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">视频缩略图</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">3D知识图谱创建</h3>
                    <p className="text-sm text-gray-600">学习如何创建和自定义3D知识图谱</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">视频缩略图</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">高级分析功能</h3>
                    <p className="text-sm text-gray-600">深入了解Think Graph的数据分析能力</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 支持选项 */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">获取支持</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faComments} className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-3">在线客服</h3>
              <p className="text-gray-700 mb-4">
                与我们的客服团队实时沟通，获取即时帮助解决问题
              </p>
              <a href="#" className="text-blue-600 hover:underline font-medium">立即咨询</a>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faBook} className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-3">详细文档</h3>
              <p className="text-gray-700 mb-4">
                浏览我们的详细文档，了解Think Graph的所有功能和特性
              </p>
              <a href="/docs" className="text-blue-600 hover:underline font-medium">查看文档</a>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faVideo} className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-3">培训服务</h3>
              <p className="text-gray-700 mb-4">
                预约一对一培训或团队培训，深入学习Think Graph的使用技巧
              </p>
              <a href="/contact" className="text-blue-600 hover:underline font-medium">联系我们</a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HelpPage;