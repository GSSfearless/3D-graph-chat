import React from 'react';
import Layout from '../components/ui/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const ContactPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 表单提交逻辑将在此实现
    alert('感谢您的消息！我们会尽快回复。');
  };

  return (
    <Layout title="联系我们 - Think Graph" description="与Think Graph团队取得联系，了解更多产品信息或获取技术支持">
      {/* 页面标题 */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">联系我们</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              无论您有任何问题、建议或合作意向，我们都期待与您沟通交流
            </p>
          </div>
        </div>
      </section>

      {/* 联系方式和表单 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* 联系信息 */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">与我们取得联系</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                我们的团队随时准备回答您的问题，提供技术支持，或讨论如何让Think Graph更好地满足您的需求。
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">办公地址</h3>
                    <p className="text-gray-700">北京市海淀区中关村科技园区<br />创新大厦B座12层</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">电子邮箱</h3>
                    <p className="text-gray-700">
                      <a href="mailto:info@thinkgraph.cn" className="text-blue-600 hover:underline">info@thinkgraph.cn</a>
                      <br />
                      <span className="text-sm text-gray-500">通常在24小时内回复</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">联系电话</h3>
                    <p className="text-gray-700">
                      <a href="tel:+8610123456789" className="text-blue-600 hover:underline">+86 (10) 1234-5678</a>
                      <br />
                      <span className="text-sm text-gray-500">周一至周五 9:00-18:00</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 联系表单 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">发送消息</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入您的姓名"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入您的电子邮箱"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">主题</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入消息主题"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">消息内容</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请详细描述您的问题或需求"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                >
                  发送消息
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 地图或其他联系方式 */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">其他联系方式</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200 w-64">
              <div className="text-xl font-bold mb-2 text-blue-600">微信公众号</div>
              <p className="text-gray-600">扫描关注ThinkGraph官方公众号</p>
            </a>
            <a href="#" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200 w-64">
              <div className="text-xl font-bold mb-2 text-blue-600">知乎专栏</div>
              <p className="text-gray-600">关注我们的知乎专栏获取最新资讯</p>
            </a>
            <a href="#" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200 w-64">
              <div className="text-xl font-bold mb-2 text-blue-600">GitHub</div>
              <p className="text-gray-600">在GitHub上关注我们的开源项目</p>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage; 