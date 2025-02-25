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

  static setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      const history = await searchHistory.getByUserId(this.currentUserId);
      return history.map(item => ({
        id: item.id,
        query: item.query,
        timestamp: new Date(item.created_at).getTime()
      }));
    } catch (error) {
      console.error('History error:', error);
      return [];
    }
  }

  static async addSearchHistory(query: string): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      // 防止短时间内重复添加相同查询
      const now = Date.now();
      if (this.lastQuery === query && now - this.lastQueryTime < 5000) {
        return this.getSearchHistory();
      }

      this.lastQuery = query;
      this.lastQueryTime = now;

      await searchHistory.add({
        query,
        user_id: this.currentUserId
      });

      return this.getSearchHistory();
    } catch (error) {
      console.error('Add history error:', error);
      return [];
    }
  }

  static async removeSearchHistory(id: string): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      await searchHistory.delete(id);
      return this.getSearchHistory();
    } catch (error) {
      console.error('Remove history error:', error);
      return [];
    }
  }

  static async clearSearchHistory(): Promise<SearchHistoryItem[]> {
    if (!this.currentUserId) return [];

    try {
      await searchHistory.clearByUserId(this.currentUserId);
      return [];
    } catch (error) {
      console.error('Clear history error:', error);
      return [];
    }
  }

  static async getFavorites(): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      const favs = await favorites.getByUserId(this.currentUserId);
      return favs.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        timestamp: new Date(item.created_at).getTime(),
        graph_data: item.graph_data
      }));
    } catch (error) {
      console.error('Favorites error:', error);
      return [];
    }
  }

  static async addFavorite(item: Omit<FavoriteItem, 'id' | 'timestamp'>): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      await favorites.add({
        ...item,
        user_id: this.currentUserId
      });

      return this.getFavorites();
    } catch (error) {
      console.error('Add favorite error:', error);
      return [];
    }
  }

  static async removeFavorite(id: string): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      await favorites.delete(id);
      return this.getFavorites();
    } catch (error) {
      console.error('Remove favorite error:', error);
      return [];
    }
  }

  static async clearFavorites(): Promise<FavoriteItem[]> {
    if (!this.currentUserId) return [];

    try {
      await favorites.clearByUserId(this.currentUserId);
      return [];
    } catch (error) {
      console.error('Clear favorites error:', error);
      return [];
    }
  }
} 