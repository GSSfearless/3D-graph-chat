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

  const offsetX = 650 - centerX;
  const offsetY = 325 - centerY;

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
  const width = 1200;
  const height = 900;
  const horizontalSpacing = 50;
  const verticalSpacing = 100;

  const layoutedNodes = nodes.map((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const levelWidth = nodesInLevel * NODE_WIDTH + (nodesInLevel - 1) * horizontalSpacing;
    const x = (width - levelWidth) / 2 + (NODE_WIDTH + horizontalSpacing) * nodeIndex;
    const y = verticalSpacing * (level + 1);

    return {
      ...node,
      position: { x, y },
      style: { 
        width: NODE_WIDTH, 
        height: NODE_HEIGHT,
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

export function createImprovedPyramidLayout(nodes, edges) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1200;
  const height = 900;
  const baseHorizontalSpacing = 50;
  const baseVerticalSpacing = 100;

  // 动态调整间距
  const horizontalSpacing = Math.max(baseHorizontalSpacing, width / (nodes.length * 2));
  const verticalSpacing = Math.max(baseVerticalSpacing, height / (levels * 2));

  // 分层
  const layeredNodes = Array.from({ length: levels }, () => []);
  nodes.forEach((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    layeredNodes[level].push(node);
  });

  const layoutedNodes = [];
  let yOffset = 0;

  layeredNodes.forEach((levelNodes, level) => {
    const levelWidth = levelNodes.length * NODE_WIDTH + (levelNodes.length - 1) * horizontalSpacing;
    let xOffset = (width - levelWidth) / 2;

    levelNodes.forEach((node, index) => {
      // 交错布局
      const y = yOffset + (index % 2 === 0 ? 0 : verticalSpacing / 2);
      const x = xOffset + index * (NODE_WIDTH + horizontalSpacing);

      // 自适应节点大小
      const nodeWidth = Math.max(NODE_WIDTH, node.data.label.length * 8);
      const nodeHeight = NODE_HEIGHT;

      layoutedNodes.push({
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
      });
    });

    yOffset += verticalSpacing;
  });

  // 智能边路由
  const layoutedEdges = edges.map(edge => {
    const sourceNode = layoutedNodes.find(n => n.id === edge.source);
    const targetNode = layoutedNodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return edge;

    const sourceX = sourceNode.position.x + sourceNode.style.width / 2;
    const sourceY = sourceNode.position.y + sourceNode.style.height;
    const targetX = targetNode.position.x + targetNode.style.width / 2;
    const targetY = targetNode.position.y;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    return {
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#888', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#888',
      },
      labelStyle: { fill: '#888', fontWeight: 700 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      label: edge.label,
      labelPosition: 0.5,
      labelBgPosition: 'center',
      labelShowBg: true,
      labelStyle: { fontSize: 10 },
      sourcePosition: 'bottom',
      targetPosition: 'top',
      // 使用贝塞尔曲线来避免边与节点重叠
      sourceHandle: null,
      targetHandle: null,
      data: {
        controlPoints: [
          { x: sourceX, y: sourceY },
          { x: midX, y: midY - 50 },
          { x: midX, y: midY + 50 },
          { x: targetX, y: targetY }
        ]
      }
    };
  });

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges
  };
}

export function relayoutGraph(nodes, edges, layoutType) {
  // 暂时忽略 layoutType 参数，始终使用金字塔布局
  const layoutedNodes = createImprovedPyramidLayout(nodes, edges).nodes;
  
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
