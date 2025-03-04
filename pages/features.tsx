import React from 'react';
import Layout from '../components/ui/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faNetworkWired, faBrain, faLightbulb, faShare, faChartBar } from '@fortawesome/free-solid-svg-icons';

const FeaturesPage = () => {
  return (
    <Layout title="功能 - Think Graph" description="探索Think Graph的核心功能，了解如何通过3D知识图谱更好地管理和可视化信息">
      {/* 页面标题 */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">功能介绍</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              探索Think Graph强大的功能，重新定义您的知识管理方式
            </p>
          </div>
        </div>
      </section>

      {/* 核心功能介绍 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">核心功能</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Think Graph提供全方位的知识可视化解决方案，帮助您更高效地组织、理解和分享信息
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center mb-5">
                <FontAwesomeIcon icon={faCube} className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">3D立体图谱</h3>
              <p className="text-gray-600 leading-relaxed">
                突破传统平面限制，提供沉浸式立体可视化体验，支持360°全方位探索，从多角度理解知识结构
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-5">
                <FontAwesomeIcon icon={faNetworkWired} className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">智能关联</h3>
              <p className="text-gray-600 leading-relaxed">
                AI驱动的关联分析，自动识别知识点之间的联系，挖掘隐藏关系，构建完整知识网络
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center mb-5">
                <FontAwesomeIcon icon={faBrain} className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">实时图谱生成</h3>
              <p className="text-gray-600 leading-relaxed">
                强大的实时计算架构，支持边提问边构建，将思维过程即时可视化，真正实现思考与呈现同步
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 rounded-lg bg-yellow-100 flex items-center justify-center mb-5">
                <FontAwesomeIcon icon={faLightbulb} className="text-2xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">知识发现</h3>
              <p className="text-gray-600 leading-relaxed">
                基于图谱分析，提供创新性知识发现功能，启发新思路，帮助用户挖掘信息间的潜在价值
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 rounded-lg bg-red-100 flex items-center justify-center mb-5">
                <FontAwesomeIcon icon={faShare} className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">多样化分享</h3>
              <p className="text-gray-600 leading-relaxed">
                支持多种导出和分享方式，轻松将您的知识图谱分享给团队成员或嵌入到其他平台
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-5">
                <FontAwesomeIcon icon={faChartBar} className="text-2xl text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">数据分析</h3>
              <p className="text-gray-600 leading-relaxed">
                内置强大的统计分析工具，帮助您量化知识结构，发现关键节点和中心主题
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 功能对比 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">功能对比</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              了解不同版本Think Graph提供的功能差异
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-left bg-gray-100 border-b border-gray-200 rounded-tl-xl">功能</th>
                  <th className="py-4 px-6 text-center bg-gray-100 border-b border-gray-200">免费版</th>
                  <th className="py-4 px-6 text-center bg-gray-100 border-b border-gray-200">专业版</th>
                  <th className="py-4 px-6 text-center bg-gray-100 border-b border-gray-200 rounded-tr-xl">企业版</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">基础知识图谱</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">2D可视化</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">3D立体图谱</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">-</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">智能关联分析</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">基础</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">高级</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">高级</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">导出格式</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">PNG</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">多种格式</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">所有格式</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">团队协作</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">-</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">最多5人</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">无限</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-b border-gray-200 font-medium">API访问</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">-</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">-</td>
                  <td className="py-4 px-6 text-center border-b border-gray-200">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <a 
              href="/pricing" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200"
            >
              查看详细价格
            </a>
          </div>
        </div>
      </section>

      {/* 用例展示 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">应用场景</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Think Graph适用于多种知识管理和信息可视化场景
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">个人知识管理</h3>
              <p className="text-gray-700 mb-4">
                整理个人学习笔记、研究资料，构建个性化知识库，提高学习效率和知识保留率。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>学习笔记整理</li>
                <li>研究资料关联</li>
                <li>阅读笔记关联</li>
                <li>概念梳理</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">教育教学</h3>
              <p className="text-gray-700 mb-4">
                辅助教师制作课程内容，帮助学生理解复杂概念，提供直观的知识结构可视化。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>课程内容设计</li>
                <li>概念关系展示</li>
                <li>学科知识体系构建</li>
                <li>学习路径规划</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">企业知识管理</h3>
              <p className="text-gray-700 mb-4">
                构建企业知识库，促进知识分享，提高团队协作效率，降低知识传递成本。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>项目知识沉淀</li>
                <li>技术文档关联</li>
                <li>团队知识共享</li>
                <li>新员工培训</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">研究项目</h3>
              <p className="text-gray-700 mb-4">
                梳理研究领域文献，发现研究热点和空白点，促进跨学科知识融合。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>文献综述</li>
                <li>研究方向分析</li>
                <li>跨学科关联</li>
                <li>研究进展追踪</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">开始您的知识可视化之旅</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            立即体验Think Graph强大的功能，重新定义您的知识管理方式
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/search" 
              className="bg-white text-indigo-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium transition duration-200 shadow-lg"
            >
              免费开始使用
            </a>
            <a 
              href="/pricing" 
              className="bg-transparent border border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition duration-200"
            >
              查看价格方案
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FeaturesPage; 