import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  // 定义价格计划
  const plans = [
    {
      name: '免费版',
      description: '适合个人用户入门体验',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { name: '基础知识图谱创建', included: true },
        { name: '最多5个图谱', included: true },
        { name: '每个图谱最多50个节点', included: true },
        { name: '基础2D可视化', included: true },
        { name: '导出PNG格式', included: true },
        { name: '3D立体图谱', included: false },
        { name: '高级分析功能', included: false },
        { name: '团队协作', included: false },
        { name: '优先技术支持', included: false },
        { name: 'API访问', included: false },
      ],
      ctaText: '免费开始使用',
      ctaLink: '/search',
      highlight: false,
    },
    {
      name: '专业版',
      description: '适合专业用户和小型团队',
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        { name: '基础知识图谱创建', included: true },
        { name: '无限图谱', included: true },
        { name: '每个图谱最多500个节点', included: true },
        { name: '基础2D可视化', included: true },
        { name: '导出多种格式', included: true },
        { name: '3D立体图谱', included: true },
        { name: '高级分析功能', included: true },
        { name: '最多5人团队协作', included: true },
        { name: '优先技术支持', included: false },
        { name: 'API访问', included: false },
      ],
      ctaText: '选择专业版',
      ctaLink: '/signup?plan=pro',
      highlight: true,
    },
    {
      name: '企业版',
      description: '适合大型团队和企业需求',
      monthlyPrice: 299,
      annualPrice: 249,
      features: [
        { name: '基础知识图谱创建', included: true },
        { name: '无限图谱', included: true },
        { name: '无限节点', included: true },
        { name: '基础2D可视化', included: true },
        { name: '导出多种格式', included: true },
        { name: '3D立体图谱', included: true },
        { name: '高级分析功能', included: true },
        { name: '无限团队协作', included: true },
        { name: '优先技术支持', included: true },
        { name: 'API访问', included: true },
      ],
      ctaText: '联系销售',
      ctaLink: '/contact?inquiry=enterprise',
      highlight: false,
    }
  ];

  return (
    <Layout title="价格 - Think Graph" description="探索Think Graph的各种订阅计划，找到最适合您需求的选择">
      {/* 页面标题 */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">简单透明的价格</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              选择最适合您需求的计划，随时可以升级或降级
            </p>
          </div>
        </div>
      </section>

      {/* 价格计划 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* 计费周期切换 */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                年付（节省20%）
              </button>
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  !isAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                月付
              </button>
            </div>
          </div>

          {/* 价格卡片 */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`border rounded-xl overflow-hidden ${
                  plan.highlight 
                    ? 'border-blue-500 shadow-lg relative' 
                    : 'border-gray-200 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 inset-x-0 bg-blue-500 text-white text-center py-1 text-sm font-medium">
                    推荐方案
                  </div>
                )}
                <div className={`p-8 ${plan.highlight ? 'pt-10' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">¥{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="text-gray-600 ml-2">/月</span>
                    {isAnnual && plan.annualPrice > 0 && (
                      <div className="text-sm text-green-600 mt-1">年付账单，节省¥{(plan.monthlyPrice - plan.annualPrice) * 12}元/年</div>
                    )}
                  </div>
                  <a
                    href={plan.ctaLink}
                    className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors duration-200 ${
                      plan.highlight
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.ctaText}
                  </a>
                </div>
                <div className="border-t border-gray-200 p-8">
                  <h4 className="font-medium text-gray-900 mb-4">包含功能</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <FontAwesomeIcon icon={feature.included ? faCheck : faTimes} className="text-xs" />
                        </span>
                        <span className={`ml-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-500'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ部分 */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">常见问题</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">如何选择适合我的计划？</h3>
                <p className="text-gray-700">
                  如果您是个人用户或刚开始尝试知识图谱，免费版是一个很好的起点。对于需要更多功能和更大容量的专业用户，我们推荐专业版。企业版则适合需要团队协作和高级功能的大型组织。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">我可以随时更改我的订阅计划吗？</h3>
                <p className="text-gray-700">
                  是的，您可以随时升级或降级您的订阅计划。升级时，我们会按比例计算剩余时间的费用差额。降级将在当前计费周期结束后生效。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">有没有教育或非营利组织的特别优惠？</h3>
                <p className="text-gray-700">
                  是的，我们为教育机构、学生和非营利组织提供特别折扣。请联系我们的销售团队了解更多详情。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">付款方式有哪些？</h3>
                <p className="text-gray-700">
                  我们接受主要信用卡、支付宝和微信支付。企业客户还可以选择通过银行转账或发票付款。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA部分 */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">准备好开始您的知识可视化之旅了吗？</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            无论您选择哪种计划，我们都将为您提供出色的体验和支持
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/search" 
              className="bg-white text-indigo-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium transition duration-200 shadow-lg"
            >
              免费开始使用
            </a>
            <a 
              href="/contact" 
              className="bg-transparent border border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition duration-200"
            >
              联系销售团队
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PricingPage; 