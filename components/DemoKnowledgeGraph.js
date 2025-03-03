import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// 预设的知识图谱演示数据 - 精简节点和边，提高可视性
const defaultData = {
  nodes: [
    { data: { id: 'knowledge-graph', label: '知识图谱', type: 'concept', size: 18, color: '#4F46E5' } },
    { data: { id: 'visualization', label: '可视化', type: 'concept', size: 14, color: '#6366F1' } },
    { data: { id: '3d-rendering', label: '3D渲染', type: 'technology', size: 14, color: '#8B5CF6' } },
    { data: { id: 'interactive', label: '交互性', type: 'feature', size: 12, color: '#EC4899' } },
    { data: { id: 'ai', label: '人工智能', type: 'technology', size: 16, color: '#8B5CF6' } },
    { data: { id: 'nlp', label: '自然语言处理', type: 'technology', size: 14, color: '#8B5CF6' } },
    { data: { id: 'spatial', label: '空间思维', type: 'concept', size: 13, color: '#6366F1' } },
    { data: { id: 'thinking', label: '立体思考', type: 'concept', size: 15, color: '#6366F1' } }
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
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

const DemoKnowledgeGraph = ({ className = "" }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [adaptedData, setAdaptedData] = useState(defaultData);
  const [shouldHideLabels, setShouldHideLabels] = useState(false);
  const containerRef = useRef(null);

  // 组件挂载时设置状态
  useEffect(() => {
    setIsMounted(true);
    
    // 初始化适配数据
    adaptToScreenSize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    return () => {
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
    
    // 小屏幕时缩小节点尺寸
    if (width < 768) {
      newData.nodes = newData.nodes.map(node => {
        node.data = {
          ...node.data,
          size: Math.max(8, node.data.size * 0.7) // 确保最小尺寸不低于8
        };
        return node;
      });
      
      // 小屏幕时隐藏标签
      setShouldHideLabels(width < 480);
    } else {
      setShouldHideLabels(false);
    }
    
    setAdaptedData(newData);
  };

  if (!isMounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <KnowledgeGraph
        data={adaptedData}
        autoRotate={true}
        hideControls={false}
        disableLabels={shouldHideLabels}
        onNodeClick={(nodeData) => console.log('节点点击:', nodeData)}
      />
    </div>
  );
};

export default DemoKnowledgeGraph; 