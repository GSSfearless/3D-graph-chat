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

const LeftSidebar = () => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        HistoryManager.setCurrentUserId(user.id);
        const history = await HistoryManager.getSearchHistory();
        setSearchHistory(history);
        const favs = await HistoryManager.getFavorites();
        setFavorites(favs);
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
    const newFavorites = await HistoryManager.removeFavorite(id);
    setFavorites(newFavorites);
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
    const newFavorites = await HistoryManager.clearFavorites();
    setFavorites(newFavorites);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo部分 */}
      <div className="p-4 border-b border-gray-200">
        <a href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Think Graph</span>
        </a>
      </div>

      {/* 用户认证部分 */}
      <div className="p-4 border-b border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">{user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AuthForm mode={authMode} />
            <div className="flex justify-between text-sm">
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
        )}
      </div>

      {/* 搜索历史部分 */}
      <div className="flex-1 overflow-auto p-4">
        {user ? (
          <>
            <Collapsible.Root open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <div className="flex items-center justify-between mb-2">
                <Collapsible.Trigger className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">搜索历史</span>
                  {isHistoryOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </Collapsible.Trigger>
                {searchHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllHistory}
                    disabled={isClearing}
                    className="hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {isClearing ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              <Collapsible.Content>
                <ScrollArea.Root className="h-48 overflow-hidden">
                  <ScrollArea.Viewport className="h-full w-full">
                    <div className="space-y-2">
                      {searchHistory.map((item) => (
                        <div
                          key={item.id}
                          className="group relative flex flex-col p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => handleHistoryClick(item.query)}
                        >
                          <span className="text-sm text-gray-600 truncate pr-6">
                            {item.query}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(item.timestamp)}
                          </span>
                          <button
                            onClick={(e) => handleHistoryDelete(item.id, e)}
                            disabled={deletingIds.includes(item.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          >
                            {deletingIds.includes(item.id) ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar
                    className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 rounded-full"
                    orientation="vertical"
                  >
                    <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Collapsible.Content>
            </Collapsible.Root>

            <Collapsible.Root open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen} className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Collapsible.Trigger className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-gray-700">收藏</span>
                  {isFavoritesOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </Collapsible.Trigger>
                {favorites.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFavorites}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Collapsible.Content>
                <ScrollArea.Root className="h-48 overflow-hidden">
                  <ScrollArea.Viewport className="h-full w-full">
                    <div className="space-y-2">
                      {favorites.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 hover:bg-gray-50 rounded-lg space-y-1 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-700">
                              {item.title}
                            </span>
                            <button
                              onClick={() => handleFavoriteDelete(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {item.description}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar
                    className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 rounded-full"
                    orientation="vertical"
                  >
                    <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Collapsible.Content>
            </Collapsible.Root>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <User className="w-8 h-8 mb-2" />
            <p className="text-sm text-center">登录后查看历史记录和收藏</p>
          </div>
        )}
      </div>

      {/* Discord链接 - 移到底部 */}
      <div className="p-4 border-t border-gray-200">
        <a
          href="https://discord.gg/your-discord"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 mx-auto text-gray-500 hover:text-[#5865F2] transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default LeftSidebar; 