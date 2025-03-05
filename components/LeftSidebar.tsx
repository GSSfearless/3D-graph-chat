'use client';

import React, { useState, useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Clock, Star, ChevronDown, ChevronUp, X, Trash2, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { HistoryManager, SearchHistoryItem, FavoriteItem } from '../utils/history-manager';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from './auth/AuthForm';

// 扩展FavoriteItem以包含url属性
interface FavoriteItemWithUrl extends FavoriteItem {
  url?: string;
}

const LeftSidebar = () => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItemWithUrl[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    // 检测移动设备
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      // 在移动设备上默认折叠侧边栏
      setIsSidebarOpen(!isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        HistoryManager.setCurrentUserId(user.id);
        const history = await HistoryManager.getSearchHistory();
        setSearchHistory(history);
        const favs = await HistoryManager.getFavorites();
        // 添加默认url属性
        const favsWithUrl = favs.map(fav => ({
          ...fav,
          url: `/search?q=${encodeURIComponent(fav.title)}`
        }));
        setFavorites(favsWithUrl);
      } else {
        HistoryManager.setCurrentUserId(null);
        setSearchHistory([]);
        setFavorites([]);
      }
    };
    loadData();
  }, [user]);

  const handleHistoryClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleHistoryDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // 立即更新UI
    setSearchHistory(prev => prev.filter(item => item.id !== id));
    
    // 标记正在删除
    setDeletingIds(prev => [...prev, id]);
    
    try {
      // 异步执行删除操作
      await HistoryManager.removeSearchHistory(id);
    } catch (error) {
      // 删除失败时恢复显示
      const history = await HistoryManager.getSearchHistory();
      setSearchHistory(history);
    } finally {
      // 移除删除状态
      setDeletingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleFavoriteDelete = async (id: string) => {
    // 先更新UI
    setFavorites(prev => prev.filter(item => item.id !== id));
    
    try {
      // 异步执行删除操作
      const favs = await HistoryManager.removeFavorite(id);
      // 添加默认url属性
      const favsWithUrl = favs.map(fav => ({
        ...fav,
        url: `/search?q=${encodeURIComponent(fav.title)}`
      }));
      setFavorites(favsWithUrl);
    } catch (error) {
      // 恢复显示
      const favs = await HistoryManager.getFavorites();
      const favsWithUrl = favs.map(fav => ({
        ...fav,
        url: `/search?q=${encodeURIComponent(fav.title)}`
      }));
      setFavorites(favsWithUrl);
    }
  };

  const clearAllHistory = async () => {
    if (isClearing) return;
    
    // 立即更新UI
    setSearchHistory([]);
    setIsClearing(true);
    
    try {
      // 异步执行清空操作
      await HistoryManager.clearSearchHistory();
    } catch (error) {
      // 清空失败时恢复显示
      const history = await HistoryManager.getSearchHistory();
      setSearchHistory(history);
    } finally {
      setIsClearing(false);
    }
  };

  const clearAllFavorites = async () => {
    // 先更新UI
    setFavorites([]);
    
    try {
      // 异步执行清空操作
      const favs = await HistoryManager.clearFavorites();
      // 添加默认url属性
      const favsWithUrl = favs.map(fav => ({
        ...fav,
        url: `/search?q=${encodeURIComponent(fav.title)}`
      }));
      setFavorites(favsWithUrl);
    } catch (error) {
      // 恢复显示
      const favs = await HistoryManager.getFavorites();
      const favsWithUrl = favs.map(fav => ({
        ...fav,
        url: `/search?q=${encodeURIComponent(fav.title)}`
      }));
      setFavorites(favsWithUrl);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 添加切换侧边栏的函数
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleShowAuthForm = () => {
    setShowAuthForm(true);
  };

  return (
    <>
      {/* 移动端侧边栏切换按钮 */}
      {isMobile && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isSidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
        >
          {isSidebarOpen ? <X size={20} /> : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      )}
      
      {/* 侧边栏主体 */}
      <div 
        className={`fixed z-40 inset-0 bg-black bg-opacity-50 transition-opacity ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} lg:pointer-events-none lg:opacity-0`}
        onClick={toggleSidebar}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full w-64 md:w-72 bg-white shadow-lg transform transition-transform z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:w-72 lg:shadow-none`}
      >
        <ScrollArea.Root className="h-full w-full overflow-hidden">
          <ScrollArea.Viewport className="h-full w-full p-4">
            {/* 用户信息区域，移动端显示关闭按钮 */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-sm truncate">{user.email}</p>
                      <button 
                        onClick={() => signOut()} 
                        className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <LogOut size={12} className="mr-1" />
                        退出登录
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div>
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        onClick={handleShowAuthForm}
                      >
                        登录/注册
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 移动端显示关闭按钮 */}
              {isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="关闭侧边栏"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* 搜索历史 */}
            <Collapsible.Root 
              open={isHistoryOpen} 
              onOpenChange={setIsHistoryOpen}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Collapsible.Trigger asChild>
                  <button className="flex items-center text-gray-900 font-medium text-sm focus:outline-none">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    搜索历史
                    {isHistoryOpen ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                  </button>
                </Collapsible.Trigger>
                
                {searchHistory.length > 0 && (
                  <button 
                    onClick={clearAllHistory}
                    disabled={isClearing}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center focus:outline-none"
                  >
                    <Trash2 size={12} className="mr-1" />
                    清空
                  </button>
                )}
              </div>
              
              <Collapsible.Content>
                {searchHistory.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {searchHistory.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => handleHistoryClick(item.query)}
                        className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer group text-sm"
                      >
                        <div className="flex-1 truncate">
                          <span className="truncate">{item.query}</span>
                          <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                        </div>
                        <button
                          onClick={(e) => handleHistoryDelete(item.id, e)}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                          aria-label="删除"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-sm text-gray-500">
                    暂无搜索历史
                  </div>
                )}
              </Collapsible.Content>
            </Collapsible.Root>

            {/* 收藏夹 */}
            <Collapsible.Root 
              open={isFavoritesOpen} 
              onOpenChange={setIsFavoritesOpen}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Collapsible.Trigger asChild>
                  <button className="flex items-center text-gray-900 font-medium text-sm focus:outline-none">
                    <Star size={16} className="mr-2 text-yellow-500" />
                    收藏夹
                    {isFavoritesOpen ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                  </button>
                </Collapsible.Trigger>
                
                {favorites.length > 0 && (
                  <button 
                    onClick={clearAllFavorites}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center focus:outline-none"
                  >
                    <Trash2 size={12} className="mr-1" />
                    清空
                  </button>
                )}
              </div>
              
              <Collapsible.Content>
                {favorites.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {favorites.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => item.url && router.push(item.url)}
                        className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer group text-sm"
                      >
                        <div className="flex-1 truncate">
                          <span className="truncate">{item.title}</span>
                          <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteDelete(item.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                          aria-label="删除"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-sm text-gray-500">
                    暂无收藏内容
                  </div>
                )}
              </Collapsible.Content>
            </Collapsible.Root>

            {/* 加入社区 */}
            <div className="bg-blue-50 rounded-lg p-3 mt-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">加入我们的社区</h3>
              <p className="text-xs text-blue-700 mb-3">获取最新消息、参与测试和提供反馈</p>
              <a
                href="https://discord.gg/thinkgraph"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition duration-200"
              >
                <FontAwesomeIcon icon={faDiscord} className="mr-2" />
                加入Discord社区
              </a>
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar 
            className="w-2.5 bg-gray-100 rounded-full transition-colors hover:bg-gray-200" 
            orientation="vertical"
          >
            <ScrollArea.Thumb className="bg-gray-400 rounded-full relative" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
      
      {/* 登录/注册弹窗 */}
      {!user && !loading && showAuthForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {authMode === 'login' ? '登录' : authMode === 'register' ? '注册' : '重置密码'}
              </h2>
              <button 
                onClick={() => setShowAuthForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <AuthForm mode={authMode} />
            <div className="mt-4 flex justify-between text-sm">
              {authMode === 'login' ? (
                <>
                  <button 
                    onClick={() => setAuthMode('register')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    注册账号
                  </button>
                  <button 
                    onClick={() => setAuthMode('reset')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    忘记密码？
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  返回登录
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar; 