import React from 'react';
import Layout from '../components/ui/Layout';

const TermsPage = () => {
  return (
    <Layout title="使用条款 - Think Graph" description="Think Graph的使用条款和服务协议">
      <div className="w-full">
        {/* 页面标题 */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white w-full">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">使用条款</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                请仔细阅读以下条款，了解使用Think Graph服务的相关规定
              </p>
            </div>
          </div>
        </section>

        {/* 条款内容 */}
        <section className="py-16 bg-white w-full">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg">
                <h2>1. 服务概述</h2>
                <p>
                  欢迎使用Think Graph提供的3D知识图谱可视化服务。本使用条款适用于您访问和使用Think Graph网站和相关服务的行为。通过访问或使用我们的服务，您同意遵守这些条款。
                </p>

                <h2>2. 使用规则</h2>
                <p>
                  您在使用Think Graph服务时需遵循以下规则：
                </p>
                <ul>
                  <li>请勿进行任何可能损害服务正常运行的行为</li>
                  <li>请勿发布或传播违法、有害、威胁、辱骂、骚扰、诽谤、粗俗或其他不适当的内容</li>
                  <li>请勿侵犯他人的知识产权或其他权利</li>
                  <li>请勿使用自动化工具过度访问或抓取我们的内容</li>
                </ul>

                <h2>3. 用户内容</h2>
                <p>
                  您在使用我们服务时创建的内容（"用户内容"）归您所有。您授予我们非独占、免版税的许可，允许我们使用、存储和处理您的用户内容，以便提供和改进我们的服务。
                </p>

                <h2>4. 隐私保护</h2>
                <p>
                  我们重视您的隐私。请查阅我们的<a href="/privacy" className="text-blue-600 hover:underline">隐私政策</a>，了解我们如何收集、使用和保护您的个人信息。
                </p>

                <h2>5. 免责声明</h2>
                <p>
                  Think Graph服务按"现状"提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、安全或无错误，也不保证服务将满足您的特定需求。
                </p>

                <h2>6. 责任限制</h2>
                <p>
                  在法律允许的最大范围内，Think Graph对因使用或无法使用我们的服务而导致的任何直接、间接、附带、特殊或后果性损害不承担责任。
                </p>

                <h2>7. 服务变更</h2>
                <p>
                  我们可能随时更改、暂停或终止服务的全部或部分内容，恕不另行通知。我们也可能限制某些功能或限制您对全部或部分服务的访问，恕不另行通知或承担责任。
                </p>

                <h2>8. 条款修改</h2>
                <p>
                  我们可能会不时修改这些条款。修改后的条款将在网站上发布时生效。继续使用我们的服务表示您接受修改后的条款。
                </p>

                <h2>9. 联系方式</h2>
                <p>
                  如对这些条款有任何疑问，请<a href="/contact" className="text-blue-600 hover:underline">联系我们</a>。
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

export default TermsPage; 