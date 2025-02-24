'use client';

import React, { useState } from 'react';
import KnowledgeGraph from '../components/KnowledgeGraph';
import SelectedNodes from '../components/SelectedNodes';

interface Node {
  id: string;
  name: string;
  description?: string;
}

interface GraphNode {
  data: {
    id: string;
    label: string;
    description?: string;
  };
}

interface GraphEdge {
  data: {
    source: string;
    target: string;
  };
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function Home() {
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: []
  });

  // 处理节点选择
  const handleNodeSelect = (nodes: Node[]) => {
    setSelectedNodes(nodes);
  };

  // 处理开始探索
  const handleStartExplore = async () => {
    if (selectedNodes.length === 0) return;

    try {
      // 这里调用API获取新的知识图谱数据
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: selectedNodes
        }),
      });

      if (!response.ok) {
        throw new Error('探索请求失败');
      }

      const newData = await response.json() as GraphData;
      
      // 合并新旧数据，避免重复
      const existingNodeIds = new Set(graphData.nodes.map(n => n.data.id));
      const newNodes = newData.nodes.filter(n => !existingNodeIds.has(n.data.id));
      
      const existingEdgeIds = new Set(graphData.edges.map(e => `${e.data.source}-${e.data.target}`));
      const newEdges = newData.edges.filter(e => {
        const edgeId = `${e.data.source}-${e.data.target}`;
        return !existingEdgeIds.has(edgeId);
      });

      setGraphData({
        nodes: [...graphData.nodes, ...newNodes],
        edges: [...graphData.edges, ...newEdges]
      });
    } catch (error) {
      console.error('探索过程中出错:', error);
      // 这里可以添加错误提示UI
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 flex">
        {/* 左侧知识图谱区域 */}
        <div className="flex-1 relative">
          <KnowledgeGraph
            data={graphData}
            onNodeClick={(node) => {}}
            onNodeSelect={handleNodeSelect}
            selectedNodes={selectedNodes}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* 右侧内容区域 */}
        <div className="w-96 bg-white p-4 border-l border-gray-200 overflow-y-auto">
          <div className="space-y-4">
            {/* 内容展示区域 */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-2">内容详情</h2>
              {/* 这里可以添加节点详情内容 */}
            </div>
            
            {/* 选中节点列表 */}
            <SelectedNodes
              nodes={selectedNodes}
              onRemoveNode={(id) => {
                setSelectedNodes(selectedNodes.filter(n => n.id !== id));
              }}
              onClearAll={() => setSelectedNodes([])}
              onStartExplore={handleStartExplore}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 