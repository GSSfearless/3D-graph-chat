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
}

const HISTORY_KEY = 'searchHistory';
const FAVORITES_KEY = 'favorites';
const MAX_HISTORY_ITEMS = 50;

export const HistoryManager = {
  addSearchHistory: (query: string) => {
    const history = HistoryManager.getSearchHistory();
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: Date.now(),
    };

    // 添加到开头并限制数量
    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  },

  getSearchHistory: (): SearchHistoryItem[] => {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  },

  removeSearchHistory: (id: string) => {
    const history = HistoryManager.getSearchHistory();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  },

  clearSearchHistory: () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    return [];
  },

  addFavorite: (title: string, description: string) => {
    const favorites = HistoryManager.getFavorites();
    const newItem: FavoriteItem = {
      id: Date.now().toString(),
      title,
      description,
      timestamp: Date.now(),
    };

    const newFavorites = [newItem, ...favorites];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    return newFavorites;
  },

  getFavorites: (): FavoriteItem[] => {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },

  removeFavorite: (id: string) => {
    const favorites = HistoryManager.getFavorites();
    const newFavorites = favorites.filter(item => item.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    return newFavorites;
  },

  clearFavorites: () => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
    return [];
  },
}; 