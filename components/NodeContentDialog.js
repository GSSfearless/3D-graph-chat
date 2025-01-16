import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMinus, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

const thinkingSteps = [
  "正在分析节点内容...",
  "正在建立关联...",
  "正在整理想法...",
  "正在组织语言...",
  "马上就好..."
];

const NodeContentDialog = ({ 
  node, 
  onClose, 
  isVisible, 
  currentQuestion, 
  cachedExplanation,
  isInitialAnswer = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [displayedExplanation, setDisplayedExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const constraintsRef = useRef(null);
  const thinkingInterval = useRef(null);

  useEffect(() => {
    if (isVisible && node) {
      if (isInitialAnswer) {
        // 如果是初始回答，直接使用内容
        setExplanation(node.data.content);
      } else if (cachedExplanation) {
        // 如果有缓存的解释，直接使用
        setExplanation(cachedExplanation);
      } else {
        // 否则加载新的解释
        loadRelationExplanation();
      }
    }
    return () => {
      if (thinkingInterval.current) {
        clearInterval(thinkingInterval.current);
      }
    };
  }, [isVisible, node, cachedExplanation, isInitialAnswer]);

  // 打字机效果
  useEffect(() => {
    if (explanation) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= explanation.length) {
          setDisplayedExplanation(explanation.slice(0, currentIndex));
          currentIndex += 3; // 每次显示3个字符
        } else {
          clearInterval(interval);
        }
      }, 10); // 每10ms更新一次

      return () => clearInterval(interval);
    }
  }, [explanation]);

  const loadRelationExplanation = async () => {
    if (!node || !currentQuestion) return;

    setIsLoading(true);
    setExplanation('');
    setDisplayedExplanation('');

    // 启动思考步骤动画
    let step = 0;
    thinkingInterval.current = setInterval(() => {
      setThinkingStep(step);
      step = (step + 1) % thinkingSteps.length;
    }, 1500);

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
      if (thinkingInterval.current) {
        clearInterval(thinkingInterval.current);
      }
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
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100]">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={constraintsRef}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
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
          zIndex: 100,
          position: 'fixed',
          left: 0,
          top: 0,
          transform: `translate(${position.x}px, ${position.y}px)`,
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <div className={`
          bg-white/90 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200
          flex flex-col w-full h-full overflow-hidden
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          transition-transform duration-200
        `}>
          {/* 标题栏 */}
          <div className="flex items-center justify-between p-4 bg-gray-50/80 border-b border-gray-200 cursor-grab">
            <h3 className="text-lg font-semibold text-gray-700 truncate pr-4">
              {isInitialAnswer ? '完整回答' : (node?.data?.label || '节点内容')}
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
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={thinkingStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-gray-600 text-center"
                    >
                      {thinkingSteps[thinkingStep]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : explanation.includes('error') || explanation.includes('失败') ? (
                <div className="flex flex-col items-center justify-center space-y-4 text-red-500">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">处理出现问题</h3>
                    <p className="text-sm text-gray-600">请稍后重试或刷新页面</p>
                  </div>
                </div>
              ) : (
                <div className="markdown-content prose prose-slate max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(displayedExplanation) || '正在加载解释...'
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