import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import dagre from 'dagre';

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

// 定义不同层级节点的样式
const nodeStyles = {
  root: {
    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
    border: '2px solid #FF6B6B',
    borderRadius: '30px',
    padding: '20px',
    fontSize: '16px',
    color: 'white',
    fontWeight: 'bold',
    minWidth: '200px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  mainBranch: {
    background: 'linear-gradient(45deg, #4ECDC4, #45B7AF)',
    border: '2px solid #4ECDC4',
    borderRadius: '25px',
    padding: '15px',
    fontSize: '14px',
    color: 'white',
    fontWeight: '600',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
  },
  subBranch: {
    background: 'linear-gradient(45deg, #96CDEF, #7FB2D2)',
    border: '2px solid #96CDEF',
    borderRadius: '20px',
    padding: '12px',
    fontSize: '13px',
    color: 'white',
    fontWeight: '500',
    minWidth: '160px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }
};

// 定义边的样式
const edgeStyles = {
  mainBranch: {
    stroke: '#FF6B6B',
    strokeWidth: 3,
  },
  subBranch: {
    stroke: '#4ECDC4',
    strokeWidth: 2,
  }
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // 设置图的布局方向和节点间距
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 100,
    marginx: 50,
    marginy: 50,
  });

  // 添加节点
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.data.level === 'root' ? 200 : node.data.level === 'mainBranch' ? 180 : 160,
      height: node.data.level === 'root' ? 80 : node.data.level === 'mainBranch' ? 60 : 50,
    });
  });

  // 添加边
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 计算布局
  dagre.layout(dagreGraph);

  // 获取布局后的节点位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      style: {
        ...nodeStyles[node.data.level || 'subBranch'],
        width: nodeWithPosition.width,
      },
    };
  });

  // 设置边的样式
  const layoutedEdges = edges.map((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    return {
      ...edge,
      style: edgeStyles[sourceNode?.data.level === 'root' ? 'mainBranch' : 'subBranch'],
      type: 'smoothstep',
      animated: true,
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete }) => {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      try {
        // 为节点添加层级信息
        const nodesWithLevels = data.nodes.map(node => {
          let level = 'subBranch';
          if (node.id === 'root') {
            level = 'root';
          } else if (data.edges.some(edge => edge.source === 'root' && edge.target === node.id)) {
            level = 'mainBranch';
          }
          return {
            ...node,
            data: {
              ...node.data,
              level,
            },
          };
        });

        // 应用布局
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          nodesWithLevels,
          data.edges,
          'TB'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    }
  }, [data]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    event.preventDefault();
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleNodeDragStop = useCallback((event, node) => {
    if (onNodeDragStop) {
      onNodeDragStop(node);
    }
  }, [onNodeDragStop]);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>Invalid graph data</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
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
        fitView
      >
        <Controls />
        <Background color="#f0f0f0" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;