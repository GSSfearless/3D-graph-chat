-- 为 search_history 表启用 RLS
alter table search_history enable row level security;

-- 创建 search_history 的策略
create policy "用户可以查看自己的搜索历史"
  on search_history for select
  using (auth.uid() = user_id);

create policy "用户可以添加搜索历史"
  on search_history for insert
  with check (auth.uid() = user_id);

create policy "用户可以删除自己的搜索历史"
  on search_history for delete
  using (auth.uid() = user_id);

-- 为 favorites 表启用 RLS
alter table favorites enable row level security;

-- 创建 favorites 的策略
create policy "用户可以查看自己的收藏"
  on favorites for select
  using (auth.uid() = user_id);

create policy "用户可以添加收藏"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "用户可以删除自己的收藏"
  on favorites for delete
  using (auth.uid() = user_id);

-- 为 graph_nodes 表启用 RLS
alter table graph_nodes enable row level security;

-- 创建 graph_nodes 的策略
create policy "所有用户可以查看节点"
  on graph_nodes for select
  to authenticated
  using (true);

-- 为 graph_edges 表启用 RLS
alter table graph_edges enable row level security;

-- 创建 graph_edges 的策略
create policy "所有用户可以查看边"
  on graph_edges for select
  to authenticated
  using (true); 