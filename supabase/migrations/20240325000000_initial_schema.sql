-- 启用必要的扩展
create extension if not exists "uuid-ossp";

-- 创建知识图谱节点表
create table if not exists graph_nodes (
    id uuid default uuid_generate_v4() primary key,
    label text not null,
    type text not null,
    properties jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建知识图谱边表
create table if not exists graph_edges (
    id uuid default uuid_generate_v4() primary key,
    source_id uuid references graph_nodes(id) on delete cascade,
    target_id uuid references graph_nodes(id) on delete cascade,
    label text not null,
    type text not null,
    weight float default 1.0,
    properties jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建搜索历史表
create table if not exists search_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    query text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建收藏表
create table if not exists favorites (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    description text,
    graph_data jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建更新时间触发器函数
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- 为需要自动更新 updated_at 的表添加触发器
create trigger update_graph_nodes_updated_at
    before update on graph_nodes
    for each row
    execute function update_updated_at_column();

create trigger update_graph_edges_updated_at
    before update on graph_edges
    for each row
    execute function update_updated_at_column();

create trigger update_favorites_updated_at
    before update on favorites
    for each row
    execute function update_updated_at_column();

-- 创建索引以提高查询性能
create index if not exists idx_graph_nodes_label on graph_nodes using gin (to_tsvector('english', label));
create index if not exists idx_graph_edges_source on graph_edges(source_id);
create index if not exists idx_graph_edges_target on graph_edges(target_id);
create index if not exists idx_search_history_user on search_history(user_id);
create index if not exists idx_search_history_created_at on search_history(created_at);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_favorites_created_at on favorites(created_at); 