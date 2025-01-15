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

export function relayoutGraph(nodes, edges, layoutType) {
  let layoutedNodes;
  
  switch (layoutType) {
    case 'rightLogical':
      layoutedNodes = createDownwardTreeLayout(nodes, edges);  // 默认使用向下布局
      break;
    case 'downwardTree':
      layoutedNodes = createDownwardTreeLayout(nodes, edges);
      break;
    case 'radialTree':
      layoutedNodes = createDownwardTreeLayout(nodes, edges);  // 统一使用向下布局
      break;
    case 'mindMap':
      layoutedNodes = createDownwardTreeLayout(nodes, edges);  // 统一使用向下布局
      break;
    case 'pyramid':
    default:
      layoutedNodes = createDownwardTreeLayout(nodes, edges);  // 统一使用向下布局
      break;
  }
  
  return {
    nodes: layoutedNodes,
    edges: edges.map(edge => ({
      ...edge,
      type: 'step',           // 使用直角连接线
      animated: false,
      style: { 
        stroke: '#2D3748',    // 使用深灰色
        strokeWidth: 1,       // 细线
        opacity: 1,           // 不透明
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#2D3748',     // 箭头颜色与线条一致
        width: 12,
        height: 12,
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
