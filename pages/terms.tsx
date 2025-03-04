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
                请仔细阅读以下条款，这些条款规定了您使用Think Graph服务的权利和义务
              </p>
            </div>
          </div>
        </section>

        {/* 条款内容 */}
        <section className="py-16 bg-white w-full">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg">
                <h2>1. 服务条款</h2>
                <p>
                  欢迎使用Think Graph提供的服务。本使用条款（"条款"）适用于您访问和使用Think Graph网站（"网站"）和服务（"服务"）的行为。通过访问或使用我们的服务，您同意受这些条款的约束。请仔细阅读这些条款。
                </p>

                <h2>2. 服务描述</h2>
                <p>
                  Think Graph提供知识图谱可视化工具，帮助用户组织、理解和分享信息。我们的服务允许用户创建、编辑和分享知识图谱。根据用户的订阅计划，提供的功能和服务范围可能有所不同。
                </p>

                <h2>3. 账户注册</h2>
                <p>
                  使用我们的某些服务可能需要创建账户。您同意提供准确、完整的注册信息，并在信息变更时及时更新。您应当保护好您的账户信息，对通过您的账户进行的所有活动负责。如发现未经授权的使用，应立即通知我们。
                </p>

                <h2>4. 用户内容</h2>
                <p>
                  您在使用我们服务时创建、上传或分享的内容（"用户内容"）归您所有。您授予我们全球性、非独占、免版税的许可，允许我们使用、复制、修改、发布、分发您的用户内容，以便我们提供和改进服务。
                </p>
                <p>
                  您承诺您有权分享用户内容，且内容不侵犯任何第三方权益。我们有权（但无义务）审核和删除任何违反这些条款的用户内容。
                </p>

                <h2>5. 隐私</h2>
                <p>
                  我们重视您的隐私。请查阅我们的<a href="/privacy" className="text-blue-600 hover:underline">隐私政策</a>，了解我们如何收集、使用和共享您的信息。
                </p>

                <h2>6. 订阅和付款</h2>
                <p>
                  我们提供不同级别的订阅计划。订阅费用将按您选择的周期（月付或年付）收取。您可以随时取消订阅，取消将在当前订阅周期结束时生效。我们不提供已支付费用的退款，除非适用法律另有规定。
                </p>

                <h2>7. 知识产权</h2>
                <p>
                  Think Graph及其内容（包括但不限于软件、设计、文本、图形、徽标、图标和图像）受版权、商标和其他知识产权法律保护。未经我们明确许可，您不得复制、修改、分发或创建衍生作品。
                </p>

                <h2>8. 服务变更和终止</h2>
                <p>
                  我们可能会随时修改或终止服务，恕不另行通知。我们保留在任何时候因任何原因暂停或终止您使用服务的权利，包括但不限于违反这些条款。
                </p>

                <h2>9. 免责声明</h2>
                <p>
                  服务按"现状"和"可用"基础提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、安全或无错误，也不保证服务将满足您的特定需求。
                </p>

                <h2>10. 责任限制</h2>
                <p>
                  在法律允许的最大范围内，Think Graph及其管理人员、员工和代理人对因使用或无法使用服务而导致的任何直接、间接、附带、特殊、惩罚性或后果性损害不承担责任。
                </p>

                <h2>11. 条款修改</h2>
                <p>
                  我们可能会随时修改这些条款。修改后的条款将在网站上发布时生效。继续使用服务将视为您接受修改后的条款。
                </p>

                <h2>12. 适用法律</h2>
                <p>
                  这些条款受中华人民共和国法律管辖，任何与服务相关的争议应提交至有管辖权的中国法院解决。
                </p>

                <h2>13. 联系我们</h2>
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