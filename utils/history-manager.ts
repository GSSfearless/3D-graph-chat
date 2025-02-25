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

  static setCurrentUserId(userId: string | null) {
    console.log('设置当前用户ID:', userId);
    this.currentUserId = userId;
  }

  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，返回空历史记录');
        return [];
      }

      console.log('获取用户搜索历史:', this.currentUserId);
      const history = await searchHistory.getByUserId(this.currentUserId);
      return history.map(item => ({
        id: item.id,
        query: item.query,
        timestamp: new Date(item.created_at).getTime()
      }));
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  static async addSearchHistory(query: string): Promise<SearchHistoryItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，无法添加搜索历史');
        return [];
      }

      console.log('添加搜索历史:', query, '用户ID:', this.currentUserId);
      await searchHistory.add({
        query,
        user_id: this.currentUserId
      });

      return this.getSearchHistory();
    } catch (error) {
      console.error('添加搜索历史失败:', error);
      return [];
    }
  }

  static async removeSearchHistory(id: string): Promise<SearchHistoryItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，无法删除搜索历史');
        return [];
      }

      console.log('删除搜索历史:', id);
      await searchHistory.delete(id);
      return this.getSearchHistory();
    } catch (error) {
      console.error('删除搜索历史失败:', error);
      return [];
    }
  }

  static async clearSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，无法清空搜索历史');
        return [];
      }

      console.log('清空用户搜索历史:', this.currentUserId);
      await searchHistory.clearByUserId(this.currentUserId);
      return [];
    } catch (error) {
      console.error('清空搜索历史失败:', error);
      return [];
    }
  }

  static async getFavorites(): Promise<FavoriteItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，返回空收藏列表');
        return [];
      }

      console.log('获取用户收藏:', this.currentUserId);
      const favs = await favorites.getByUserId(this.currentUserId);
      return favs.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        timestamp: new Date(item.created_at).getTime(),
        graph_data: item.graph_data
      }));
    } catch (error) {
      console.error('获取收藏失败:', error);
      return [];
    }
  }

  static async addFavorite(item: Omit<FavoriteItem, 'id' | 'timestamp'>): Promise<FavoriteItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，无法添加收藏');
        return [];
      }

      console.log('添加收藏:', item.title, '用户ID:', this.currentUserId);
      await favorites.add({
        ...item,
        user_id: this.currentUserId
      });

      return this.getFavorites();
    } catch (error) {
      console.error('添加收藏失败:', error);
      return [];
    }
  }

  static async removeFavorite(id: string): Promise<FavoriteItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，无法删除收藏');
        return [];
      }

      console.log('删除收藏:', id);
      await favorites.delete(id);
      return this.getFavorites();
    } catch (error) {
      console.error('删除收藏失败:', error);
      return [];
    }
  }

  static async clearFavorites(): Promise<FavoriteItem[]> {
    try {
      if (!this.currentUserId) {
        console.log('未找到用户ID，无法清空收藏');
        return [];
      }

      console.log('清空用户收藏:', this.currentUserId);
      await favorites.clearByUserId(this.currentUserId);
      return [];
    } catch (error) {
      console.error('清空收藏失败:', error);
      return [];
    }
  }
} 