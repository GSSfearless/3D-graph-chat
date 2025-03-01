import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Think Graph - AI驱动的知识管理工具",
  description: "Think Graph是一款创新的AI知识管理工具，帮助你构建完整的知识网络，实现思维可视化，让学习更高效。",
  keywords: "Think Graph, 知识管理, AI, 思维导图, 知识图谱, 学习工具",
  openGraph: {
    title: "Think Graph - AI驱动的知识管理工具",
    description: "用AI重新定义知识管理方式，让思维可视化，让学习更高效。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Think Graph Preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:;" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
