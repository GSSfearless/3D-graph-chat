import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// 优化预设的知识图谱演示数据 - 更加复杂的节点和边，增强视觉冲击力
const defaultData = {
  nodes: [
    // 核心概念节点 - 较大尺寸
    { data: { id: 'knowledge-graph', label: '知识图谱', type: 'concept', size: 24, color: '#4F46E5' } },
    { data: { id: 'visualization', label: '可视化', type: 'concept', size: 18, color: '#6366F1' } },
    { data: { id: '3d-rendering', label: '3D渲染', type: 'technology', size: 18, color: '#8B5CF6' } },
    { data: { id: 'ai', label: '人工智能', type: 'technology', size: 22, color: '#8B5CF6' } },
    { data: { id: 'big-data', label: '大数据', type: 'technology', size: 20, color: '#0EA5E9' } },
    { data: { id: 'thinking', label: '立体思考', type: 'concept', size: 19, color: '#6366F1' } },
    
    // 技术节点 - 中等尺寸
    { data: { id: 'nlp', label: '自然语言处理', type: 'technology', size: 17, color: '#8B5CF6' } },
    { data: { id: 'deep-learning', label: '深度学习', type: 'technology', size: 17, color: '#8B5CF6' } },
    { data: { id: 'machine-learning', label: '机器学习', type: 'technology', size: 16, color: '#8B5CF6' } },
    { data: { id: 'semantic-web', label: '语义网络', type: 'technology', size: 16, color: '#0EA5E9' } },
    { data: { id: 'data-mining', label: '数据挖掘', type: 'technology', size: 16, color: '#0EA5E9' } },
    { data: { id: 'graph-db', label: '图数据库', type: 'technology', size: 16, color: '#0EA5E9' } },
    
    // 特性和功能节点 - 较小尺寸
    { data: { id: 'interactive', label: '交互性', type: 'feature', size: 14, color: '#EC4899' } },
    { data: { id: 'spatial', label: '空间思维', type: 'concept', size: 15, color: '#6366F1' } },
    { data: { id: 'entity-recognition', label: '实体识别', type: 'feature', size: 14, color: '#EC4899' } },
    { data: { id: 'relation-extraction', label: '关系抽取', type: 'feature', size: 14, color: '#EC4899' } },
    { data: { id: 'pattern-discovery', label: '模式发现', type: 'feature', size: 14, color: '#EC4899' } },
    { data: { id: 'knowledge-reasoning', label: '知识推理', type: 'feature', size: 15, color: '#EC4899' } },
    { data: { id: 'multi-dimension', label: '多维分析', type: 'feature', size: 14, color: '#EC4899' } },
    { data: { id: 'realtime-update', label: '实时更新', type: 'feature', size: 13, color: '#EC4899' } }
  ],
  edges: [
    // 知识图谱的直接关联
    { data: { id: 'e1', source: 'knowledge-graph', target: 'visualization', label: '应用', weight: 5 } },
    { data: { id: 'e2', source: 'knowledge-graph', target: '3d-rendering', label: '使用', weight: 4 } },
    { data: { id: 'e3', source: 'knowledge-graph', target: 'interactive', label: '提供', weight: 3 } },
    { data: { id: 'e4', source: 'knowledge-graph', target: 'ai', label: '结合', weight: 5 } },
    { data: { id: 'e5', source: 'knowledge-graph', target: 'big-data', label: '基于', weight: 5 } },
    { data: { id: 'e6', source: 'knowledge-graph', target: 'spatial', label: '促进', weight: 4 } },
    { data: { id: 'e7', source: 'knowledge-graph', target: 'graph-db', label: '存储于', weight: 4 } },
    { data: { id: 'e8', source: 'knowledge-graph', target: 'semantic-web', label: '源于', weight: 3 } },
    
    // AI相关联系
    { data: { id: 'e9', source: 'ai', target: 'nlp', label: '包含', weight: 4 } },
    { data: { id: 'e10', source: 'ai', target: 'deep-learning', label: '使用', weight: 5 } },
    { data: { id: 'e11', source: 'ai', target: 'machine-learning', label: '基于', weight: 5 } },
    { data: { id: 'e12', source: 'nlp', target: 'entity-recognition', label: '实现', weight: 4 } },
    { data: { id: 'e13', source: 'nlp', target: 'relation-extraction', label: '支持', weight: 4 } },
    
    // 大数据相关联系
    { data: { id: 'e14', source: 'big-data', target: 'data-mining', label: '通过', weight: 4 } },
    { data: { id: 'e15', source: 'big-data', target: 'pattern-discovery', label: '发现', weight: 3 } },
    { data: { id: 'e16', source: 'data-mining', target: 'knowledge-reasoning', label: '辅助', weight: 3 } },
    
    // 技术间关系
    { data: { id: 'e17', source: 'deep-learning', target: 'machine-learning', label: '属于', weight: 4 } },
    { data: { id: 'e18', source: 'machine-learning', target: 'pattern-discovery', label: '用于', weight: 3 } },
    { data: { id: 'e19', source: 'semantic-web', target: 'graph-db', label: '利用', weight: 3 } },
    
    // 视觉和功能相关
    { data: { id: 'e20', source: 'visualization', target: 'multi-dimension', label: '提供', weight: 3 } },
    { data: { id: 'e21', source: 'visualization', target: 'thinking', label: '辅助', weight: 4 } },
    { data: { id: 'e22', source: '3d-rendering', target: 'interactive', label: '增强', weight: 4 } },
    { data: { id: 'e23', source: '3d-rendering', target: 'spatial', label: '表现', weight: 4 } },
    { data: { id: 'e24', source: 'spatial', target: 'thinking', label: '启发', weight: 5 } },
    { data: { id: 'e25', source: 'interactive', target: 'realtime-update', label: '需要', weight: 3 } }
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
    
    // 根据屏幕尺寸调整节点大小和复杂度
    if (width < 768) {
      // 小屏幕调整 - 减少节点数量并缩小尺寸
      if (width < 480) {
        // 超小屏幕 - 显示核心节点和关系
        const coreNodeIds = ['knowledge-graph', 'visualization', '3d-rendering', 'ai', 'thinking', 'nlp', 'interactive'];
        newData.nodes = newData.nodes.filter(node => coreNodeIds.includes(node.data.id));
        newData.edges = newData.edges.filter(edge => 
          coreNodeIds.includes(edge.data.source) && coreNodeIds.includes(edge.data.target)
        );
      }
      
      // 缩小节点尺寸
      newData.nodes = newData.nodes.map(node => {
        node.data = {
          ...node.data,
          size: Math.max(10, node.data.size * 0.7) // 确保最小尺寸不低于10
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
        zIndex: 1,
        overflow: 'visible'
      }}
    >
      <KnowledgeGraph
        data={adaptedData}
        autoRotate={true}
        hideControls={true} 
        disableLabels={shouldHideLabels}
        disableZoom={true}
        onNodeClick={(nodeData) => console.log('节点点击:', nodeData)}
        style={{ 
          width: "100%", 
          height: "100%", 
          position: "absolute",
          top: 0,
          left: 0,
          overflow: 'visible'
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