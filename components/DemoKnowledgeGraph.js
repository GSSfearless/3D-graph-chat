import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 预设的知识图谱演示数据
const defaultData = {
  nodes: [
    { data: { id: 'knowledge-graph', label: '知识图谱', type: 'concept', size: 15, color: '#6366F1' } },
    { data: { id: 'visualization', label: '可视化', type: 'concept', size: 12, color: '#6366F1' } },
    { data: { id: '3d-rendering', label: '3D渲染', type: 'technology', size: 12, color: '#8B5CF6' } },
    { data: { id: 'interactive', label: '交互性', type: 'feature', size: 10, color: '#EC4899' } },
    { data: { id: 'data-mining', label: '数据挖掘', type: 'technology', size: 12, color: '#8B5CF6' } },
    { data: { id: 'ai', label: '人工智能', type: 'technology', size: 13, color: '#8B5CF6' } },
    { data: { id: 'ml', label: '机器学习', type: 'technology', size: 11, color: '#8B5CF6' } },
    { data: { id: 'nlp', label: '自然语言处理', type: 'technology', size: 12, color: '#8B5CF6' } },
    { data: { id: 'semantic', label: '语义分析', type: 'technology', size: 10, color: '#8B5CF6' } },
    { data: { id: 'entity', label: '实体识别', type: 'feature', size: 9, color: '#EC4899' } },
    { data: { id: 'relation', label: '关系抽取', type: 'feature', size: 9, color: '#EC4899' } },
    { data: { id: 'spatial', label: '空间思维', type: 'concept', size: 11, color: '#6366F1' } },
    { data: { id: 'cognition', label: '认知科学', type: 'concept', size: 11, color: '#6366F1' } },
    { data: { id: 'thinking', label: '立体思考', type: 'concept', size: 12, color: '#6366F1' } },
    { data: { id: 'learning', label: '学习效率', type: 'benefit', size: 10, color: '#F97316' } }
  ],
  edges: [
    { data: { id: 'e1', source: 'knowledge-graph', target: 'visualization', label: '包含', weight: 5 } },
    { data: { id: 'e2', source: 'knowledge-graph', target: '3d-rendering', label: '使用', weight: 4 } },
    { data: { id: 'e3', source: 'knowledge-graph', target: 'interactive', label: '提供', weight: 3 } },
    { data: { id: 'e4', source: 'knowledge-graph', target: 'data-mining', label: '基于', weight: 4 } },
    { data: { id: 'e5', source: 'knowledge-graph', target: 'ai', label: '应用', weight: 4 } },
    { data: { id: 'e6', source: 'ai', target: 'ml', label: '包含', weight: 5 } },
    { data: { id: 'e7', source: 'ai', target: 'nlp', label: '包含', weight: 5 } },
    { data: { id: 'e8', source: 'nlp', target: 'semantic', label: '处理', weight: 4 } },
    { data: { id: 'e9', source: 'nlp', target: 'entity', label: '识别', weight: 4 } },
    { data: { id: 'e10', source: 'nlp', target: 'relation', label: '抽取', weight: 4 } },
    { data: { id: 'e11', source: 'visualization', target: '3d-rendering', label: '使用', weight: 4 } },
    { data: { id: 'e12', source: 'visualization', target: 'spatial', label: '增强', weight: 3 } },
    { data: { id: 'e13', source: 'spatial', target: 'cognition', label: '改善', weight: 3 } },
    { data: { id: 'e14', source: 'cognition', target: 'thinking', label: '促进', weight: 3 } },
    { data: { id: 'e15', source: 'cognition', target: 'learning', label: '提高', weight: 3 } },
    { data: { id: 'e16', source: 'thinking', target: 'learning', label: '增强', weight: 3 } },
    { data: { id: 'e17', source: 'thinking', target: 'knowledge-graph', label: '应用于', weight: 4 } },
    { data: { id: 'e18', source: 'interactive', target: 'learning', label: '促进', weight: 2 } }
  ]
};

// 动态导入KnowledgeGraph组件，避免SSR问题
const KnowledgeGraph = dynamic(() => import('./KnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white/30 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

const DemoKnowledgeGraph = ({ className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  // 在客户端加载后再渲染组件并监听窗口大小变化
  useEffect(() => {
    setMounted(true);
    
    // 设置初始窗口大小
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    // 添加窗口大小变化监听
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    console.log("DemoKnowledgeGraph mounted, window size:", windowSize);
    
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // 根据屏幕大小调整节点尺寸
  const adjustedData = {
    ...defaultData,
    nodes: defaultData.nodes.map(node => {
      // 在小屏幕上减小节点尺寸
      const sizeAdjustment = windowSize.width < 768 ? 0.8 : 1;
      return {
        ...node,
        data: {
          ...node.data,
          size: node.data.size * sizeAdjustment
        }
      };
    })
  };
  
  console.log("Rendering KnowledgeGraph with adjusted data");
  
  // 确定节点标签显示策略（在小屏幕上可能隐藏标签）
  const shouldShowLabels = windowSize.width >= 640;
  
  return (
    <div className={`w-full h-full ${className}`} style={{ 
      position: "relative", 
      zIndex: 10,
      minHeight: "100%",
      height: "500px"
    }}>
      <KnowledgeGraph 
        data={adjustedData} 
        onNodeClick={(node) => console.log("Node clicked:", node)} 
        defaultMode="3d"
        autoRotate={true}
        hideControls={true}
        disableLabels={!shouldShowLabels}
        style={{ 
          width: "100%", 
          height: "100%", 
          position: "absolute",
          top: 0,
          left: 0
        }}
      />
    </div>
  );
};

export default DemoKnowledgeGraph; 