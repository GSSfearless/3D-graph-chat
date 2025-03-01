import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Search, Network, BarChart3, Zap, Layers, Github, Twitter, Mail, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { KnowledgeGraphDemo } from "@/components/knowledge-graph-demo"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Network className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">智图</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="transition-colors hover:text-primary">
                功能特点
              </Link>
              <Link href="#demo" className="transition-colors hover:text-primary">
                演示
              </Link>
              <Link href="#use-cases" className="transition-colors hover:text-primary">
                应用场景
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-primary">
                价格
              </Link>
              <Link href="#contact" className="transition-colors hover:text-primary">
                联系我们
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                登录
              </Button>
              <Button size="sm">免费试用</Button>
            </div>
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <span className="sr-only">菜单</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    人工智能搜索 + 三维知识图谱
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    利用先进的AI技术，将海量数据转化为直观的三维知识图谱，发现隐藏的关联和洞见。
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex space-x-2">
                    <Input type="email" placeholder="您的邮箱地址" className="max-w-lg flex-1" />
                    <Button type="submit">开始体验</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    注册即表示您同意我们的{" "}
                    <Link href="#" className="underline underline-offset-2">
                      服务条款
                    </Link>{" "}
                    和{" "}
                    <Link href="#" className="underline underline-offset-2">
                      隐私政策
                    </Link>
                    。
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg bg-foreground/5 p-2 border">
                <KnowledgeGraphDemo />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  核心功能
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">重新定义知识搜索与探索</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  我们的平台将AI搜索与三维知识图谱完美结合，帮助您快速获取洞见
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">智能搜索</h3>
                <p className="text-muted-foreground">基于自然语言处理的智能搜索，理解您的意图，给出最精准的答案</p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Network className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">三维知识图谱</h3>
                <p className="text-muted-foreground">以三维立体方式展示知识之间的关联，直观呈现复杂信息结构</p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">持续学习</h3>
                <p className="text-muted-foreground">
                  系统会根据您的使用习惯持续学习和优化，提供更个性化的知识发现体验
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">数据洞察</h3>
                <p className="text-muted-foreground">从海量数据中提取关键洞察，帮助您做出更明智的决策</p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">实时更新</h3>
                <p className="text-muted-foreground">知识库实时更新，确保您获取的信息始终是最新、最准确的</p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Layers className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">多维分析</h3>
                <p className="text-muted-foreground">支持多角度、多层次的知识分析，挖掘更深层次的关联与价值</p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">探索知识的新方式</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  亲身体验三维知识图谱如何改变您获取和理解信息的方式
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-4xl py-12">
              <div className="overflow-hidden rounded-lg border bg-background shadow">
                <div className="flex items-center border-b px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-sm font-medium">智图演示</div>
                </div>
                <div className="relative aspect-video bg-black">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    <p className="mt-4 text-sm opacity-70">点击播放演示视频</p>
                  </div>
                  <Image
                    src="/placeholder.svg?height=1080&width=1920"
                    width={1920}
                    height={1080}
                    alt="知识图谱演示视频封面"
                    className="object-cover opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="use-cases" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">适用多种场景</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  我们的三维知识图谱在各个领域都有广泛的应用
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h3 className="text-xl font-bold">科研文献分析</h3>
                  <p className="mt-2 text-muted-foreground">
                    可视化展示研究领域的关键概念、作者及论文之间的关联，加速科研突破
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h3 className="text-xl font-bold">企业知识管理</h3>
                  <p className="mt-2 text-muted-foreground">整合企业内部知识资源，构建企业知识图谱，提升信息获取效率</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h3 className="text-xl font-bold">教育学习</h3>
                  <p className="mt-2 text-muted-foreground">
                    直观展示知识体系结构，帮助学习者理解复杂概念间的关联，提高学习效率
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h3 className="text-xl font-bold">市场分析</h3>
                  <p className="mt-2 text-muted-foreground">
                    洞察市场趋势、品牌关联和消费者行为，为市场决策提供数据支持
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h3 className="text-xl font-bold">医疗健康</h3>
                  <p className="mt-2 text-muted-foreground">
                    分析疾病、症状、治疗方法之间的关联，辅助医生诊断和治疗决策
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h3 className="text-xl font-bold">金融风控</h3>
                  <p className="mt-2 text-muted-foreground">发现金融实体之间的隐藏关联，识别潜在风险，提升风控能力</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">简单透明的价格</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">为不同需求的用户提供灵活的价格方案</p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">基础版</h3>
                  <p className="text-muted-foreground">适合个人用户和小型团队</p>
                </div>
                <div className="my-8">
                  <span className="text-4xl font-bold">¥99</span>
                  <span className="text-muted-foreground">/月</span>
                </div>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    每月100次AI搜索查询
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    基础三维知识图谱
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    5个自定义知识域
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    邮件技术支持
                  </li>
                </ul>
                <Button className="mt-8">选择基础版</Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm ring-2 ring-primary">
                <div className="space-y-2">
                  <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    最受欢迎
                  </div>
                  <h3 className="text-2xl font-bold">专业版</h3>
                  <p className="text-muted-foreground">适合企业和专业研究团队</p>
                </div>
                <div className="my-8">
                  <span className="text-4xl font-bold">¥499</span>
                  <span className="text-muted-foreground">/月</span>
                </div>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    每月1000次AI搜索查询
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    高级三维知识图谱
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    20个自定义知识域
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    优先技术支持
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    API访问
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    团队协作功能
                  </li>
                </ul>
                <Button className="mt-8">选择专业版</Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">企业版</h3>
                  <p className="text-muted-foreground">适合大型组织和特殊需求</p>
                </div>
                <div className="my-8">
                  <span className="text-4xl font-bold">定制</span>
                </div>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    无限AI搜索查询
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    高级三维知识图谱与定制功能
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    无限自定义知识域
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    24/7专属技术支持
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    私有部署选项
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    定制开发与集成
                  </li>
                </ul>
                <Button className="mt-8">联系销售</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">立即联系我们</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                我们的专业团队随时为您提供支持和咨询，帮助您更好地利用我们的产品
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border bg-background p-6">
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="name"
                >
                  姓名
                </label>
                <Input id="name" placeholder="请输入您的姓名" />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="email"
                >
                  邮箱
                </label>
                <Input id="email" placeholder="请输入您的邮箱" type="email" />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="message"
                >
                  留言
                </label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="请输入您的留言"
                ></textarea>
              </div>
              <Button>提交</Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">准备好开始了吗？</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  立即注册，体验AI搜索与三维知识图谱带来的全新信息获取方式
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="gap-1">
                  免费试用 <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  查看产品演示
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col gap-8 py-8 md:py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <Network className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">智图</span>
              </div>
              <p className="text-sm text-muted-foreground">重新定义知识搜索与探索，帮助您从海量数据中发现新知</p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-3">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">产品</h4>
                <ul className="grid gap-2 text-sm">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      功能
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      价格
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      API文档
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      集成
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium">资源</h4>
                <ul className="grid gap-2 text-sm">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      博客
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      案例研究
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      文档
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      帮助中心
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium">公司</h4>
                <ul className="grid gap-2 text-sm">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      关于我们
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      团队
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      招聘
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      联系我们
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} 智图. 保留所有权利.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                隐私政策
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                服务条款
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Cookie设置
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

