import { searchHistory, favorites } from './supabase';

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
    this.currentUserId = userId;
  }

  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      if (!this.currentUserId) {
        return [];
      }

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
        return [];
      }

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
        return [];
      }

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
        return [];
      }

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
        return [];
      }

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
        return [];
      }

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
        return [];
      }

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
        return [];
      }

      await favorites.clearByUserId(this.currentUserId);
      return [];
    } catch (error) {
      console.error('清空收藏失败:', error);
      return [];
    }
  }
} 