const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const NODE_COLORS = [
  'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
  'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
  'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
  'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
  'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)'
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

// 新增：创建向下组织结构布局
function createDownwardLayout(nodes, edges) {
  const LEVEL_HEIGHT = 150; // 层级之间的垂直间距
  const MIN_NODE_SPACING = 200; // 同一层级节点之间的最小水平间距
  
  // 计算节点层级
  const nodeLevels = new Map();
  const nodeChildren = new Map();
  
  // 初始化节点层级和子节点映射
  nodes.forEach(node => {
    nodeLevels.set(node.id, 0);
    nodeChildren.set(node.id, []);
  });

  // 构建父子关系图
  edges.forEach(edge => {
    const childrenList = nodeChildren.get(edge.source) || [];
    childrenList.push(edge.target);
    nodeChildren.set(edge.source, childrenList);
  });

  // 计算每个节点的层级
  function calculateLevels(nodeId, level) {
    nodeLevels.set(nodeId, Math.max(nodeLevels.get(nodeId), level));
    const children = nodeChildren.get(nodeId) || [];
    children.forEach(childId => calculateLevels(childId, level + 1));
  }

  // 从根节点开始计算层级
  const rootNode = nodes.find(n => n.id === 'root');
  if (rootNode) {
    calculateLevels(rootNode.id, 0);
  }

  // 按层级对节点进行分组
  const levelGroups = new Map();
  nodes.forEach(node => {
    const level = nodeLevels.get(node.id);
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level).push(node);
  });

  // 计算每一层的节点位置
  const layoutedNodes = [];
  levelGroups.forEach((nodesInLevel, level) => {
    const levelWidth = nodesInLevel.length * NODE_WIDTH + (nodesInLevel.length - 1) * MIN_NODE_SPACING;
    const startX = -levelWidth / 2;
    
    nodesInLevel.forEach((node, index) => {
      const x = startX + index * (NODE_WIDTH + MIN_NODE_SPACING);
      const y = level * LEVEL_HEIGHT;
      
      // 为不同层级设置不同的样式
      const nodeStyle = {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: NODE_COLORS[level % NODE_COLORS.length],
        borderRadius: '8px',
        border: '1px solid #ddd',
        padding: '10px',
        fontSize: level === 0 ? '16px' : '14px',
        fontWeight: level === 0 ? '600' : '400',
      };

      layoutedNodes.push({
        ...node,
        position: { x, y },
        style: {
          ...node.style,
          ...nodeStyle,
        },
        data: {
          ...node.data,
          level: level === 0 ? 'root' : level === 1 ? 'mainBranch' : 'subBranch'
        }
      });
    });
  });

  return layoutedNodes;
}

// 修改主布局函数，使用向下布局
export function relayoutGraph(nodes, edges, layoutType = 'downward') {
  let layoutedNodes;
  
  switch (layoutType) {
    case 'pyramid':
      layoutedNodes = createPyramidLayout(nodes);
      break;
    case 'downward':
    default:
      layoutedNodes = createDownwardLayout(nodes, edges);
      break;
  }

  // 优化边的样式
  const layoutedEdges = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const isMainBranch = sourceNode?.data?.level === 'root';
    
    return {
      ...edge,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: isMainBranch ? '#3182ce' : '#4a5568',
        strokeWidth: isMainBranch ? 2 : 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
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
