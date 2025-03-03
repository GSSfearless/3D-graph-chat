import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// 优化预设的知识图谱演示数据 - 精简节点和边，提高可视性与美观度
const defaultData = {
  nodes: [
    { data: { id: 'knowledge-graph', label: '知识图谱', type: 'concept', size: 22, color: '#4F46E5' } },
    { data: { id: 'visualization', label: '可视化', type: 'concept', size: 16, color: '#6366F1' } },
    { data: { id: '3d-rendering', label: '3D渲染', type: 'technology', size: 16, color: '#8B5CF6' } },
    { data: { id: 'interactive', label: '交互性', type: 'feature', size: 14, color: '#EC4899' } },
    { data: { id: 'ai', label: '人工智能', type: 'technology', size: 18, color: '#8B5CF6' } },
    { data: { id: 'nlp', label: '自然语言处理', type: 'technology', size: 16, color: '#8B5CF6' } },
    { data: { id: 'spatial', label: '空间思维', type: 'concept', size: 15, color: '#6366F1' } },
    { data: { id: 'thinking', label: '立体思考', type: 'concept', size: 17, color: '#6366F1' } }
  ],
  edges: [
    { data: { id: 'e1', source: 'knowledge-graph', target: 'visualization', label: '包含', weight: 5 } },
    { data: { id: 'e2', source: 'knowledge-graph', target: '3d-rendering', label: '使用', weight: 4 } },
    { data: { id: 'e3', source: 'knowledge-graph', target: 'interactive', label: '提供', weight: 3 } },
    { data: { id: 'e4', source: 'knowledge-graph', target: 'ai', label: '结合', weight: 5 } },
    { data: { id: 'e5', source: 'ai', target: 'nlp', label: '应用', weight: 4 } },
    { data: { id: 'e6', source: 'knowledge-graph', target: 'spatial', label: '促进', weight: 3 } },
    { data: { id: 'e7', source: 'spatial', target: 'thinking', label: '提升', weight: 4 } },
    { data: { id: 'e8', source: 'visualization', target: 'thinking', label: '辅助', weight: 3 } },
    { data: { id: 'e9', source: '3d-rendering', target: 'interactive', label: '增强', weight: 3 } }
  ]
};

// 动态导入KnowledgeGraph组件，避免SSR问题
const KnowledgeGraph = dynamic(() => import('./KnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-blue-600 font-medium">正在加载3D图谱...</div>
      </div>
    </div>
  )
});

const DemoKnowledgeGraph = ({ className = "" }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adaptedData, setAdaptedData] = useState(defaultData);
  const [shouldHideLabels, setShouldHideLabels] = useState(false);
  const containerRef = useRef(null);

  // 组件挂载时设置状态
  useEffect(() => {
    // 确保在客户端渲染
    setIsMounted(true);
    
    // 模拟加载延迟，确保DOM完全就绪
    const initTimer = setTimeout(() => {
      adaptToScreenSize();
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
      
      // 设置另一个短延迟，确保加载标志在初始化后设置
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 300);
      
      return () => clearTimeout(loadTimer);
    }, 200);
    
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 窗口大小变化时调整图谱
  const handleResize = () => {
    adaptToScreenSize();
  };

  // 根据屏幕大小适配数据
  const adaptToScreenSize = () => {
    // 仅在客户端执行
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    const newData = JSON.parse(JSON.stringify(defaultData));
    
    // 根据屏幕尺寸调整节点大小
    if (width < 768) {
      // 小屏幕调整
      newData.nodes = newData.nodes.map(node => {
        node.data = {
          ...node.data,
          size: Math.max(10, node.data.size * 0.75) // 确保最小尺寸不低于10
        };
        return node;
      });
      
      // 小屏幕隐藏标签
      setShouldHideLabels(width < 480);
    } else {
      // 大屏幕保持原样
      setShouldHideLabels(false);
    }
    
    setAdaptedData(newData);
  };

  // 加载状态
  if (!isMounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`} 
      style={{ 
        position: 'relative', 
        minHeight: '500px',
        zIndex: 1 
      }}
    >
      <KnowledgeGraph
        data={adaptedData}
        autoRotate={true}
        hideControls={true} 
        disableLabels={shouldHideLabels}
        onNodeClick={(nodeData) => console.log('节点点击:', nodeData)}
        style={{ 
          width: "100%", 
          height: "100%", 
          position: "absolute",
          top: 0,
          left: 0
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-blue-600 font-medium">图谱初始化中...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoKnowledgeGraph; 