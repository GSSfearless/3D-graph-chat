import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { createPyramidLayout, createMindMapLayout, createRadialTreeLayout } from '../utils/graphLayouts';

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

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, layout }) => {
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
      let layoutedNodes;
      try {
        // 限制节点数量
        const limitedNodes = data.nodes.slice(0, MAX_NODES);
        const limitedEdges = data.edges.filter(edge => 
          limitedNodes.some(node => node.id === edge.source) && 
          limitedNodes.some(node => node.id === edge.target)
        );

        switch (layout) {
          case 'pyramid':
            layoutedNodes = createPyramidLayout(limitedNodes);
            break;
          case 'mindMap':
            layoutedNodes = createMindMapLayout(limitedNodes);
            break;
          case 'radialTree':
          default:
            layoutedNodes = createRadialTreeLayout(limitedNodes, limitedEdges);
            break;
        }
        setNodes(layoutedNodes);
        setEdges(limitedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
        // 如果布局计算失败，至少显示原始节点
        setNodes(data.nodes.slice(0, MAX_NODES));
        setEdges(data.edges);
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

  const handleNodeDragStop = useCallback((event, node) => {
    console.log('Node dragged in KnowledgeGraph:', node);
    onNodeDragStop(node);
  }, [onNodeDragStop]);

  const handleNodeMouseEnter = useCallback((event, node) => {
    setHoveredNode(node);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id || edges.some(e => (e.source === node.id && e.target === n.id) || (e.target === node.id && e.source === n.id))) {
          return { ...n, style: { ...n.style, backgroundColor: '#ffa500', color: '#000' } };
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
      nds.map((n) => ({ ...n, style: getNodeStyle(n.level) }))
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, style: { stroke: '#888', strokeWidth: 2, opacity: 1 } }))
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