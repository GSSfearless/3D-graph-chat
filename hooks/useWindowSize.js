import { useState, useEffect } from 'react';

export function useWindowSize() {
  // 初始化状态为undefined，这样在服务端渲染时不会出错
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      // 处理窗口大小变化的函数
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      
      // 添加事件监听器
      window.addEventListener('resize', handleResize);
      
      // 立即调用一次获取初始尺寸
      handleResize();
      
      // 清理函数
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []); // 空依赖数组确保效果只运行一次

  return windowSize;
} 