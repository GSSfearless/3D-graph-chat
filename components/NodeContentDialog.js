import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMinus, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

const NodeContentDialog = ({ node, onClose, isVisible }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const constraintsRef = useRef(null);

  // 处理拖动结束
  const handleDragEnd = (event, info) => {
    setPosition({ x: info.point.x, y: info.point.y });
    setIsDragging(false);
  };

  // 处理最小化/最大化
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsFullscreen(false);
  };

  // 处理全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsMinimized(false);
  };

  if (!isVisible) return null;

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={position}
        animate={{
          x: isFullscreen ? 0 : position.x,
          y: isFullscreen ? 0 : position.y,
          width: isFullscreen ? '100vw' : isMinimized ? '300px' : '400px',
          height: isFullscreen ? '100vh' : isMinimized ? '60px' : '600px',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed pointer-events-auto"
        style={{ 
          touchAction: 'none',
        }}
      >
        <div className={`
          bg-white/90 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200
          flex flex-col w-full h-full overflow-hidden
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}>
          {/* 标题栏 */}
          <div className="flex items-center justify-between p-4 bg-gray-50/80 border-b border-gray-200 cursor-grab">
            <h3 className="text-lg font-semibold text-gray-700 truncate pr-4">
              {node?.data?.label || '节点内容'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                title={isMinimized ? "展开" : "最小化"}
              >
                <FontAwesomeIcon icon={faMinus} className="text-gray-600 w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                title={isFullscreen ? "退出全屏" : "全屏"}
              >
                <FontAwesomeIcon 
                  icon={isFullscreen ? faCompress : faExpand} 
                  className="text-gray-600 w-4 h-4" 
                />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                title="关闭"
              >
                <FontAwesomeIcon icon={faXmark} className="text-gray-600 w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: node?.data?.content || '暂无内容'
                }} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NodeContentDialog; 