import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faDownload, faCode, faLightbulb, faProjectDiagram, faShare } from '@fortawesome/free-solid-svg-icons';

// 文档目录结构
const docSections = [
  {
    id: 'getting-started',
    title: '入门指南',
    icon: faBook,
    topics: [
      { id: 'introduction', title: '简介' },
      { id: 'quick-start', title: '快速开始' },
      { id: 'ui-overview', title: '界面概览' },
      { id: 'basic-concepts', title: '基本概念' }
    ]
  },
  {
    id: 'features',
    title: '功能介绍',
    icon: faLightbulb,
    topics: [
      { id: 'knowledge-graph', title: '知识图谱' },
      { id: '3d-visualization', title: '3D可视化' },
      { id: 'data-import', title: '数据导入' },
      { id: 'smart-suggestions', title: '智能建议' }
    ]
  },
  {
    id: 'advanced',
    title: '高级功能',
    icon: faProjectDiagram,
    topics: [
      { id: 'graph-analysis', title: '图谱分析' },
      { id: 'customization', title: '定制化选项' },
      { id: 'automation', title: '自动化工作流' },
      { id: 'integrations', title: '第三方集成' }
    ]
  },
  {
    id: 'share-export',
    title: '分享与导出',
    icon: faShare,
    topics: [
      { id: 'sharing', title: '分享图谱' },
      { id: 'export-formats', title: '导出格式' },
      { id: 'embedding', title: '嵌入到网站' },
      { id: 'collaboration', title: '协作功能' }
    ]
  },
  {
    id: 'api',
    title: 'API参考',
    icon: faCode,
    topics: [
      { id: 'rest-api', title: 'REST API' },
      { id: 'authentication', title: '认证与授权' },
      { id: 'endpoints', title: '接口列表' },
      { id: 'examples', title: '示例代码' }
    ]
  },
  {
    id: 'resources',
    title: '资源下载',
    icon: faDownload,
    topics: [
      { id: 'templates', title: '模板库' },
      { id: 'sample-data', title: '示例数据' },
      { id: 'extensions', title: '扩展插件' }
    ]
  }
];

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeTopic, setActiveTopic] = useState('introduction');

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    // 选择该部分的第一个主题
    const firstTopic = docSections.find(section => section.id === sectionId)?.topics[0]?.id;
    if (firstTopic) {
      setActiveTopic(firstTopic);
    }
  };

  return (
    <Layout title="文档 - Think Graph" description="了解如何使用Think Graph的全部功能，从入门到精通的详细指南">
      {/* 页面标题 */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">文档中心</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              全面了解Think Graph的功能与用法，从入门到高级应用的详细指南
            </p>
          </div>
        </div>
      </section>

      {/* 文档内容 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row">
            {/* 侧边栏导航 */}
            <div className="lg:w-1/4 mb-8 lg:mb-0 lg:pr-8">
              <div className="sticky top-8">
                <h2 className="text-lg font-bold mb-4 text-gray-900">文档目录</h2>
                <nav className="space-y-6">
                  {docSections.map(section => (
                    <div key={section.id}>
                      <button
                        className={`flex items-center w-full text-left px-3 py-2 rounded-lg font-medium ${
                          activeSection === section.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => handleSectionClick(section.id)}
                      >
                        <FontAwesomeIcon icon={section.icon} className="mr-2" />
                        {section.title}
                      </button>
                      {activeSection === section.id && (
                        <div className="mt-2 ml-5 border-l-2 border-gray-200 pl-3 space-y-1">
                          {section.topics.map(topic => (
                            <button
                              key={topic.id}
                              className={`block w-full text-left py-1 px-2 text-sm rounded ${
                                activeTopic === topic.id ? 'font-medium text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                              }`}
                              onClick={() => setActiveTopic(topic.id)}
                            >
                              {topic.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* 主内容区域 */}
            <div className="lg:w-3/4 lg:pl-8 border-l border-gray-200">
              <div className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                  {docSections.find(section => section.id === activeSection)?.title} - {
                    docSections.find(section => section.id === activeSection)?.topics.find(topic => topic.id === activeTopic)?.title
                  }
                </h1>
                
                {/* 文档内容 - 这里是示例，实际应用中可能需要从API或Markdown文件中加载 */}
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    这里是"{docSections.find(section => section.id === activeSection)?.title} - {
                      docSections.find(section => section.id === activeSection)?.topics.find(topic => topic.id === activeTopic)?.title
                    }"的文档内容。在实际应用中，这些内容可能从后端API加载或从Markdown文件中渲染。
                  </p>
                  <p className="mb-4">
                    Think Graph提供了强大的知识图谱创建和可视化功能，帮助用户更好地组织和理解信息。通过直观的界面和丰富的工具，用户可以轻松创建、编辑和共享知识图谱。
                  </p>
                  <h2 className="text-2xl font-semibold mt-8 mb-4">功能概述</h2>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>创建和编辑知识节点和关系</li>
                    <li>3D和2D视图切换</li>
                    <li>自定义节点外观和布局</li>
                    <li>导入和导出数据</li>
                    <li>协作编辑和分享</li>
                  </ul>
                  <h2 className="text-2xl font-semibold mt-8 mb-4">示例代码</h2>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>
                      {`// 使用API创建新的知识图谱
const createGraph = async () => {
  const response = await fetch('https://api.thinkgraph.com/graphs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      name: '示例图谱',
      description: '这是一个示例知识图谱'
    })
  });
  
  const data = await response.json();
  return data;
};`}
                    </code>
                  </pre>
                </div>
                
                {/* 导航按钮 */}
                <div className="mt-12 flex justify-between">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    上一页
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DocsPage; 