const NODE_WIDTH = 200;
const NODE_HEIGHT = 50;
const NODE_COLORS = [
  'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
  'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)',
  'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)',
  'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)',
  'linear-gradient(135deg, #E1F5FE 0%, #81D4FA 100%)'
];

const NODE_STYLE = {
  background: '#FFFFFF',
  border: '1.5px solid #2D3748',
  borderRadius: '4px',
  padding: '8px',
  fontSize: '14px',
  color: '#2D3748',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};

function centerLayout(nodes) {
  const minX = Math.min(...nodes.map(node => node.position.x));
  const maxX = Math.max(...nodes.map(node => node.position.x));
  const minY = Math.min(...nodes.map(node => node.position.y));
  const maxY = Math.max(...nodes.map(node => node.position.y));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const offsetX = 600 - centerX;
  const offsetY = 450 - centerY;

  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }));
}

export function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1200; // 增加宽度
  const height = 900; // 增加高度
  const nodeWidth = 180;
  const nodeHeight = 60;
  const horizontalSpacing = 50;
  const verticalSpacing = 100;

  const layoutedNodes = nodes.map((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const levelWidth = nodesInLevel * nodeWidth + (nodesInLevel - 1) * horizontalSpacing;
    const x = (width - levelWidth) / 2 + (nodeWidth + horizontalSpacing) * nodeIndex;
    const y = verticalSpacing * (level + 1);

    return {
      ...node,
      position: { x, y },
      style: { 
        width: nodeWidth, 
        height: nodeHeight,
        background: NODE_COLORS[level % NODE_COLORS.length],
        borderRadius: '8px',
        border: '1px solid #ddd',
        padding: '5px',
        fontSize: '12px'
      }
    };
  });

  return centerLayout(layoutedNodes);
}

export function createMindMapLayout(nodes) {
  const centerX = 600;
  const centerY = 450;
  const baseRadius = 250;
  const radiusIncrement = 100;

  const rootNode = nodes[0];
  const leftNodes = nodes.slice(1, Math.ceil(nodes.length / 2));
  const rightNodes = nodes.slice(Math.ceil(nodes.length / 2));

  function layoutBranch(branchNodes, startAngle, endAngle, isLeft) {
    return branchNodes.map((node, index) => {
      const angle = startAngle + (endAngle - startAngle) * (index + 1) / (branchNodes.length + 1);
      const radius = baseRadius + radiusIncrement * Math.floor(index / 5);
      const x = centerX + radius * Math.cos(angle) * (isLeft ? -1 : 1);
      const y = centerY + radius * Math.sin(angle);

      return {
        ...node,
        position: { x, y },
        style: { 
          width: NODE_WIDTH, 
          height: NODE_HEIGHT,
          background: NODE_COLORS[index % NODE_COLORS.length],
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '5px',
          fontSize: '12px'
        }
      };
    });
  }

  const leftLayout = layoutBranch(leftNodes, -Math.PI / 3, Math.PI / 3, true);
  const rightLayout = layoutBranch(rightNodes, -Math.PI / 3, Math.PI / 3, false);

  const layoutedNodes = [
    {
      ...rootNode,
      position: { x: centerX - NODE_WIDTH / 2, y: centerY - NODE_HEIGHT / 2 },
      style: { 
        width: NODE_WIDTH, 
        height: NODE_HEIGHT,
        background: NODE_COLORS[0],
        borderRadius: '8px',
        border: '2px solid #FFD700',
        padding: '5px',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    ...leftLayout,
    ...rightLayout
  ];

  return centerLayout(layoutedNodes);
}

export function createRadialTreeLayout(nodes, edges) {
  const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
  const childrenMap = new Map();

  edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source).push(edge.target);
  });

  const centerX = 600;
  const centerY = 450;
  const baseRadius = 200;
  const radiusStep = 150;
  const minAngle = 0.3;

  function layoutNode(node, angle, distance, level) {
    if (!node) return;

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const children = childrenMap.get(node.id) || [];
    const childAngleStep = Math.max((Math.PI * 2) / Math.pow(2, level + 1), minAngle);

    node.position = { x, y };
    node.style = {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      background: NODE_COLORS[level % NODE_COLORS.length],
      borderRadius: '8px',
      border: '1px solid #ddd',
      padding: '5px',
      fontSize: '12px'
    };

    children.forEach((childId, index) => {
      const childNode = nodes.find(n => n.id === childId);
      if (childNode && childNode !== node) {
        const childAngle = angle - Math.PI / 2 + childAngleStep * (index + 0.5);
        const childDistance = distance + radiusStep;
        layoutNode(childNode, childAngle, childDistance, level + 1);
      }
    });
  }

  if (rootNode) {
    layoutNode(rootNode, 0, 0, 0);
  }

  return centerLayout(nodes);
}

export function createDownwardTreeLayout(nodes, edges) {
  const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
  const childrenMap = new Map();
  
  // 构建父子节点映射
  edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source).push(edge.target);
  });

  const levelMap = new Map();
  const horizontalSpacing = 50;  // 减小水平间距
  const verticalSpacing = 80;    // 减小垂直间距
  
  // 计算每个节点的层级
  function calculateLevels(nodeId, level = 0) {
    if (!levelMap.has(nodeId)) {
      levelMap.set(nodeId, level);
      const children = childrenMap.get(nodeId) || [];
      children.forEach(childId => calculateLevels(childId, level + 1));
    }
  }

  if (rootNode) {
    calculateLevels(rootNode.id);
  }

  // 计算每层节点数量和位置
  const levelNodes = new Map(); // 存储每层的节点
  levelMap.forEach((level, nodeId) => {
    if (!levelNodes.has(level)) {
      levelNodes.set(level, []);
    }
    levelNodes.get(level).push(nodeId);
  });

  // 计算每层节点的位置
  levelNodes.forEach((nodeIds, level) => {
    const levelWidth = nodeIds.length * NODE_WIDTH + (nodeIds.length - 1) * horizontalSpacing;
    const startX = -levelWidth / 2;
    
    nodeIds.forEach((nodeId, index) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        // 计算节点位置
        node.position = {
          x: startX + index * (NODE_WIDTH + horizontalSpacing),
          y: level * verticalSpacing
        };

        // 设置节点样式
        node.style = {
          ...NODE_STYLE,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          // 根节点样式特殊处理
          fontWeight: level === 0 ? 'bold' : 'normal',
          fontSize: level === 0 ? '16px' : '14px',
        };
      }
    });
  });

  return centerLayout(nodes);
}

export function createRightLogicalLayout(nodes, edges) {
  const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
  const childrenMap = new Map();
  
  // 构建父子节点映射
  edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source).push(edge.target);
  });

  const horizontalGap = 280; // 水平间距
  const verticalGap = 100;   // 垂直间距
  const startX = 100;        // 起始X坐标
  
  // 计算子树高度
  function calculateSubtreeHeight(nodeId) {
    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return NODE_HEIGHT;
    
    const childrenHeights = children.map(childId => calculateSubtreeHeight(childId));
    const totalChildrenHeight = childrenHeights.reduce((sum, height) => sum + height, 0);
    const gapsHeight = (children.length - 1) * verticalGap;
    
    return Math.max(NODE_HEIGHT, totalChildrenHeight + gapsHeight);
  }

  // 布局子树
  function layoutSubtree(nodeId, x, y, level = 0) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return 0;

    const children = childrenMap.get(nodeId) || [];
    const subtreeHeight = calculateSubtreeHeight(nodeId);
    
    // 设置当前节点位置
    node.position = { x, y: y + (subtreeHeight - NODE_HEIGHT) / 2 };
    
    // 设置节点样式
    node.style = {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      background: NODE_COLORS[level % NODE_COLORS.length],
      borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.1)',
      padding: '10px',
      fontSize: level === 0 ? '16px' : '14px',
      fontWeight: level === 0 ? 'bold' : '500',
      color: '#2D3748',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      wordWrap: 'break-word',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    };

    // 布局子节点
    let currentY = y;
    children.forEach(childId => {
      const childSubtreeHeight = calculateSubtreeHeight(childId);
      layoutSubtree(childId, x + horizontalGap, currentY, level + 1);
      currentY += childSubtreeHeight + verticalGap;
    });

    return subtreeHeight;
  }

  if (rootNode) {
    layoutSubtree(rootNode.id, startX, 100);
  }

  return centerLayout(nodes);
}

export function createThinkingCycleLayout(nodes, edges) {
  const centerX = 600;
  const centerY = 450;
  const radius = 300;
  
  // 找到中心节点（通常是第一个节点）
  const centerNode = nodes[0];
  const otherNodes = nodes.slice(1);
  
  // 设置中心节点位置
  const layoutedNodes = [{
    ...centerNode,
    position: { x: centerX - 90, y: centerY - 30 },
    style: {
      ...centerNode.style,
      width: 180,
      height: 60,
      background: '#EBF8FF',
      border: '3px solid #4299E1',
      borderRadius: '30px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2C5282',
      zIndex: 1000
    }
  }];

  // 计算其他节点的位置
  const angleStep = (2 * Math.PI) / otherNodes.length;
  otherNodes.forEach((node, index) => {
    const angle = index * angleStep - Math.PI / 2; // 从上方开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    layoutedNodes.push({
      ...node,
      position: { x: x - 75, y: y - 25 },
      style: {
        ...node.style,
        width: 150,
        height: 50,
        background: '#F7FAFC',
        border: '2px solid #A0AEC0',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#2D3748',
        zIndex: 100
      }
    });
  });

  // 修改边的样式为曲线
  const layoutedEdges = edges.map(edge => ({
    ...edge,
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#718096',
      strokeWidth: 2,
      opacity: 0.8
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#718096',
      width: 10,
      height: 10
    }
  }));

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges
  };
}

export function createVerticalMethodLayout(nodes, edges) {
  const centerX = 600;
  const startY = 100;
  const verticalGap = 200;
  const horizontalGap = 400;
  
  // 按层级分组节点
  const levels = {
    method: [],    // 方法层
    promotion: [], // 产品推广层
    skills: []     // 技巧层
  };
  
  nodes.forEach(node => {
    switch(node.data.type) {
      case 'method':
        levels.method.push(node);
        break;
      case 'promotion':
        levels.promotion.push(node);
        break;
      case 'skills':
        levels.skills.push(node);
        break;
      default:
        levels.promotion.push(node); // 默认放在中间层
    }
  });

  const layoutedNodes = [];
  
  // 布局方法层
  levels.method.forEach((node, index) => {
    layoutedNodes.push({
      ...node,
      position: {
        x: centerX - (levels.method.length - 1) * horizontalGap / 2 + index * horizontalGap,
        y: startY
      },
      style: {
        width: 180,
        height: 60,
        background: '#F0F9FF',
        border: '2px solid #93C5FD',
        borderRadius: '30px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1E40AF',
        padding: '10px',
        textAlign: 'center'
      }
    });
  });

  // 布局产品推广层
  levels.promotion.forEach((node, index) => {
    layoutedNodes.push({
      ...node,
      position: {
        x: centerX - (levels.promotion.length - 1) * horizontalGap / 2 + index * horizontalGap,
        y: startY + verticalGap
      },
      style: {
        width: 200,
        height: 70,
        background: '#FFF',
        border: '2.5px solid #3B82F6',
        borderRadius: '35px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1E3A8A',
        padding: '15px',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    });
  });

  // 布局技巧层
  levels.skills.forEach((node, index) => {
    layoutedNodes.push({
      ...node,
      position: {
        x: centerX - (levels.skills.length - 1) * horizontalGap / 2 + index * horizontalGap,
        y: startY + verticalGap * 2
      },
      style: {
        width: 180,
        height: 60,
        background: '#F0FDF4',
        border: '2px solid #86EFAC',
        borderRadius: '30px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#166534',
        padding: '10px',
        textAlign: 'center'
      }
    });
  });

  // 修改边的样式为虚线
  const layoutedEdges = edges.map(edge => ({
    ...edge,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: '#94A3B8',
      strokeWidth: 1.5,
      strokeDasharray: '5,5', // 添加虚线样式
      opacity: 0.6
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#94A3B8',
      width: 8,
      height: 8
    }
  }));

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges
  };
}

export function createThinkingProcessLayout(nodes, edges) {
  const centerX = 600;
  const centerY = 450;
  const radius = 250;
  
  // 按思考阶段分组节点
  const stages = {
    collect: [],
    research: [],
    discuss: [],
    reflect: []
  };
  
  nodes.forEach(node => {
    if (stages[node.data.stage]) {
      stages[node.data.stage].push(node);
    } else {
      stages.collect.push(node); // 默认放入收集阶段
    }
  });

  const layoutedNodes = [];
  const stageAngles = {
    collect: -Math.PI / 2,        // 上方
    research: 0,                  // 右方
    discuss: Math.PI / 2,         // 下方
    reflect: Math.PI             // 左方
  };

  // 布局每个阶段的节点
  Object.entries(stages).forEach(([stage, stageNodes]) => {
    const baseAngle = stageAngles[stage];
    const angleSpread = Math.PI / 6; // 30度的扩散角度
    
    stageNodes.forEach((node, index) => {
      const angle = baseAngle - angleSpread / 2 + (angleSpread * index / Math.max(stageNodes.length - 1, 1));
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      layoutedNodes.push({
        ...node,
        position: { x: x - 90, y: y - 30 },
        style: {
          ...node.style,
          zIndex: 100
        }
      });
    });
  });

  // 修改边的样式为曲线，并添加循环指示
  const layoutedEdges = edges.map(edge => ({
    ...edge,
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#94A3B8',
      strokeWidth: 1.5,
      strokeDasharray: '5,5',
      opacity: 0.6
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#94A3B8',
      width: 8,
      height: 8
    }
  }));

  // 添加阶段指示边
  const stageIndicatorEdges = [
    {
      id: 'stage-flow-1',
      source: 'collect',
      target: 'research',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4B5563', strokeWidth: 2, opacity: 0.4 }
    },
    {
      id: 'stage-flow-2',
      source: 'research',
      target: 'discuss',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4B5563', strokeWidth: 2, opacity: 0.4 }
    },
    {
      id: 'stage-flow-3',
      source: 'discuss',
      target: 'reflect',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4B5563', strokeWidth: 2, opacity: 0.4 }
    },
    {
      id: 'stage-flow-4',
      source: 'reflect',
      target: 'collect',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4B5563', strokeWidth: 2, opacity: 0.4 }
    }
  ];

  return {
    nodes: layoutedNodes,
    edges: [...layoutedEdges, ...stageIndicatorEdges]
  };
}

export function relayoutGraph(nodes, edges, layoutType) {
  let layoutedGraph;
  
  switch (layoutType) {
    case 'thinkingProcess':
      layoutedGraph = createThinkingProcessLayout(nodes, edges);
      break;
    case 'verticalMethod':
      layoutedGraph = createVerticalMethodLayout(nodes, edges);
      break;
    case 'thinkingCycle':
      layoutedGraph = createThinkingCycleLayout(nodes, edges);
      break;
    case 'rightLogical':
      layoutedGraph = { nodes: createDownwardTreeLayout(nodes, edges), edges };
      break;
    case 'downwardTree':
      layoutedGraph = { nodes: createDownwardTreeLayout(nodes, edges), edges };
      break;
    case 'radialTree':
      layoutedGraph = { nodes: createDownwardTreeLayout(nodes, edges), edges };
      break;
    case 'mindMap':
      layoutedGraph = { nodes: createDownwardTreeLayout(nodes, edges), edges };
      break;
    case 'pyramid':
    default:
      layoutedGraph = { nodes: createDownwardTreeLayout(nodes, edges), edges };
      break;
  }
  
  return layoutedGraph;
}

function isOverlapping(node1, node2) {
  const margin = 20; // 节点间的最小间距
  return Math.abs(node1.position.x - node2.position.x) < (node1.style?.width || NODE_WIDTH) + margin &&
         Math.abs(node1.position.y - node2.position.y) < (node1.style?.height || NODE_HEIGHT) + margin;
}

export function createExpandLayout(nodes, parentNode, existingNodes) {
  const radius = 200;
  const angleStep = (2 * Math.PI) / nodes.length;

  return nodes.map((node, index) => {
    let angle = index * angleStep;
    let x, y;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      x = parentNode.position.x + radius * Math.cos(angle);
      y = parentNode.position.y + radius * Math.sin(angle);
      attempts++;
      angle += 0.1;

      const newNode = {
        ...node,
        position: { x, y },
        style: { 
          width: NODE_WIDTH, 
          height: NODE_HEIGHT,
          background: NODE_COLORS[index % NODE_COLORS.length],
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '5px',
          fontSize: '12px'
        }
      };

      if (!existingNodes.some(existingNode => isOverlapping(newNode, existingNode))) {
        return newNode;
      }
    } while (attempts < maxAttempts);

    // 如果无法找到不重叠的位置，返回最后一次尝试的位置
    return {
      ...node,
      position: { x, y },
      style: { 
        width: NODE_WIDTH, 
        height: NODE_HEIGHT,
        background: NODE_COLORS[index % NODE_COLORS.length],
        borderRadius: '8px',
        border: '1px solid #ddd',
        padding: '5px',
        fontSize: '12px'
      }
    };
  });
}
