'use client';

import React, { useState, useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Clock, Star, ChevronDown, ChevronUp, X, Trash2, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { db, type SearchHistoryItem, type FavoriteItem } from '../utils/supabase';
import { AuthModal } from './Auth/AuthModal';
import { useRouter } from 'next/router';

export default function LeftSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setSearchHistory([]);
      setFavorites([]);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [historyData, favoritesData] = await Promise.all([
        db.searchHistory.getAll(user.id),
        db.favorites.getAll(user.id)
      ]);
      setSearchHistory(historyData || []);
      setFavorites(favoritesData || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleHistoryClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleHistoryDelete = async (id: string) => {
    if (!user) return;
    
    try {
      await db.searchHistory.remove(id, user.id);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  const handleFavoriteDelete = async (id: string) => {
    if (!user) return;
    
    try {
      await db.favorites.remove(id, user.id);
      setFavorites(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete favorite item:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!user) return;
    
    try {
      await db.searchHistory.clear(user.id);
      setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const clearAllFavorites = async () => {
    if (!user) return;
    
    try {
      await db.favorites.clear(user.id);
      setFavorites([]);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen p-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <LogIn className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-gray-500">登录以使用更多功能</p>
          <Button
            onClick={() => setShowAuthModal(true)}
            variant="outline"
            className="w-full"
          >
            登录 / 注册
          </Button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen p-4 flex flex-col">
      {/* 搜索历史部分 */}
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
                      {formatDate(item.created_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHistoryDelete(item.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
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

      {/* 收藏部分 */}
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
                      {formatDate(item.created_at)}
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
    </div>
  );
} 