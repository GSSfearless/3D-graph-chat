import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { createPyramidLayout, createMindMapLayout, createRadialTreeLayout } from '../utils/graphLayouts';
import ReactFlow, { useNodesState, useEdgesState, useReactFlow } from 'react-flow-renderer';

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
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [viewState, setViewState] = useState(null);
  const { fitView } = useReactFlow();

  const MAX_NODES = 50; // 设置一个合理的最大节点数

  useEffect(() => {
    setMounted(true);
    setNodes(data.nodes);
    setEdges(data.edges);
    setTimeout(() => fitView({ padding: 0.2 }), 0);
  }, [data, layout, setNodes, setEdges, fitView]);

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

  const onMoveEnd = useCallback((_, viewState) => {
    setViewState(viewState);
  }, []);

  useEffect(() => {
    if (viewState) {
      const timer = setTimeout(() => {
        const flow = document.querySelector('.react-flow');
        if (flow) {
          const { zoom, x, y } = viewState;
          flow.__reactFlowInstance.setViewport({ zoom, x, y });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [layout, viewState]);

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
      nds.map((n) => ({ ...n, style: { ...n.style, backgroundColor: '#fff', color: '#000', opacity: 1 } }))
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, style: { ...e.style, stroke: '#888', strokeWidth: 2, opacity: 1 } }))
    );
  }, []);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>Invalid graph data</div>;
  }

  const [dimensions, setDimensions] = useState({ width: '100%', height: '600px' });

  useEffect(() => {
    function updateDimensions() {
      const width = window.innerWidth * 0.8; // 80% 的窗口宽度
      const height = window.innerHeight * 0.7; // 70% 的窗口高度
      setDimensions({ width: `${width}px`, height: `${height}px` });
    }

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div style={{ width: dimensions.width, height: dimensions.height }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onInit={onInit}
        onMoveEnd={onMoveEnd}
        defaultViewport={viewState}
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
        fitView
        style={{ width: '100%', height: '100%' }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;