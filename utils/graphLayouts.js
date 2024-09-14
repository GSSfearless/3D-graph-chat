export function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1200; // 增加宽度
  const height = 900; // 增加高度
  const baseNodeWidth = 150;
  const baseNodeHeight = 50;
  const horizontalSpacing = 50; // 减小基础水平间距
  const verticalSpacing = 100; // 减小基础垂直间距

  const colors = ['#E6F3FF', '#CCE7FF', '#B3DBFF', '#99CFFF', '#80C3FF']; // 层级颜色

  const baseNodeStyle = {
    width: 150,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #ddd',
    padding: '5px',
    fontSize: '12px',
  };

  return nodes.map((node, index) => ({
    ...node,
    position: { x, y },
    style: { ...baseNodeStyle, backgroundColor: colors[level % colors.length] },
  }));
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
        style: baseNodeStyle,
      };
    });
  }

  const leftLayout = layoutBranch(leftNodes, -Math.PI / 3, Math.PI / 3, true);
  const rightLayout = layoutBranch(rightNodes, -Math.PI / 3, Math.PI / 3, false);

  return [
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
  const baseRadius = Math.min(centerX, centerY) * 0.8; // 使用较小的值来确保图形在视图内
  const radiusStep = baseRadius / (Math.log(nodes.length) + 1); // 根据节点总数动态调整步长
  const minAngle = 0.3; // 最小角度间隔

  function layoutNode(node, angle, distance, level) {
    const { width, height } = calculateNodeSize(node.data.label);
    const x = centerX + Math.cos(angle) * (distance + width / 2);
    const y = centerY + Math.sin(angle) * (distance + height / 2);

    node.position = { x, y };
    node.style = {
      ...baseNodeStyle,
      width,
      height,
      backgroundColor: getNodeColor(level),
    };

    const childCount = childrenMap.get(node.id) || [];
    const angleSpread = Math.min(Math.PI / 2, 2 * Math.PI / Math.pow(2, level));
    const startAngle = angle - angleSpread / 2;
    const endAngle = angle + angleSpread / 2;

    children.forEach((childId, index) => {
      const childNode = nodes.find(n => n.id === childId);
      if (childNode && childNode !== node) {
        const childAngle = startAngle + (endAngle - startAngle) * (index + 0.5) / childCount;
        const childDistance = distance + radiusStep;
        layoutNode(childNode, childAngle, childDistance, level + 1);
      }
    });
  }

  if (rootNode) {
    layoutNode(rootNode, 0, 0, 0);
  }

  return nodes;
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
