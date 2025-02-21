import React from 'react';
import { NodeType } from '../types/graph';

interface GraphToolbarProps {
  onResetView: () => void;
  onToggleNodeType: (type: NodeType) => void;
  visibleNodeTypes: Set<NodeType>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoLayout: () => void;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  onResetView,
  onToggleNodeType,
  visibleNodeTypes,
  onZoomIn,
  onZoomOut,
  onAutoLayout
}) => {
  return (
    <div className="fixed top-4 left-4 bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">节点类型</h3>
        {Object.values(NodeType).map(type => (
          <label key={type} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={visibleNodeTypes.has(type)}
              onChange={() => onToggleNodeType(type)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span className="text-white text-sm">{type}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-medium">视图控制</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onZoomIn}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded"
          >
            放大
          </button>
          <button
            onClick={onZoomOut}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded"
          >
            缩小
          </button>
        </div>
        <button
          onClick={onResetView}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded"
        >
          重置视图
        </button>
        <button
          onClick={onAutoLayout}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-1 px-2 rounded"
        >
          自动布局
        </button>
      </div>

      <div className="pt-2 border-t border-gray-700">
        <p className="text-gray-400 text-xs">
          提示：双击节点可以展开/收起相关节点
        </p>
      </div>
    </div>
  );
}; 