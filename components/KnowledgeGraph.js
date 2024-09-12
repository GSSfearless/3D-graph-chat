import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import NodeDetailsPanel from './NodeDetailsPanel';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>加载知识图谱中...</p>
});

// 导入 Controls 和 Background 组件
const Controls = dynamic(() => import('react-flow-renderer').then(mod => mod.Controls), {
  ssr: false
});

const Background = dynamic(() => import('react-flow-renderer').then(mod => mod.Background), {
  ssr: false
});

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop }) => {
  console.log('KnowledgeGraph rendered with data:', data);

  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState(data.nodes);
  const [edges, setEdges] = useState(data.edges);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDetails, setNodeDetails] = useState({});
  const nodeDetailsRef = useRef({});

  useEffect(() => {
    setMounted(true);
    setNodes(data.nodes);
    setEdges(data.edges);
    // Preload all node details
    preloadNodeDetails(data.nodes);
  }, [data]);

  const preloadNodeDetails = async (nodes) => {
    const details = {};
    for (const node of nodes) {
      if (!nodeDetailsRef.current[node.id]) {
        try {
          const response = await fetch('/api/nodeDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodeId: node.id, label: node.data.label }),
          });
          if (response.ok) {
            const detailData = await response.json();
            details[node.id] = detailData;
          }
        } catch (error) {
          console.error('Error preloading node details:', error);
        }
      }
    }
    setNodeDetails(prevDetails => ({ ...prevDetails, ...details }));
    nodeDetailsRef.current = { ...nodeDetailsRef.current, ...details };
  };

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    const cachedDetails = nodeDetailsRef.current[node.id];
    if (cachedDetails) {
      setSelectedNode({ ...node, data: { ...node.data, ...cachedDetails } });
    } else {
      setSelectedNode(node);
      // If somehow the details are not cached, fetch them
      fetchNodeDetails(node);
    }
    onNodeClick(node);
  }, [onNodeClick]);

  const fetchNodeDetails = async (node) => {
    try {
      const response = await fetch('/api/nodeDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: node.id, label: node.data.label }),
      });
      if (response.ok) {
        const detailData = await response.json();
        setNodeDetails(prevDetails => ({ ...prevDetails, [node.id]: detailData }));
        nodeDetailsRef.current[node.id] = detailData;
        setSelectedNode({ ...node, data: { ...node.data, ...detailData } });
      }
    } catch (error) {
      console.error('Error fetching node details:', error);
    }
  };

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
    return <div>无效的图表数据</div>;
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
      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
    </div>
  );
};

export default KnowledgeGraph;