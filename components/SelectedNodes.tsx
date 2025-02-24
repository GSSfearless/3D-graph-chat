import React from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  name: string;
  description?: string;
}

interface SelectedNodesProps {
  nodes: Node[];
  onRemoveNode: (id: string) => void;
  onClearAll: () => void;
  onStartExplore: () => void;
  maxNodes?: number;
}

const SelectedNodes: React.FC<SelectedNodesProps> = ({
  nodes,
  onRemoveNode,
  onClearAll,
  onStartExplore,
  maxNodes = 5
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">已选择的节点 ({nodes.length})</h3>
        {nodes.length >= maxNodes && (
          <span className="text-red-500 text-sm">已达到最大选择数量</span>
        )}
      </div>
      
      <div className="space-y-2">
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-gray-50 p-2 rounded"
          >
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full mr-2">
                {index + 1}
              </span>
              <div>
                <div className="font-medium">{node.name}</div>
                {node.description && (
                  <div className="text-sm text-gray-500">{node.description}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemoveNode(node.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t">
        <button
          onClick={onClearAll}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          清空选择
        </button>
        <button
          onClick={onStartExplore}
          disabled={nodes.length === 0}
          className={`px-4 py-2 rounded-md text-sm ${
            nodes.length === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          开始探索
        </button>
      </div>
    </div>
  );
};

export default SelectedNodes; 