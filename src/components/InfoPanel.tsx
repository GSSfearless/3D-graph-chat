import React from 'react';
import { Node, NodeType, Edge } from '../types/graph';

interface InfoPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  edges: Edge[];
  nodes: Node[];
  onExpandNode: (nodeId: string) => void;
  isExpanded: (nodeId: string) => boolean;
}

const nodeTypeLabels: Record<NodeType, string> = {
  [NodeType.QUESTION]: '问题',
  [NodeType.CONCEPT]: '概念',
  [NodeType.EXAMPLE]: '示例',
  [NodeType.SUMMARY]: '总结',
  [NodeType.DETAIL]: '详细'
};

export const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedNode,
  onClose,
  edges,
  nodes,
  onExpandNode,
  isExpanded
}) => {
  // 获取相关节点
  const relatedNodes = React.useMemo(() => {
    const relatedNodeIds = new Set<string>();
    
    if (selectedNode) {
      edges.forEach(edge => {
        if (edge.source === selectedNode.id) {
          relatedNodeIds.add(edge.target);
        }
        if (edge.target === selectedNode.id) {
          relatedNodeIds.add(edge.source);
        }
      });
    }

    return nodes.filter(node => relatedNodeIds.has(node.id));
  }, [selectedNode, edges, nodes]);

  if (!selectedNode) return null;

  const isNodeExpanded = isExpanded(selectedNode.id);

  return (
    <div className="fixed top-4 right-4 w-80 bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-medium">节点信息</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm">类型</label>
          <p className="text-white">{nodeTypeLabels[selectedNode.type]}</p>
        </div>

        <div>
          <label className="text-gray-400 text-sm">内容</label>
          <p className="text-white">{selectedNode.content}</p>
        </div>

        <div>
          <label className="text-gray-400 text-sm">重要性</label>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-blue-500 rounded-full h-2"
              style={{ width: `${selectedNode.importance * 100}%` }}
            />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm">深度</label>
          <p className="text-white">{selectedNode.depth}</p>
        </div>

        {relatedNodes.length > 0 && (
          <div className="space-y-2">
            <label className="text-gray-400 text-sm">相关节点</label>
            <div className="space-y-1">
              {relatedNodes.map(node => (
                <div
                  key={node.id}
                  className="flex items-center justify-between bg-gray-700 rounded p-2"
                >
                  <span className="text-white text-sm">{node.content}</span>
                  <span className="text-gray-400 text-xs">{nodeTypeLabels[node.type]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <button
            className={`w-full py-2 px-4 rounded transition-colors duration-200 ${
              isNodeExpanded
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            onClick={() => onExpandNode(selectedNode.id)}
          >
            {isNodeExpanded ? '收起相关节点' : '展开相关节点'}
          </button>
        </div>
      </div>
    </div>
  );
}; 