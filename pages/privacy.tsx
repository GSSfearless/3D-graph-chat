import React from 'react';
import Layout from '../components/ui/Layout';

const PrivacyPage = () => {
  return (
    <Layout title="隐私政策 - Think Graph" description="Think Graph的隐私政策声明">
      <div className="w-full">
        {/* 页面标题 */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white w-full">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">隐私政策</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                了解我们如何收集、使用和保护您的个人信息
              </p>
            </div>
          </div>
        </section>

        {/* 隐私政策内容 */}
        <section className="py-16 bg-white w-full">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg">
                <h2>引言</h2>
                <p>
                  本隐私政策描述了Think Graph（以下简称"我们"）如何收集、使用和保护您在使用我们的网站和服务时提供的个人信息。我们重视您的隐私，并致力于保护您的个人数据。
                </p>

                <h2>1. 我们收集的信息</h2>
                <p>我们可能收集以下类型的信息：</p>
                <ul>
                  <li><strong>基本信息</strong>：当您注册或使用我们的服务时，我们可能会收集您的姓名和电子邮件地址</li>
                  <li><strong>使用数据</strong>：包括您如何使用我们的服务、访问时间和浏览的页面等信息</li>
                  <li><strong>设备信息</strong>：包括您用于访问我们服务的设备类型、浏览器类型和IP地址</li>
                  <li><strong>用户内容</strong>：您在使用我们服务时创建或上传的内容</li>
                </ul>

                <h2>2. 我们如何使用您的信息</h2>
                <p>我们使用收集到的信息主要用于以下目的：</p>
                <ul>
                  <li>提供、维护和改进我们的服务</li>
                  <li>响应您的问题和请求</li>
                  <li>通知您有关服务的更新和变更</li>
                  <li>分析使用情况，优化用户体验</li>
                  <li>保护服务的安全和完整性</li>
                </ul>

                <h2>3. 信息共享</h2>
                <p>
                  我们不会出售您的个人信息。我们可能在以下有限情况下共享您的信息：
                </p>
                <ul>
                  <li>在获得您同意的情况下</li>
                  <li>为了提供服务而需要与服务提供商合作（如云服务提供商）</li>
                  <li>当法律要求我们这样做时</li>
                </ul>

                <h2>4. 数据安全</h2>
                <p>
                  我们采取合理的技术措施保护您的个人信息，防止未经授权的访问、使用或泄露。然而，请注意，互联网传输数据不能保证100%的安全。
                </p>

                <h2>5. Cookie使用</h2>
                <p>
                  我们使用Cookie和类似技术来改善用户体验和收集使用数据。您可以通过浏览器设置控制或禁用Cookie，但这可能会影响某些服务功能。
                </p>

                <h2>6. 您的权利</h2>
                <p>
                  根据您所在地区的适用法律，您可能拥有以下权利：
                </p>
                <ul>
                  <li>访问和获取您的个人数据</li>
                  <li>更正不准确的数据</li>
                  <li>要求删除您的数据</li>
                  <li>限制或反对处理您的数据</li>
                </ul>
                <p>
                  如需行使这些权利，请通过我们的联系方式与我们联系。
                </p>

                <h2>7. 隐私政策更新</h2>
                <p>
                  我们可能会不定期更新本隐私政策。如有重大变更，我们会在网站上发布通知或直接通知您。建议您定期查看本政策以了解最新情况。
                </p>

                <h2>8. 联系我们</h2>
                <p>
                  如对本隐私政策有任何疑问，请<a href="/contact" className="text-blue-600 hover:underline">联系我们</a>。
                </p>

                <p className="text-gray-600 mt-12">
                  最后更新日期：{new Date().getFullYear()}年{new Date().getMonth() + 1}月{new Date().getDate()}日
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPage; 