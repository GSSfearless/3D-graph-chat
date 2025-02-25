'use client';

import React, { useState, useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Clock, Star, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { HistoryManager, SearchHistoryItem, FavoriteItem } from '../utils/history-manager';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

const LeftSidebar = () => {
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);

  useEffect(() => {
    // 加载初始数据
    setSearchHistory(HistoryManager.getSearchHistory());
    setFavorites(HistoryManager.getFavorites());

    // 添加存储事件监听器
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'searchHistory') {
        setSearchHistory(HistoryManager.getSearchHistory());
      } else if (e.key === 'favorites') {
        setFavorites(HistoryManager.getFavorites());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleHistoryClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleHistoryDelete = (id: string) => {
    const newHistory = HistoryManager.removeSearchHistory(id);
    setSearchHistory(newHistory);
  };

  const handleFavoriteDelete = (id: string) => {
    const newFavorites = HistoryManager.removeFavorite(id);
    setFavorites(newFavorites);
  };

  const clearAllHistory = () => {
    const newHistory = HistoryManager.clearSearchHistory();
    setSearchHistory(newHistory);
  };

  const clearAllFavorites = () => {
    const newFavorites = HistoryManager.clearFavorites();
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

      {/* 搜索历史部分 */}
      <div className="flex-1 overflow-auto p-4">
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
                        {formatDate(item.timestamp)}
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
      </div>

      {/* Discord链接 - 移到底部 */}
      <div className="p-4 border-t border-gray-200">
        <a
          href="https://discord.gg/your-discord"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 text-gray-500 hover:text-[#5865F2] transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50"
        >
          <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
          <span>加入 Discord 社区</span>
        </a>
      </div>
    </div>
  );
};

export default LeftSidebar; 