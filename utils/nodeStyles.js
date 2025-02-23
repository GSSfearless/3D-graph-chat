// 节点类型枚举
export const NodeTypes = {
  CORE: 'core',           // 核心概念
  IMPORTANT: 'important', // 重要概念
  NORMAL: 'normal',       // 普通概念
  RELATED: 'related'      // 相关概念
};

// 节点颜色方案
export const ColorSchemes = {
  [NodeTypes.CORE]: {
    background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
    border: '#2961A5',
    text: '#FFFFFF'
  },
  [NodeTypes.IMPORTANT]: {
    background: 'linear-gradient(135deg, #50E3C2 0%, #3CC8A8 100%)',
    border: '#2DAA8C',
    text: '#FFFFFF'
  },
  [NodeTypes.NORMAL]: {
    background: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
    border: '#A4B5CC',
    text: '#2C3E50'
  },
  [NodeTypes.RELATED]: {
    background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    border: '#BA68C8',
    text: '#4A148C'
  }
};

// 节点大小配置
export const NodeSizes = {
  [NodeTypes.CORE]: {
    width: 200,
    height: 70,
    fontSize: 14
  },
  [NodeTypes.IMPORTANT]: {
    width: 180,
    height: 60,
    fontSize: 13
  },
  [NodeTypes.NORMAL]: {
    width: 160,
    height: 50,
    fontSize: 12
  },
  [NodeTypes.RELATED]: {
    width: 140,
    height: 45,
    fontSize: 11
  }
};

// 计算节点重要性
export function calculateNodeImportance(node, edges) {
  // 计算入度和出度
  const inDegree = edges.filter(edge => edge.target === node.id).length;
  const outDegree = edges.filter(edge => edge.source === node.id).length;
  
  // 根据连接数确定节点类型
  if (inDegree + outDegree >= 8) {
    return NodeTypes.CORE;
  } else if (inDegree + outDegree >= 5) {
    return NodeTypes.IMPORTANT;
  } else if (inDegree + outDegree >= 2) {
    return NodeTypes.NORMAL;
  } else {
    return NodeTypes.RELATED;
  }
}

// 生成节点样式
export function generateNodeStyle(node, edges) {
  const importance = calculateNodeImportance(node, edges);
  const colorScheme = ColorSchemes[importance];
  const size = NodeSizes[importance];

  return {
    width: size.width,
    height: size.height,
    background: colorScheme.background,
    border: `2px solid ${colorScheme.border}`,
    borderRadius: '8px',
    padding: '8px',
    fontSize: `${size.fontSize}px`,
    color: colorScheme.text,
    boxShadow: importance === NodeTypes.CORE ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
    transition: 'all 0.3s ease'
  };
} 