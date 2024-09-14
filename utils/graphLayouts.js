export function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1200; // 增加宽度
  const height = 900; // 增加高度
  const baseNodeWidth = 150;
  const baseNodeHeight = 50;
  const horizontalSpacing = 50; // 减小基础水平间距
  const verticalSpacing = 100; // 减小基础垂直间距

  const colors = ['#E6F3FF', '#CCE7FF', '#B3DBFF', '#99CFFF', '#80C3FF']; // 层级颜色

  const layoutedNodes = nodes.map((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const nodeWidth = Math.max(baseNodeWidth, node.data.label.length * 10); // 根据文本长度调整宽度
    const nodeHeight = baseNodeHeight;

    const levelWidth = nodesInLevel * nodeWidth + (nodesInLevel - 1) * horizontalSpacing;
    const x = (width - levelWidth) / 2 + (nodeWidth + horizontalSpacing) * nodeIndex;
    const y = verticalSpacing * (level + 1);

    return {
      ...node,
      position: { x, y },
      style: { 
        width: nodeWidth, 
        height: nodeHeight,
        backgroundColor: colors[level % colors.length],
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
          width: 120, 
          height: 40,
          backgroundColor: isLeft ? '#FFE5E5' : '#E5F2FF',
          borderRadius: '20px',
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
      position: { x: centerX - 75, y: centerY - 25 },
      style: { 
        width: 150, 
        height: 50,
        backgroundColor: '#FFFAE5',
        borderRadius: '25px',
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
  const minAngle = 0.3; // 最小角度间隔

  function layoutNode(node, angle, distance, level) {
    if (!node) return;

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const children = childrenMap.get(node.id) || [];
    const childAngleStep = Math.max((Math.PI * 2) / Math.pow(2, level + 1), minAngle);

    node.position = { x, y };
    node.style = {
      width: Math.max(100 - level * 10, 50),
      height: Math.max(50 - level * 5, 30),
      backgroundColor: `hsl(${(level * 30) % 360}, 70%, 80%)`,
      borderRadius: '50%',
      border: '1px solid #ddd',
      padding: '5px',
      fontSize: `${14 - level}px`
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

  const layoutedNodes = nodes;
  return centerLayout(layoutedNodes);
}

function getNodeColor(level) {
  const colors = ['#FFA07A', '#98FB98', '#87CEFA', '#DDA0DD', '#F0E68C'];
  return colors[level % colors.length];
}

export function relayoutGraph(nodes, edges, layoutType) {
  let layoutedNodes;
  switch (layoutType) {
    case 'pyramid':
      layoutedNodes = createPyramidLayout(nodes);
      break;
    case 'mindmap':
      layoutedNodes = createMindMapLayout(nodes);
      break;
    case 'radialtree':
      layoutedNodes = createRadialTreeLayout(nodes, edges);
      break;
    default:
      layoutedNodes = createRadialTreeLayout(nodes, edges);
  }
  
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
