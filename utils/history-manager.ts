import { searchHistory, favorites } from './supabase-client';
import { supabase } from './supabase-client';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

export interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  graph_data?: Record<string, any>;
}

export class HistoryManager {
  private static currentUserId: string | null = null;
  private static lastQuery: string | null = null;
  private static lastQueryTime: number = 0;
  private static cachedHistory: SearchHistoryItem[] = [];
  private static cachedFavorites: FavoriteItem[] = [];

  static setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
    // Reset cache
    this.cachedHistory = [];
    this.cachedFavorites = [];
  }

  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      // 如果没有缓存，则从服务器获取
      if (this.cachedHistory.length === 0) {
        const history = await searchHistory.getByUserId(this.currentUserId);
        this.cachedHistory = history.map(item => ({
          id: item.id,
          query: item.query,
          timestamp: new Date(item.created_at).getTime()
        }));
      }
      return this.cachedHistory;
    } catch (error) {
      console.error('History error:', error);
      return this.cachedHistory;
    }
  }

  static async addSearchHistory(query: string): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      const now = Date.now();
      if (this.lastQuery === query && now - this.lastQueryTime < 5000) {
        return this.cachedHistory;
      }

      this.lastQuery = query;
      this.lastQueryTime = now;

      // 先添加到服务器
      const newItem = await searchHistory.add({
        query,
        user_id: this.currentUserId
      });

      // 更新缓存
      const historyItem = {
        id: newItem.id,
        query: newItem.query,
        timestamp: new Date(newItem.created_at).getTime()
      };
      this.cachedHistory = [historyItem, ...this.cachedHistory];

      return this.cachedHistory;
    } catch (error) {
      console.error('Add history error:', error);
      return this.cachedHistory;
    }
  }

  static async removeSearchHistory(id: string): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      // 先更新本地缓存
      this.cachedHistory = this.cachedHistory.filter(item => item.id !== id);
      
      // 后台删除
      await searchHistory.delete(id);
      
      return this.cachedHistory;
    } catch (error) {
      console.error('Remove history error:', error);
      // 如果删除失败，恢复缓存
      await this.getSearchHistory();
      return this.cachedHistory;
    }
  }

  static async clearSearchHistory(): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      // 先清空本地缓存
      this.cachedHistory = [];
      
      // 后台清空
      await searchHistory.clearByUserId(this.currentUserId);
      
      return [];
    } catch (error) {
      console.error('Clear history error:', error);
      // 如果清空失败，恢复缓存
      await this.getSearchHistory();
      return this.cachedHistory;
    }
  }

  static async getFavorites(): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      // If no cache, fetch from server
      if (this.cachedFavorites.length === 0) {
        const favs = await favorites.getByUserId(this.currentUserId);
        this.cachedFavorites = favs.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          timestamp: new Date(item.created_at).getTime(),
          graph_data: item.graph_data
        }));
      }
      return this.cachedFavorites;
    } catch (error) {
      console.error('Favorites error:', error);
      return this.cachedFavorites;
    }
  }

  static async addFavorite(item: Omit<FavoriteItem, 'id' | 'timestamp'>): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      // Add to server first
      const newItem = await favorites.add({
        ...item,
        user_id: this.currentUserId
      });

      // Update cache
      const favoriteItem = {
        id: newItem.id,
        title: newItem.title,
        description: newItem.description || '',
        timestamp: new Date(newItem.created_at).getTime(),
        graph_data: newItem.graph_data
      };
      this.cachedFavorites = [favoriteItem, ...this.cachedFavorites];

      return this.cachedFavorites;
    } catch (error) {
      console.error('Add favorite error:', error);
      return this.cachedFavorites;
    }
  }

  static async removeFavorite(id: string): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      // 先更新本地缓存
      this.cachedFavorites = this.cachedFavorites.filter(item => item.id !== id);
      
      // 后台删除
      await favorites.delete(id);
      
      return this.cachedFavorites;
    } catch (error) {
      console.error('Remove favorite error:', error);
      // 如果删除失败，恢复缓存
      await this.getFavorites();
      return this.cachedFavorites;
    }
  }

  static async clearFavorites(): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      // 先清空本地缓存
      this.cachedFavorites = [];
      
      // 后台清空
      await favorites.clearByUserId(this.currentUserId);
      
      return [];
    } catch (error) {
      console.error('Clear favorites error:', error);
      // 如果清空失败，恢复缓存
      await this.getFavorites();
      return this.cachedFavorites;
    }
  }
} 