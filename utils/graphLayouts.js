const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const NODE_COLORS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
  'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
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
  const horizontalSpacing = 250; // 增加水平间距
  const verticalSpacing = 150; // 增加垂直间距
  
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

  // 计算每层节点数量
  const levelCounts = new Map();
  levelMap.forEach((level, nodeId) => {
    levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
  });

  // 计算每层节点的位置
  const levelPositions = new Map();
  levelMap.forEach((level, nodeId) => {
    if (!levelPositions.has(level)) {
      levelPositions.set(level, 0);
    }
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const nodesInLevel = levelCounts.get(level);
      const levelWidth = nodesInLevel * NODE_WIDTH + (nodesInLevel - 1) * horizontalSpacing;
      const startX = 600 - levelWidth / 2;
      
      node.position = {
        x: startX + levelPositions.get(level) * (NODE_WIDTH + horizontalSpacing),
        y: 100 + level * verticalSpacing
      };

      // 优化节点样式
      node.style = {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: NODE_COLORS[level % NODE_COLORS.length],
        borderRadius: '12px',
        border: level === 0 ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.3)',
        padding: '10px',
        fontSize: level === 0 ? '16px' : '14px',
        fontWeight: level === 0 ? 'bold' : '500',
        color: '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        wordWrap: 'break-word',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      };
      
      levelPositions.set(level, levelPositions.get(level) + 1);
    }
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
      border: level === 0 ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.3)',
      padding: '10px',
      fontSize: level === 0 ? '16px' : '14px',
      fontWeight: level === 0 ? 'bold' : '500',
      color: '#FFFFFF',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      wordWrap: 'break-word',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
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

export function relayoutGraph(nodes, edges, layoutType) {
  let layoutedNodes;
  
  switch (layoutType) {
    case 'rightLogical':
      layoutedNodes = createRightLogicalLayout(nodes, edges);
      break;
    case 'downwardTree':
      layoutedNodes = createDownwardTreeLayout(nodes, edges);
      break;
    case 'radialTree':
      layoutedNodes = createRadialTreeLayout(nodes, edges);
      break;
    case 'mindMap':
      layoutedNodes = createMindMapLayout(nodes);
      break;
    case 'pyramid':
    default:
      layoutedNodes = createPyramidLayout(nodes);
      break;
  }
  
  return {
    nodes: layoutedNodes,
    edges: edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: 'url(#edge-gradient)',
        strokeWidth: 2.5,
        opacity: 0.8,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#6366F1',
        width: 20,
        height: 20,
      },
    })),
  };
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
