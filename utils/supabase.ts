import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
);

// 类型定义
export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query: string;
  created_at: string;
  metadata: {
    resultCount?: number;
    searchType?: string;
  };
}

export interface FavoriteItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  graph_data?: any;
  tags: string[];
}

// 错误处理工具
const handleError = (error: any) => {
  console.error('Supabase operation failed:', error);
  throw new Error(error.message || 'Database operation failed');
};

// 数据库操作函数
export const db = {
  // 搜索历史相关操作
  searchHistory: {
    async add(query: string, userId: string) {
      try {
        const { data, error } = await supabase
          .from('search_history')
          .insert([
            {
              user_id: userId,
              query,
              metadata: {
                timestamp: new Date().toISOString(),
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null
              }
            }
          ])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error);
      }
    },

    async getAll(userId: string) {
      try {
        const { data, error } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50); // 限制返回最近的50条记录
        
        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error);
      }
    },

    async remove(id: string, userId: string) {
      try {
        const { error } = await supabase
          .from('search_history')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        handleError(error);
      }
    },

    async clear(userId: string) {
      try {
        const { error } = await supabase
          .from('search_history')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        handleError(error);
      }
    }
  },

  // 收藏相关操作
  favorites: {
    async add(data: Omit<FavoriteItem, 'id' | 'created_at'>) {
      try {
        const { data: newFavorite, error } = await supabase
          .from('favorites')
          .insert([{
            ...data,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) throw error;
        return newFavorite;
      } catch (error) {
        handleError(error);
      }
    },

    async getAll(userId: string) {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error);
      }
    },

    async remove(id: string, userId: string) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        handleError(error);
      }
    },

    async clear(userId: string) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        handleError(error);
      }
    }
  },

  // 用户会话管理
  auth: {
    async getSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
      } catch (error) {
        handleError(error);
      }
    },

    async getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
      } catch (error) {
        handleError(error);
      }
    }
  }
}; 