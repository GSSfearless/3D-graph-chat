import React from 'react';
import Layout from '../components/ui/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faUsers, faRocket } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
  return (
    <Layout title="关于我们 - Think Graph" description="了解Think Graph团队和我们的使命、愿景与价值观">
      {/* 页面标题 */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">关于我们</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              我们致力于创造直观、强大、美观的知识可视化工具，帮助人们更好地理解和组织复杂信息
            </p>
          </div>
        </div>
      </section>

      {/* 使命与愿景 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">我们的使命与愿景</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Think Graph诞生于对知识管理和信息可视化的深刻思考。在信息爆炸的时代，人们往往淹没在海量数据中，难以捕捉核心知识和关键联系。
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                我们的使命是创造工具，帮助人们以直观、立体的方式展现知识之间的关联，促进理解和创新。我们相信，通过将抽象概念转化为可视化结构，可以激发人们更深层次的思考和洞察。
              </p>
              <p className="text-gray-700 leading-relaxed">
                我们的愿景是成为知识可视化领域的引领者，打造一个让思考变得更加清晰、高效、有趣的世界。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faLightbulb} className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">创新思维</h3>
                <p className="text-gray-700">
                  我们不断探索新的方式，将复杂信息转化为易于理解的视觉体验，让知识可视化成为思考的延伸。
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">以用户为中心</h3>
                <p className="text-gray-700">
                  我们深入了解用户需求，打造直观、易用且功能强大的产品，让每个人都能轻松驾驭知识海洋。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 团队介绍 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">我们的团队</h2>
            <p className="text-gray-700 leading-relaxed">
              Think Graph由一群对信息可视化和知识管理充满热情的专业人士组成，我们致力于打造卓越的产品体验
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2 text-center">张一鸣</h3>
              <p className="text-blue-600 mb-4 text-center text-sm">创始人 & CEO</p>
              <p className="text-gray-700 text-center">
                在数据可视化和人工智能领域拥有丰富经验，致力于将复杂数据转化为直观信息
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2 text-center">李慧珊</h3>
              <p className="text-purple-600 mb-4 text-center text-sm">产品总监</p>
              <p className="text-gray-700 text-center">
                专注于用户体验设计，将复杂功能转化为简洁优雅的产品界面
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2 text-center">王思聪</h3>
              <p className="text-green-600 mb-4 text-center text-sm">技术总监</p>
              <p className="text-gray-700 text-center">
                拥有丰富的全栈开发经验，专注于构建高性能、可扩展的系统架构
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 联系我们 CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">与我们一起探索知识的无限可能</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            无论您是学生、教育工作者、研究人员还是企业管理者，Think Graph都能为您的知识管理提供全新视角
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-indigo-700 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition duration-200 shadow-lg"
          >
            联系我们
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage; 