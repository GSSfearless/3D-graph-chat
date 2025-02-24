import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Dialog } from '@headlessui/react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/supabase';
import { Navbar } from '../components/Navbar';
import LeftSidebar from '../components/LeftSidebar';
import { Button } from '../components/ui/button';
import { KnowledgeGraphProcessor } from '../utils/knowledge-processor';
import dynamic from 'next/dynamic';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading knowledge graph...</div>
});

export default function Search() {
  const router = useRouter();
  const { user } = useAuth();
  const { q: initialQuery } = router.query;
  const [query, setQuery] = useState(initialQuery as string || '');
  const [loading, setLoading] = useState(false);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [reasoningProcess, setReasoningProcess] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const knowledgeProcessor = useRef(new KnowledgeGraphProcessor());

  // 添加收藏功能状态
  const [showFavoriteDialog, setShowFavoriteDialog] = useState(false);
  const [favoriteTitle, setFavoriteTitle] = useState('');
  const [favoriteDescription, setFavoriteDescription] = useState('');

  useEffect(() => {
    if (initialQuery && user) {
      addToSearchHistory(initialQuery.toString());
    }
  }, [initialQuery, user]);

  const addToSearchHistory = async (searchQuery: string) => {
    if (!user) return;

    try {
      await db.searchHistory.add(searchQuery, user.id);
    } catch (error) {
      console.error('Failed to add search history:', error);
    }
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    if (user) {
      await addToSearchHistory(searchQuery);
    }
    
    setLoading(true);
    try {
      // 这里是您的搜索逻辑
      // ...
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAddToFavorites = async () => {
    if (!user || !streamedAnswer) return;

    try {
      await db.favorites.add({
        user_id: user.id,
        title: favoriteTitle || query,
        description: favoriteDescription || streamedAnswer.substring(0, 200),
        graph_data: graphData,
        tags: []
      });
      setShowFavoriteDialog(false);
      setFavoriteTitle('');
      setFavoriteDescription('');
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* 主要内容区域 */}
          <main className="w-full px-4 py-2">
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
              {/* 3D知识图谱显示区域 */}
              <div className="col-span-9 relative">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full sticky top-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : graphData ? (
                    <div className="relative h-full">
                      <KnowledgeGraph
                        data={graphData}
                        onNodeClick={setSelectedNode}
                        style={{ height: '100%' }}
                      />
                      {user && streamedAnswer && (
                        <button
                          onClick={() => setShowFavoriteDialog(true)}
                          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm border border-gray-200"
                        >
                          <Star className="w-5 h-5 text-yellow-400" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">在下方输入问题开始查询</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 文本显示区域 */}
              <div className="col-span-3 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  {streamedAnswer && (
                    <div className="prose prose-sm max-w-none">
                      {streamedAnswer}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 底部搜索区域 */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-center space-x-4">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-2 bg-white/50 border border-gray-200 rounded-xl"
                  />
                  <Button
                    onClick={() => handleSearch(query)}
                    disabled={loading}
                    className="px-6"
                  >
                    搜索
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 收藏对话框 */}
      <Dialog
        open={showFavoriteDialog}
        onClose={() => setShowFavoriteDialog(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="relative bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4">
              添加到收藏
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  value={favoriteTitle}
                  onChange={(e) => setFavoriteTitle(e.target.value)}
                  placeholder="输入标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={favoriteDescription}
                  onChange={(e) => setFavoriteDescription(e.target.value)}
                  placeholder="输入描述"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFavoriteDialog(false)}
                >
                  取消
                </Button>
                <Button onClick={handleAddToFavorites}>
                  确认
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 