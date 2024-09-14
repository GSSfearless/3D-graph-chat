export function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1000; // 增加宽度
  const height = 800; // 增加高度
  const nodeWidth = 150;
  const nodeHeight = 50;
  const horizontalSpacing = 200; // 增加水平间距
  const verticalSpacing = 150; // 增加垂直间距

  return nodes.map((node, index) => {
    const { width: nodeWidth, height: nodeHeight } = calculateNodeSize(node.data.label);
    
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const x = (width / (nodesInLevel + 1) * (nodeIndex + 1)) - (nodeWidth / 2);
    const y = verticalSpacing * (level + 1) - (nodeHeight / 2);

    // 为每个节点添加一个偏移量,以避免边标签重叠
    const offsetX = (index % 2 === 0 ? 1 : -1) * 20; 
    const offsetY = 20;

    return {
      ...node,
      position: { x: x + offsetX, y: y + offsetY },
      style: { width: nodeWidth, height: nodeHeight }
    };
  });
}

export function createMindMapLayout(nodes) {
  const centerX = 500; // 增加中心点坐标
  const centerY = 400;
  const radius = 350; // 增加半径

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      ...node,
      position: { x, y },
      style: { width: 150, height: 50 }
    };
  });
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

  const centerX = 500;
  const centerY = 500;
  const radius = 250;

  function layoutNode(node, angle, distance, level) {
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const children = childrenMap.get(node.id) || [];
    const childAngleStep = (Math.PI * 2) / Math.max(children.length, 1);

    node.position = { x, y };
    node.data.level = level;

    children.forEach((childId, index) => {
      const childNode = nodes.find(n => n.id === childId);
      const childAngle = angle + childAngleStep * index;
      const childDistance = distance + radius / (level + 1);
      layoutNode(childNode, childAngle, childDistance, level + 1);
    });
  }

  layoutNode(rootNode, 0, 0, 0);

  return nodes.map(node => ({
    ...node,
    style: {
      width: 150,
      height: 50,
      backgroundColor: getNodeColor(node.data.level),
    },
  }));
}

function getNodeColor(level) {
  const colors = ['#FFA07A', '#98FB98', '#87CEFA', '#DDA0DD', '#F0E68C'];
  return colors[level % colors.length];
}

export function relayoutGraph(nodes, edges) {
  const layoutedNodes = createRadialTreeLayout(nodes, edges);
  
  return {
    nodes: layoutedNodes,
    edges: edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#888', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      },
    })),
  };
}

function calculateNodeSize(label) {
  const baseWidth = 100;
  const baseHeight = 40;
  const charWidth = 8; // 估计每个字符的宽度
  
  const width = Math.max(baseWidth, label.length * charWidth);
  return { width, height: baseHeight };
}
