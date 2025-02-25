import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 知识图谱节点表操作
export const graphNodes = {
  // 创建新节点
  async create(node: {
    label: string;
    type: string;
    properties?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('graph_nodes')
      .insert([node])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取所有节点
  async getAll() {
    const { data, error } = await supabase
      .from('graph_nodes')
      .select('*');

    if (error) throw error;
    return data;
  },

  // 根据ID获取节点
  async getById(id: string) {
    const { data, error } = await supabase
      .from('graph_nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // 更新节点
  async update(id: string, updates: Partial<{
    label: string;
    type: string;
    properties: Record<string, any>;
  }>) {
    const { data, error } = await supabase
      .from('graph_nodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除节点
  async delete(id: string) {
    const { error } = await supabase
      .from('graph_nodes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// 知识图谱边表操作
export const graphEdges = {
  // 创建新边
  async create(edge: {
    source_id: string;
    target_id: string;
    label: string;
    type: string;
    weight?: number;
    properties?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('graph_edges')
      .insert([edge])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取所有边
  async getAll() {
    const { data, error } = await supabase
      .from('graph_edges')
      .select('*');

    if (error) throw error;
    return data;
  },

  // 获取与节点相关的所有边
  async getByNodeId(nodeId: string) {
    const { data, error } = await supabase
      .from('graph_edges')
      .select('*')
      .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`);

    if (error) throw error;
    return data;
  },

  // 更新边
  async update(id: string, updates: Partial<{
    label: string;
    type: string;
    weight: number;
    properties: Record<string, any>;
  }>) {
    const { data, error } = await supabase
      .from('graph_edges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除边
  async delete(id: string) {
    const { error } = await supabase
      .from('graph_edges')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// 搜索历史表操作
export const searchHistory = {
  // 添加搜索记录
  async add(item: {
    query: string;
    user_id?: string;
  }) {
    const { data, error } = await supabase
      .from('search_history')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取用户的搜索历史
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 删除搜索记录
  async delete(id: string) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 清空用户的搜索历史
  async clearByUserId(userId: string) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// 收藏夹表操作
export const favorites = {
  // 添加收藏
  async add(item: {
    title: string;
    description: string;
    user_id?: string;
    graph_data?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取用户的收藏
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 删除收藏
  async delete(id: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 清空用户的收藏
  async clearByUserId(userId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
}; 