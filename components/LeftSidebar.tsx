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
      {/* Logo section - 居中且无分割线 */}
      <div className="p-4 flex justify-center">
        <a href="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Think Graph</span>
        </a>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
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
                Sign Out
              </Button>
            </div>
            
            {/* Future features placeholder */}
            <div className="text-center text-sm text-gray-500 mt-8">
              <p>More features coming soon!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Think Graph</h2>
              <p className="text-sm text-gray-600">Create beautiful knowledge graphs with AI</p>
            </div>
            
            <AuthForm mode={authMode} />
            
            <div className="flex justify-between text-sm">
              {authMode === 'login' ? (
                <>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => setAuthMode('reset')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Back to Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Discord link - 已隐藏 */}
      <div className="p-4 border-t border-gray-200" style={{ display: 'none' }}>
        <a
          href="https://discord.gg/your-discord"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-[#5865F2] transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
          <span className="text-sm">Join our Community</span>
        </a>
      </div>
    </div>
  );
};

export default LeftSidebar; 