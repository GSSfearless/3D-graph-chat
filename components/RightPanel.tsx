import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface RightPanelProps {
  selectedNode: any;
  onNodeClose: () => void;
  children: React.ReactNode;
}

const RightPanel: React.FC<RightPanelProps> = ({ selectedNode, onNodeClose, children }) => {
  const [detailsHeight, setDetailsHeight] = useState<number>(40); // 40% as default height

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const startY = e.clientY;
    const startHeight = detailsHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const containerHeight = container.clientHeight;
      const newHeight = (startHeight * containerHeight + deltaY) / containerHeight * 100;
      
      // Limit the height between 20% and 80%
      setDetailsHeight(Math.min(Math.max(newHeight, 20), 80));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-full flex flex-col">
      {selectedNode && (
        <div style={{ height: `${detailsHeight}%` }} className="border-b border-gray-200">
          <div className="h-full overflow-auto p-4">
            {/* 节点详情头部 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedNode.label}
              </h2>
              <button
                onClick={onNodeClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* 节点类型/标签 */}
            <div className="flex gap-2 mb-4">
              {selectedNode.properties && Object.entries(selectedNode.properties).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                >
                  {key}: {String(value)}
                </span>
              ))}
            </div>

            {/* 节点描述 */}
            <div className="mb-4">
              <p className="text-gray-600">
                {selectedNode.description || '暂无描述'}
              </p>
            </div>

            {/* 关联关系 */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">关联关系</h3>
              <div className="space-y-2">
                {/* 这里可以添加关联节点的列表 */}
                <p className="text-gray-500">暂无关联关系</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分隔条 */}
      {selectedNode && (
        <div
          className="h-2 bg-gray-100 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center"
          onMouseDown={handleDrag}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* AI对话区域 */}
      <div style={{ height: selectedNode ? `${100 - detailsHeight}%` : '100%' }} className="overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default RightPanel; 