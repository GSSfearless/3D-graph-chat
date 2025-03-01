"use client"

import Link from "next/link"
import Image from "next/image"
import { KnowledgeGraphDemo } from "@/components/knowledge-graph-demo"
import { 
  CircleDot, 
  BarChart3, 
  BrainCircuit, 
  Lightbulb, 
  FileSearch,
  BookOpen,
  Building2, 
  GraduationCap,
  LineChart,
  Stethoscope,
  BarChartHorizontal,
  Check,
  ArrowRight,
  Github,
  Mail,
  Twitter,
  Play
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <CircleDot className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">智图</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              核心功能
            </Link>
            <Link href="#demo" className="text-sm font-medium hover:underline">
              演示
            </Link>
            <Link href="#use-cases" className="text-sm font-medium hover:underline">
              应用场景
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">
              价格
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline">
              联系我们
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium hover:underline"
            >
              登录
            </Link>
            <Link 
              href="/signup" 
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-primary/90"
            >
              免费试用
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 英雄区 */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  <span className="text-primary">AI 搜索</span>与<span className="text-primary">3D知识图谱</span>
                </h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  发现隐藏在数据中的洞察，通过智能搜索和直观的3D可视化，轻松探索复杂知识网络
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                  >
                    立即体验
                  </Link>
                  <Link
                    href="#demo"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm hover:bg-gray-100"
                  >
                    查看演示
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent" />
                <div className="h-full w-full">
                  <KnowledgeGraphDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 核心功能 */}
        <section id="features" className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">核心功能</h2>
              <p className="mt-4 text-gray-500 md:text-xl">我们如何帮助您探索复杂数据并找到关键洞察</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-4 p-6 rounded-xl border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI 智能搜索</h3>
                <p className="text-gray-500">
                  利用先进的自然语言处理技术，理解您的真实问题，返回精准答案而非仅有链接
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-xl border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">3D知识图谱</h3>
                <p className="text-gray-500">
                  直观展示知识间的复杂关联，交互式探索文档、概念、实体之间的连接
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-xl border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                  <FileSearch className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">知识领域定制</h3>
                <p className="text-gray-500">
                  针对不同行业和领域优化搜索和知识图谱，自定义知识库满足特定需求
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 演示视频 */}
        <section id="demo" className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">产品演示</h2>
              <p className="mt-4 text-gray-500 md:text-xl">看看如何利用智图分析文献并构建知识图谱</p>
            </div>
            <div className="relative aspect-video mx-auto max-w-4xl overflow-hidden rounded-xl shadow-xl">
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Image 
                    src="/space-background.png" 
                    alt="产品演示视频预览" 
                    width={1280} 
                    height={720}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="group cursor-pointer rounded-full bg-primary/90 p-4 shadow-lg hover:bg-primary">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 应用场景 */}
        <section id="use-cases" className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">应用场景</h2>
              <p className="mt-4 text-gray-500 md:text-xl">智图在各个领域的实际应用</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">科研文献分析</h3>
                <p className="text-sm text-gray-500">
                  快速理解研究领域，发现关键文献和研究热点，识别潜在合作伙伴
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">企业知识管理</h3>
                <p className="text-sm text-gray-500">
                  连接企业内部文档、资料与知识，提升决策效率和知识复用
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">教育与学习</h3>
                <p className="text-sm text-gray-500">
                  构建学科知识体系，辅助教学设计与学习路径规划，增强理解复杂概念
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">市场分析</h3>
                <p className="text-sm text-gray-500">
                  挖掘市场趋势，分析竞争对手关系网络，识别市场机会与威胁
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">医疗健康</h3>
                <p className="text-sm text-gray-500">
                  分析医学文献，了解疾病、药物与治疗方案的关系，辅助临床决策
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-lg border bg-card text-card-foreground shadow">
                <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <BarChartHorizontal className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">金融风控</h3>
                <p className="text-sm text-gray-500">
                  建立实体关联网络，发现风险传导路径，提升风险管理能力
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 价格方案 */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">价格方案</h2>
              <p className="mt-4 text-gray-500 md:text-xl">选择最适合您需求的方案</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {/* 基础版 */}
              <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground shadow">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">基础版</h3>
                  <p className="text-gray-500">适合个人用户和小型团队</p>
                </div>
                <div className="mt-4 mb-8">
                  <span className="text-4xl font-bold">¥99</span>
                  <span className="text-gray-500">/月</span>
                </div>
                <ul className="space-y-2 flex-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>100次AI搜索查询</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>基础3D知识图谱</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>5个自定义知识领域</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>邮件支持</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/signup?plan=basic"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100"
                  >
                    选择方案
                  </Link>
                </div>
              </div>
              
              {/* 专业版 */}
              <div className="flex flex-col p-6 rounded-xl border-2 border-primary bg-card text-card-foreground shadow-lg relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                  最受欢迎
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">专业版</h3>
                  <p className="text-gray-500">适合企业和专业研究团队</p>
                </div>
                <div className="mt-4 mb-8">
                  <span className="text-4xl font-bold">¥499</span>
                  <span className="text-gray-500">/月</span>
                </div>
                <ul className="space-y-2 flex-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>1000次AI搜索查询</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>高级3D知识图谱</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>20个自定义知识领域</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>优先支持</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>API访问</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/signup?plan=pro"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                  >
                    选择方案
                  </Link>
                </div>
              </div>
              
              {/* 企业版 */}
              <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground shadow">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">企业版</h3>
                  <p className="text-gray-500">适合大型组织的定制需求</p>
                </div>
                <div className="mt-4 mb-8">
                  <span className="text-4xl font-bold">定制</span>
                  <span className="text-gray-500"></span>
                </div>
                <ul className="space-y-2 flex-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>无限AI搜索查询</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>高级功能全套</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>无限自定义知识领域</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>24/7专属支持</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>私有部署选项</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>定制开发与集成</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/contact?subject=企业版咨询"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100"
                  >
                    联系我们
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 联系我们 */}
        <section id="contact" className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">联系我们</h2>
              <p className="mt-4 text-gray-500 md:text-xl">有任何问题或需求，请随时与我们联系</p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl">
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none">
                      姓名
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="您的姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">
                      邮箱
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="您的邮箱地址"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium leading-none">
                    留言
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="请描述您的需求或问题"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 sm:w-auto"
                >
                  提交
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 行动召唤区 */}
        <section className="py-20 bg-primary text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">准备开始使用了吗？</h2>
              <p className="text-white/80 md:text-xl">
                立即注册免费试用，体验AI搜索和3D知识图谱带来的智能数据分析体验
              </p>
              <div className="flex flex-col gap-4 sm:flex-row justify-center">
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-primary shadow-sm hover:bg-white/90"
                >
                  免费试用
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-white px-8 text-sm font-medium text-white shadow-sm hover:bg-white/10"
                >
                  产品演示
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-white">
        <div className="container px-4 py-12 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CircleDot className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">智图</span>
              </div>
              <p className="text-sm text-gray-500">
                智能知识探索与可视化平台，赋能数据洞察与决策
              </p>
              <div className="flex gap-4">
                <Link href="https://twitter.com" className="text-gray-500 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="https://github.com" className="text-gray-500 hover:text-primary">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="mailto:contact@thinkgraph.ai" className="text-gray-500 hover:text-primary">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">邮箱</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">产品</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link href="#features" className="hover:underline">功能</Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:underline">价格</Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:underline">文档</Link>
                </li>
                <li>
                  <Link href="/api" className="hover:underline">API</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">资源</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link href="/blog" className="hover:underline">博客</Link>
                </li>
                <li>
                  <Link href="/guides" className="hover:underline">指南</Link>
                </li>
                <li>
                  <Link href="/support" className="hover:underline">帮助中心</Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:underline">常见问题</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">公司</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link href="/about" className="hover:underline">关于我们</Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:underline">加入我们</Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:underline">联系我们</Link>
                </li>
                <li>
                  <Link href="/partners" className="hover:underline">合作伙伴</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              © 2023 智图. 保留所有权利.
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link href="/privacy" className="hover:underline">
                隐私政策
              </Link>
              <Link href="/terms" className="hover:underline">
                服务条款
              </Link>
              <Link href="/cookies" className="hover:underline">
                Cookie 设置
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

