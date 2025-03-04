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
                我们致力于保护您的隐私，请仔细阅读以下内容，了解我们如何收集、使用和保护您的个人信息
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
                  本隐私政策描述了Think Graph（以下简称"我们"、"我们的"或"本公司"）如何收集、使用、存储和保护您在使用我们的网站和服务时提供的个人信息。我们重视您的隐私，致力于保护您的个人数据。请仔细阅读本政策，以了解我们的做法。
                </p>

                <h2>1. 我们收集的信息</h2>
                <p>我们可能收集以下类型的信息：</p>
                <ul>
                  <li>
                    <strong>个人身份信息</strong>：包括但不限于您的姓名、电子邮件地址、电话号码、公司名称等，这些信息在您注册账户、联系我们或使用特定服务时由您提供。
                  </li>
                  <li>
                    <strong>使用数据</strong>：包括您如何使用我们的服务、访问时间、浏览的页面、使用的功能等信息。
                  </li>
                  <li>
                    <strong>设备信息</strong>：包括您用于访问我们服务的设备类型、操作系统、浏览器类型、IP地址等技术数据。
                  </li>
                  <li>
                    <strong>用户内容</strong>：您在使用我们服务时创建、上传或分享的内容和数据。
                  </li>
                </ul>

                <h2>2. 我们如何收集信息</h2>
                <p>我们通过以下方式收集信息：</p>
                <ul>
                  <li>直接收集：当您注册账户、填写表单或与我们沟通时，您直接提供给我们的信息。</li>
                  <li>自动收集：当您使用我们的服务时，我们通过cookies、日志文件等技术自动收集的信息。</li>
                  <li>第三方来源：有时我们可能从第三方服务提供商获取信息，如支付处理商、社交媒体平台等。</li>
                </ul>

                <h2>3. 我们如何使用您的信息</h2>
                <p>我们可能将收集到的信息用于以下目的：</p>
                <ul>
                  <li>提供、维护和改进我们的服务；</li>
                  <li>处理您的账户注册和管理；</li>
                  <li>响应您的询问、请求或支持需求；</li>
                  <li>分析服务使用情况，改进用户体验；</li>
                  <li>发送与服务相关的通知和更新；</li>
                  <li>经您同意，发送营销和促销信息；</li>
                  <li>检测、预防和解决欺诈、安全或技术问题；</li>
                  <li>遵守法律法规要求。</li>
                </ul>

                <h2>4. 信息的共享和披露</h2>
                <p>我们不会出售您的个人信息。我们可能在以下情况下与第三方共享您的信息：</p>
                <ul>
                  <li>
                    <strong>服务提供商</strong>：我们可能与协助我们提供服务的第三方服务提供商（如云服务提供商、支付处理商等）共享信息。
                  </li>
                  <li>
                    <strong>业务转让</strong>：如果我们参与合并、收购或资产出售，您的信息可能作为交易的一部分被转让。
                  </li>
                  <li>
                    <strong>法律要求</strong>：如果法律要求，或为保护我们的权利、财产或安全，或他人的权利、财产或安全，我们可能披露您的信息。
                  </li>
                  <li>
                    <strong>经您同意</strong>：在您同意的情况下，我们可能与特定第三方共享您的信息。
                  </li>
                </ul>

                <h2>5. 数据安全</h2>
                <p>
                  我们采取合理的技术和组织措施保护您的个人信息不被未经授权的访问、使用或披露。然而，互联网传输数据不能保证100%的安全，因此我们不能绝对保证您通过我们服务传输的信息的安全性。
                </p>

                <h2>6. 数据保留</h2>
                <p>
                  我们会在实现收集目的所需的时间内保留您的个人信息，除非法律要求或允许更长的保留期。
                </p>

                <h2>7. 您的权利</h2>
                <p>根据适用的数据保护法律，您可能拥有以下权利：</p>
                <ul>
                  <li>访问您的个人信息；</li>
                  <li>修改或更新不准确或不完整的个人信息；</li>
                  <li>在某些情况下删除您的个人信息；</li>
                  <li>限制或反对处理您的个人信息；</li>
                  <li>获取您提供的个人信息的便携式副本；</li>
                  <li>撤回您之前的同意。</li>
                </ul>
                <p>
                  如需行使上述权利，请通过本政策末尾提供的联系方式与我们联系。
                </p>

                <h2>8. Cookie政策</h2>
                <p>
                  我们使用cookies和类似技术收集和存储信息，以提供更好的用户体验和服务。您可以通过浏览器设置控制cookies，但这可能影响某些服务功能的可用性。
                </p>

                <h2>9. 儿童隐私</h2>
                <p>
                  我们的服务不面向16岁以下的儿童。我们不会故意收集儿童的个人信息。如果您发现我们已收集了儿童的个人信息，请联系我们，我们将立即采取措施删除这些信息。
                </p>

                <h2>10. 国际数据传输</h2>
                <p>
                  我们可能在您所在国家/地区以外的地方处理、存储和传输您的个人信息。我们将确保采取适当的保护措施，使这些转移符合适用的数据保护法律。
                </p>

                <h2>11. 政策更新</h2>
                <p>
                  我们可能会不时更新本隐私政策。更新后的政策将在网站上发布，生效日期将相应更新。建议您定期查看本政策，了解我们如何保护您的信息。
                </p>

                <h2>12. 联系我们</h2>
                <p>
                  如对本隐私政策有任何疑问或顾虑，或需行使您的权利，请<a href="/contact" className="text-blue-600 hover:underline">联系我们</a>。
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