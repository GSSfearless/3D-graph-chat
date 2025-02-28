import React, { useState } from 'react';
import KnowledgeGraph from '../components/KnowledgeGraph';
import RightPanel from '../components/RightPanel';
import '../utils/i18n'; // 导入i18n配置

// 示例数据
const sampleData = {
  nodes: [
    {
      data: {
        id: 'node-1',
        label: '知识图谱',
        description: '这是一个知识图谱节点的示例描述。',
        properties: {
          类型: '概念',
          创建时间: '2024-02-28',
        },
      }
    },
    {
      data: {
        id: 'node-2',
        label: '图数据库',
        description: '用于存储图结构数据的数据库系统。',
        properties: {
          类型: '技术',
          状态: '活跃',
        },
      }
    },
    {
      data: {
        id: 'node-3',
        label: '语义网络',
        description: '表示知识的网络结构。',
        properties: {
          类型: '概念',
          领域: '人工智能',
        },
      }
    },
  ],
  edges: [
    {
      source: 'node-1',
      target: 'node-2',
      label: '使用',
    },
    {
      source: 'node-1',
      target: 'node-3',
      label: '基于',
    },
  ],
};

export default function Home() {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleNodeClose = () => {
    setSelectedNode(null);
  };

  return (
    <main className="flex min-h-screen">
      {/* 左侧知识图谱 */}
      <div className="flex-1 h-screen">
        <KnowledgeGraph
          data={sampleData}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* 右侧面板 */}
      <div className="w-[600px] h-screen border-l border-gray-200 dark:border-gray-700">
        <RightPanel
          selectedNode={selectedNode}
          onNodeClose={handleNodeClose}
        >
          {/* AI对话内容 */}
          <div className="h-full bg-white dark:bg-gray-800 p-4">
            {/* 这里放置AI对话组件 */}
            <div className="text-gray-500 dark:text-gray-400 text-center mt-4">
              AI对话区域
            </div>
          </div>
        </RightPanel>
      </div>
    </main>
  );
} 