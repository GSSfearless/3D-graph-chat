import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold flex items-center cursor-pointer">
              Think Graph
            </span>
          </Link>

          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-xl" />
          </button>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features">
              <span className="hover:text-blue-400 transition duration-200 cursor-pointer">功能</span>
            </Link>
            <Link href="/pricing">
              <span className="hover:text-blue-400 transition duration-200 cursor-pointer">价格</span>
            </Link>
            <Link href="/about">
              <span className="hover:text-blue-400 transition duration-200 cursor-pointer">关于我们</span>
            </Link>
          </nav>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-gray-800 rounded-lg p-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/features">
                <span className="hover:text-blue-400 transition duration-200 cursor-pointer">功能</span>
              </Link>
              <Link href="/pricing">
                <span className="hover:text-blue-400 transition duration-200 cursor-pointer">价格</span>
              </Link>
              <Link href="/about">
                <span className="hover:text-blue-400 transition duration-200 cursor-pointer">关于我们</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 