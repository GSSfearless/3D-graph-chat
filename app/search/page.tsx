'use client';

import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeGraphProcessor } from '../../utils/knowledge-processor';
import LeftSidebar from '../../components/LeftSidebar';
import { HistoryManager } from '../../utils/history-manager';
import { useAuth } from '../../contexts/AuthContext';

const KnowledgeGraph = dynamic(() => import('../../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading knowledge graph...</div>
});

export default function Search() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const processor = useRef(new KnowledgeGraphProcessor());
  const historyManager = useRef(new HistoryManager());

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsLoading(true);
    try {
      const result = await processor.current.processQuery(searchInput);
      setGraphData(result);
      historyManager.current.addToHistory(searchInput, result);
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    // 处理节点点击事件
    console.log('Node clicked:', node);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧边栏 */}
      <LeftSidebar
        history={historyManager.current.getHistory()}
        onHistoryItemClick={(item) => {
          setSearchInput(item.query);
          setGraphData(item.result);
        }}
      />

      {/* 主要内容区域 */}
      <main className="flex-1 flex flex-col">
        {/* 搜索栏 */}
        <div className="p-4 border-b dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="输入你的查询..."
              className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>处理中...</span>
              ) : (
                <FontAwesomeIcon icon={faArrowRight} />
              )}
            </button>
          </form>
        </div>

        {/* 图谱显示区域 */}
        <div className="flex-1 relative">
          {graphData ? (
            <KnowledgeGraph
              data={graphData}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
              {isLoading ? (
                <div className="loading-animation">加载中...</div>
              ) : (
                <div className="text-center">
                  <p className="mb-4">输入查询以生成知识图谱</p>
                  <FontAwesomeIcon icon={faDiscord} className="text-4xl" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 