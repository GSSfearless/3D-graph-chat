import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMinus, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

const NodeContentDialog = ({ node, onClose, isVisible, currentQuestion }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (isVisible && node) {
      loadRelationExplanation();
    }
  }, [isVisible, node]);

  const loadRelationExplanation = async () => {
    if (!node || !currentQuestion) return;

    setIsLoading(true);
    setExplanation('');

    try {
      const response = await fetch('/api/nodeRelation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeContent: node.data.content,
          nodeLabel: node.data.label,
          userQuestion: currentQuestion
        })
      });

      if (!response.ok) throw new Error('Failed to fetch explanation');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        accumulatedText += text;
        setExplanation(accumulatedText);
      }
    } catch (error) {
      console.error('Error loading relation explanation:', error);
      setExplanation('加载解释时出错，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderMarkdown = (content) => {
    if (!content) return '';
    const html = md.render(content);
    return html;
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
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-gray-600">正在分析关联性...</span>
                </div>
              ) : (
                <div className="markdown-content prose prose-slate max-w-none">
                  <style jsx global>{`
                    .markdown-content h1 {
                      font-size: 1.5rem;
                      font-weight: 600;
                      margin-bottom: 1rem;
                      color: #1a202c;
                    }
                    .markdown-content h2 {
                      font-size: 1.25rem;
                      font-weight: 600;
                      margin-bottom: 0.75rem;
                      color: #2d3748;
                    }
                    .markdown-content h3 {
                      font-size: 1.125rem;
                      font-weight: 600;
                      margin-bottom: 0.5rem;
                      color: #4a5568;
                    }
                    .markdown-content p {
                      margin-bottom: 1rem;
                      line-height: 1.625;
                      color: #4a5568;
                    }
                    .markdown-content ul {
                      list-style-type: disc;
                      margin-left: 1.5rem;
                      margin-bottom: 1rem;
                    }
                    .markdown-content li {
                      margin-bottom: 0.5rem;
                      line-height: 1.5;
                    }
                    .markdown-content strong {
                      color: #2b6cb0;
                      font-weight: 600;
                    }
                    .markdown-content blockquote {
                      border-left: 4px solid #e2e8f0;
                      padding-left: 1rem;
                      margin-left: 0;
                      margin-right: 0;
                      font-style: italic;
                      color: #718096;
                    }
                  `}</style>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(explanation) || '正在加载解释...'
                    }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NodeContentDialog; 