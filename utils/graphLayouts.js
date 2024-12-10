const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const NODE_COLORS = [
  '#E3F2FD', // 浅蓝
  '#F3E5F5', // 浅紫
  '#E8F5E9', // 浅绿
  '#FFF3E0', // 浅橙
];

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
  const centerX = 600;
  const centerY = 450;
  const rootNode = nodes[0];
  const childrenMap = new Map();
  
  // 构建父子关系图
  edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source).push(edge.target);
  });
  
  // 计算每个层级的节点数量
  const levelCounts = new Map();
  const nodeLevels = new Map();
  
  function calculateLevels(nodeId, level = 0) {
    nodeLevels.set(nodeId, level);
    levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    
    const children = childrenMap.get(nodeId) || [];
    children.forEach(childId => calculateLevels(childId, level + 1));
  }
  
  calculateLevels(rootNode.id);
  
  // 计算每个节点的位置
  const maxLevel = Math.max(...levelCounts.keys());
  const radiusStep = 150; // 每层的半径增量
  
  function calculateNodePosition(nodeId, angle, level) {
    const radius = level * radiusStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y };
  }
  
  // 为每个节点分配位置
  const nodePositions = new Map();
  levelCounts.forEach((count, level) => {
    const nodesAtLevel = nodes.filter(node => nodeLevels.get(node.id) === level);
    nodesAtLevel.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / count;
      nodePositions.set(node.id, calculateNodePosition(node.id, angle, level));
    });
  });
  
  return {
    nodes: nodes.map(node => ({
      ...node,
      position: nodePositions.get(node.id),
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: NODE_COLORS[nodeLevels.get(node.id) % NODE_COLORS.length],
        border: node.id === rootNode.id ? '2px solid #1976d2' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }
    })),
    edges: edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: '#888',
        strokeWidth: 1.5,
        opacity: 0.8
      }
    }))
  };
}

export function relayoutGraph(nodes, edges, layoutType) {
  switch (layoutType) {
    case 'hierarchical':
      return createHierarchicalLayout(nodes, edges);
    case 'radialTree':
      return createRadialTreeLayout(nodes, edges);
    default:
      return createHierarchicalLayout(nodes, edges);
  }
}

// 力导向布局
export const createForceDirectedLayout = (nodes, edges) => {
  const centerX = 500;
  const centerY = 300;
  const radius = 250;

  return {
    nodes: nodes.map((node, index) => ({
      ...node,
      position: {
        x: centerX + radius * Math.cos(2 * Math.PI * index / nodes.length),
        y: centerY + radius * Math.sin(2 * Math.PI * index / nodes.length)
      },
      style: {
        ...node.style,
        width: node.data.weight ? 100 + node.data.weight * 20 : 100,
        height: node.data.weight ? 40 + node.data.weight * 10 : 40,
      }
    })),
    edges
  };
};

// 层次布局
export const createHierarchicalLayout = (nodes, edges) => {
  const LEVEL_HEIGHT = 120; // 增加垂直间距
  const HORIZONTAL_SPACING = 200; // 水平间距
  
  // 计算节点层级
  const nodeLevels = new Map();
  const levelNodes = new Map();
  const rootNode = nodes[0];
  nodeLevels.set(rootNode.id, 0);
  
  // BFS 遍历计算层级
  const queue = [rootNode];
  while (queue.length > 0) {
    const currentNode = queue.shift();
    const currentLevel = nodeLevels.get(currentNode.id);
    
    // 将节点添加到对应层级
    if (!levelNodes.has(currentLevel)) {
      levelNodes.set(currentLevel, []);
    }
    levelNodes.get(currentLevel).push(currentNode.id);
    
    // 处理子节点
    const childEdges = edges.filter(edge => edge.source === currentNode.id);
    childEdges.forEach(edge => {
      const childNode = nodes.find(n => n.id === edge.target);
      if (!nodeLevels.has(childNode.id)) {
        nodeLevels.set(childNode.id, currentLevel + 1);
        queue.push(childNode);
      }
    });
  }
  
  // 计算每层的中心位置
  const maxNodesInLevel = Math.max(...Array.from(levelNodes.values()).map(level => level.length));
  const totalWidth = (maxNodesInLevel - 1) * HORIZONTAL_SPACING;
  
  return {
    nodes: nodes.map(node => {
      const level = nodeLevels.get(node.id);
      const nodesInLevel = levelNodes.get(level);
      const position = nodesInLevel.indexOf(node.id);
      const totalNodesInLevel = nodesInLevel.length;
      
      // 计算水平位置，使每层节点居中
      const levelWidth = (totalNodesInLevel - 1) * HORIZONTAL_SPACING;
      const startX = (totalWidth - levelWidth) / 2;
      
      return {
        ...node,
        position: {
          x: startX + position * HORIZONTAL_SPACING,
          y: level * LEVEL_HEIGHT
        },
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          background: NODE_COLORS[level % NODE_COLORS.length],
          border: node === rootNode ? '2px solid #1976d2' : '1px solid #ddd',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }
      };
    }),
    edges: edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#888',
        strokeWidth: 1.5,
        opacity: 0.8
      }
    }))
  };
};
