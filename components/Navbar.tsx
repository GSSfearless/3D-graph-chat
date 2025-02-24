import { useState } from 'react';
import Link from 'next/link';
import { Menu } from '@headlessui/react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './Auth/AuthModal';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 h-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Think Graph
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.email}</span>
                </Menu.Button>

                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                        onClick={() => {/* 实现设置功能 */}}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        设置
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                        onClick={signOut}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        退出登录
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
}; 