import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0 md:w-1/3">
            <h3 className="text-xl font-semibold text-white mb-3">Think Graph</h3>
            <p className="text-sm mb-4">重新定义知识可视化体验</p>
            <p className="text-xs">&copy; {new Date().getFullYear()} Think Graph. 保留所有权利。</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
            <div>
              <h4 className="text-white text-sm font-medium mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features"><span className="hover:text-white transition cursor-pointer">功能</span></Link></li>
                <li><Link href="/pricing"><span className="hover:text-white transition cursor-pointer">价格</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">资源</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help"><span className="hover:text-white transition cursor-pointer">帮助中心</span></Link></li>
                <li><Link href="/docs"><span className="hover:text-white transition cursor-pointer">文档</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">关于</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about"><span className="hover:text-white transition cursor-pointer">关于我们</span></Link></li>
                <li><Link href="/contact"><span className="hover:text-white transition cursor-pointer">联系我们</span></Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 