import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* 左侧品牌信息 */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Think Graph</h3>
            <p className="text-sm mb-4 leading-relaxed max-w-sm">重新定义知识可视化体验，通过立体图谱展现信息间的关联，激发创新思维</p>
          </div>
          
          {/* 链接区域 - 产品 */}
          <div className="col-span-1">
            <h4 className="text-white text-sm font-medium mb-4 uppercase tracking-wider">产品</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/features">
                  <span className="hover:text-white transition-colors duration-200 block">功能</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <span className="hover:text-white transition-colors duration-200 block">价格</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 链接区域 - 关于 */}
          <div className="col-span-1">
            <h4 className="text-white text-sm font-medium mb-4 uppercase tracking-wider">关于</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about">
                  <span className="hover:text-white transition-colors duration-200 block">关于我们</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors duration-200 block">联系我们</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 版权区域和分隔线 */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs mb-4 md:mb-0">&copy; {new Date().getFullYear()} Think Graph. 保留所有权利。</p>
          <div className="flex space-x-6">
            <Link href="/privacy">
              <span className="text-xs hover:text-white transition-colors duration-200 cursor-pointer">隐私政策</span>
            </Link>
            <Link href="/terms">
              <span className="text-xs hover:text-white transition-colors duration-200 cursor-pointer">使用条款</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 