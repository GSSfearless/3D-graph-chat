import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';

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

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onRelatedSearch }) => {
  console.log('KnowledgeGraph rendered with data:', data);

  const [mounted, setMounted] = useState(false);
  const [highlightedElements, setHighlightedElements] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
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
    const relatedEdges = data.edges.filter(edge => edge.source === node.id || edge.target === node.id);
    const relatedNodeIds = new Set(relatedEdges.flatMap(edge => [edge.source, edge.target]));
    const relatedNodes = data.nodes.filter(n => relatedNodeIds.has(n.id));
    setHighlightedElements({ nodes: relatedNodes, edges: relatedEdges });
  }, [data]);

  const handleNodeMouseLeave = useCallback(() => {
    setHighlightedElements({ nodes: [], edges: [] });
  }, []);

  const handleRelatedSearch = useCallback((node) => {
    onRelatedSearch(node);
  }, [onRelatedSearch]);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>无效的图表数据</div>;
  }

  const nodeTypes = {
    custom: ({ data }) => (
      <div className="custom-node">
        <div>{data.label}</div>
        <button onClick={() => handleRelatedSearch(data)} className="related-search-btn">🔍</button>
      </div>
    ),
  };

  return (
    <div style={{ height: '100%', width: '100%', fontFamily: 'Roboto, sans-serif' }}>
      <ReactFlow 
        key={JSON.stringify(data)}
        nodes={data.nodes.map(node => ({
          ...node,
          type: 'custom',
          data: { 
            ...node.data, 
            label: node.data.label,
            isHighlighted: highlightedElements.nodes.some(n => n.id === node.id),
          },
        }))}
        edges={data.edges.map(edge => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: highlightedElements.edges.some(e => e.id === edge.id) ? '#ff0000' : '#888',
            strokeWidth: highlightedElements.edges.some(e => e.id === edge.id) ? 3 : 1,
          },
        }))}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onInit={onInit}
        nodeTypes={nodeTypes}
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