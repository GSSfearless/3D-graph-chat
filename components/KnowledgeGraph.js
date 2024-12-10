import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading knowledge graph...</p>
});

// 导入 Controls 和 Background 组件
const Controls = dynamic(() => import('react-flow-renderer').then(mod => mod.Controls), {
  ssr: false
});

const Background = dynamic(() => import('react-flow-renderer').then(mod => mod.Background), {
  ssr: false
});

const getNodeStyle = (node, isHovered) => {
  const baseStyle = {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  // 根据节点权重调整大小
  const weight = node.data.weight || 1;
  const size = Math.max(100, 100 * weight);

  // 根据节点类型设置颜色
  let color;
  switch (node.type) {
    case 'concept':
      color = '#e3f2fd';
      break;
    case 'entity':
      color = '#f3e5f5';
      break;
    case 'relation':
      color = '#e8f5e9';
      break;
    default:
      color = '#fff';
  }

  return {
    ...baseStyle,
    width: size,
    height: size * 0.4,
    background: color,
    border: isHovered ? '2px solid #1976d2' : '1px solid #ddd',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };
};

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete, layout = 'radialTree' }) => {
  console.log('KnowledgeGraph rendered with data:', data);

  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState(data.nodes);
  const [edges, setEdges] = useState(data.edges);
  const [hoveredNode, setHoveredNode] = useState(null);

  const MAX_NODES = 50; // 设置一个合理的最大节点数

  useEffect(() => {
    setMounted(true);
    setNodes(data.nodes);
    setEdges(data.edges);
  }, [data]);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      try {
        const limitedNodes = data.nodes.slice(0, MAX_NODES);
        const limitedEdges = data.edges.filter(edge => 
          limitedNodes.some(node => node.id === edge.source) && 
          limitedNodes.some(node => node.id === edge.target)
        );

        let layoutedGraph;
        switch (layout) {
          case 'radialTree':
            layoutedGraph = createRadialTreeLayout(limitedNodes, limitedEdges);
            break;
          case 'mindMap':
            layoutedGraph = createMindMapLayout(limitedNodes, limitedEdges);
            break;
          case 'forceDirected':
            layoutedGraph = createForceDirectedLayout(limitedNodes, limitedEdges);
            break;
          case 'hierarchical':
            layoutedGraph = createHierarchicalLayout(limitedNodes, limitedEdges);
            break;
          default:
            layoutedGraph = { nodes: limitedNodes, edges: limitedEdges };
        }

        setNodes(layoutedGraph.nodes);
        setEdges(layoutedGraph.edges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
      }
    }
  }, [data, layout]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    console.log('Node clicked in KnowledgeGraph:', node);
    onNodeClick(node);
  }, [onNodeClick]);

  const handleNodeDragStart = useCallback((event, node) => {
    // You can add any logic here for when dragging starts
  }, []);

  const handleNodeDrag = useCallback((event, node) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );
  }, [setNodes]);

  const handleNodeDragStop = useCallback((event, node) => {
    console.log('Node dragged in KnowledgeGraph:', node);
    onNodeDragStop(node);
  }, [onNodeDragStop]);

  const handleNodeDelete = useCallback((event, node) => {
    event.stopPropagation(); // Prevent triggering onNodeClick
    console.log('Node deleted in KnowledgeGraph:', node);
    onNodeDelete(node);
  }, [onNodeDelete]);

  const handleNodeMouseEnter = useCallback((event, node) => {
    setHoveredNode(node);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id || edges.some(e => (e.source === node.id && e.target === n.id) || (e.target === node.id && e.source === n.id))) {
          return { ...n, style: { ...n.style, opacity: 1, border: '2px solid #ffa500' } };
        }
        return { ...n, style: { ...n.style, opacity: 0.3 } };
      })
    );
    setEdges((eds) =>
      eds.map((e) => {
        if (e.source === node.id || e.target === node.id) {
          return { ...e, style: { ...e.style, stroke: '#ffa500', strokeWidth: 3 } };
        }
        return { ...e, style: { ...e.style, opacity: 0.3 } };
      })
    );
  }, [edges]);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setNodes((nds) =>
      nds.map((n) => ({ ...n, style: { ...n.style, opacity: 1, border: '1px solid #ddd' } }))
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, style: { ...e.style, stroke: '#888', strokeWidth: 2, opacity: 1 } }))
    );
  }, []);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>Invalid graph data</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%', fontFamily: 'Roboto, sans-serif' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onInit={onInit}
        nodesDraggable={true}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
        panOnScrollMode="free"
        minZoom={0.1}
        maxZoom={4}
        defaultZoom={1}
        onlyRenderVisibleElements={true}
        edgeUpdaterRadius={10}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;