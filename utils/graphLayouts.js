export function createPyramidLayout(nodes) {
  const levels = Math.ceil(Math.sqrt(nodes.length));
  const width = 1000; // 增加宽度
  const height = 800; // 增加高度
  const nodeWidth = 150;
  const nodeHeight = 50;
  const horizontalSpacing = 200; // 增加水平间距
  const verticalSpacing = 150; // 增加垂直间距

  return nodes.map((node, index) => {
    const level = Math.floor(Math.sqrt(index));
    const nodesInLevel = (level * 2) + 1;
    const nodeIndex = index - (level * level);
    
    const x = (width / (nodesInLevel + 1) * (nodeIndex + 1)) - (nodeWidth / 2);
    const y = verticalSpacing * (level + 1) - (nodeHeight / 2);

    return {
      ...node,
      position: { x, y },
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

export function relayoutGraph(nodes, edges, type) {
  const layoutFunction = type === 'pyramid' ? createPyramidLayout : createMindMapLayout;
  const layoutedNodes = layoutFunction(nodes);
  
  return {
    nodes: layoutedNodes,
    edges: edges,
    type: type
  };
}
