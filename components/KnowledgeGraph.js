import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { createPyramidLayout, createMindMapLayout, createRadialTreeLayout } from '../utils/graphLayouts';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading knowledge graph...</p>
});

const Controls = dynamic(() => import('react-flow-renderer').then(mod => mod.Controls), {
  ssr: false
});

const Background = dynamic(() => import('react-flow-renderer').then(mod => mod.Background), {
  ssr: false
});

const CustomNode = ({ data, id, onDelete }) => {
  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(id);
  };

  return (
    <div style={{ 
      padding: '10px', 
      borderRadius: '8px',
      width: '180px',
      fontSize: '12px',
      textAlign: 'center',
      border: '1px solid #ddd',
      backgroundColor: data.style.background
    }}>
      {data.label}
      <button
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        X
      </button>
    </div>
  );
};

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete }) => {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState(data.nodes);
  const [edges, setEdges] = useState(data.edges);
  const [hoveredNode, setHoveredNode] = useState(null);

  const MAX_NODES = 50;

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

        const { nodes: layoutedNodes, edges: layoutedEdges } = relayoutGraph(limitedNodes, limitedEdges, 'pyramid');
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
        setNodes(data.nodes.slice(0, MAX_NODES));
        setEdges(data.edges);
      }
    }
  }, [data]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    onNodeClick(node);
  }, [onNodeClick]);

  const handleNodeDragStop = useCallback((event, node) => {
    onNodeDragStop(node);
  }, [onNodeDragStop]);

  const handleNodeDelete = useCallback((nodeId) => {
    onNodeDelete(nodeId);
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

  const nodeTypes = {
    custom: (nodeProps) => <CustomNode {...nodeProps} onDelete={handleNodeDelete} />
  };

  return (
    <div style={{ height: '100%', width: '100%', fontFamily: 'Roboto, sans-serif' }}>
      <ReactFlow 
        nodes={nodes.map(node => ({ ...node, type: 'custom' }))}
        edges={edges}
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