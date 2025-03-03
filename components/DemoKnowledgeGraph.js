import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 预设的知识图谱演示数据 - 精简节点和边，提高可视性
const defaultData = {
  nodes: [
    { data: { id: 'knowledge-graph', label: '知识图谱', type: 'concept', size: 18, color: '#4F46E5' } },
    { data: { id: 'visualization', label: '可视化', type: 'concept', size: 14, color: '#6366F1' } },
    { data: { id: '3d-rendering', label: '3D渲染', type: 'technology', size: 13, color: '#8B5CF6' } },
    { data: { id: 'interactive', label: '交互性', type: 'feature', size: 12, color: '#EC4899' } },
    { data: { id: 'ai', label: '人工智能', type: 'technology', size: 16, color: '#8B5CF6' } },
    { data: { id: 'nlp', label: '自然语言处理', type: 'technology', size: 14, color: '#8B5CF6' } },
    { data: { id: 'entity', label: '实体识别', type: 'feature', size: 12, color: '#EC4899' } },
    { data: { id: 'relation', label: '关系抽取', type: 'feature', size: 12, color: '#EC4899' } },
  ],
  edges: [
    { data: { id: 'e1', source: 'knowledge-graph', target: 'visualization', label: '包含', weight: 5 } },
    { data: { id: 'e2', source: 'knowledge-graph', target: '3d-rendering', label: '使用', weight: 4 } },
    { data: { id: 'e3', source: 'visualization', target: 'interactive', label: '提供', weight: 3 } },
    { data: { id: 'e4', source: 'knowledge-graph', target: 'ai', label: '结合', weight: 5 } },
    { data: { id: 'e5', source: 'ai', target: 'nlp', label: '应用', weight: 4 } },
    { data: { id: 'e6', source: 'nlp', target: 'entity', label: '识别', weight: 3 } },
    { data: { id: 'e7', source: 'nlp', target: 'relation', label: '提取', weight: 3 } },
    { data: { id: 'e8', source: 'entity', target: 'relation', label: '形成', weight: 2 } },
  ]
};

// 动态导入KnowledgeGraph组件
const KnowledgeGraph = dynamic(() => import('./KnowledgeGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

const DemoKnowledgeGraph = ({ className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const [adjustedData, setAdjustedData] = useState(defaultData);
  const [windowWidth, setWindowWidth] = useState(1200);
  
  useEffect(() => {
    setMounted(true);
    
    // 初始设置窗口宽度
    setWindowWidth(window.innerWidth);
    
    // 设置窗口大小变化监听
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    console.log("DemoKnowledgeGraph mounted");
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      console.log("DemoKnowledgeGraph unmounted");
    };
  }, []);
  
  // 根据窗口大小调整节点大小
  useEffect(() => {
    if (!mounted) return;
    
    // 窗口宽度小于768px时缩小节点尺寸
    if (windowWidth < 768) {
      const scaleFactor = 0.7;
      const newData = {
        nodes: defaultData.nodes.map(node => ({
          data: {
            ...node.data,
            size: Math.max(8, Math.floor(node.data.size * scaleFactor))
          }
        })),
        edges: defaultData.edges
      };
      setAdjustedData(newData);
    } else {
      setAdjustedData(defaultData);
    }
  }, [windowWidth, mounted]);
  
  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className={`w-full h-full ${className}`}>
      <KnowledgeGraph
        data={adjustedData}
        autoRotate={true}
        hideControls={windowWidth < 640}
        disableLabels={windowWidth < 480}
        onNodeClick={(node) => console.log('Node clicked:', node)}
      />
    </div>
  );
};

export default DemoKnowledgeGraph; 