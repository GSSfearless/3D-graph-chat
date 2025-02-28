import React, { useState, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
  children: [React.ReactNode, React.ReactNode]; // 上下两个面板的内容
  defaultTopHeight?: string; // 默认上面板高度
  minTopHeight?: string; // 最小上面板高度
  minBottomHeight?: string; // 最小下面板高度
  className?: string;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultTopHeight = '50%',
  minTopHeight = '30%',
  minBottomHeight = '30%',
  className = '',
}) => {
  const [topHeight, setTopHeight] = useState(defaultTopHeight);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = e.currentTarget as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const mouseY = e.clientY - containerRect.top;

      // 计算百分比
      let percentage = (mouseY / containerHeight) * 100;

      // 限制在最小高度范围内
      const minTop = parseFloat(minTopHeight);
      const minBottom = parseFloat(minBottomHeight);
      percentage = Math.max(minTop, Math.min(100 - minBottom, percentage));

      setTopHeight(`${percentage}%`);
    },
    [isDragging, minTopHeight, minBottomHeight]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`flex flex-col h-full relative ${className}`}>
      {/* 上面板 */}
      <div style={{ height: topHeight }} className="overflow-hidden">
        {children[0]}
      </div>

      {/* 分隔条 */}
      <div
        className="h-1 bg-gray-200 dark:bg-gray-700 cursor-row-resize hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* 下面板 */}
      <div style={{ height: `calc(100% - ${topHeight} - 4px)` }} className="overflow-hidden">
        {children[1]}
      </div>
    </div>
  );
};

export default ResizablePanel; 