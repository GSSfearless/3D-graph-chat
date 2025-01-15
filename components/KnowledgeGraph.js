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
    fontSize: '18px',
    color: 'white',
    fontWeight: 'bold',
    minWidth: '250px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  mainBranch: {
    background: 'linear-gradient(45deg, #4ECDC4, #45B7AF)',
    border: '2px solid #4ECDC4',
    borderRadius: '25px',
    padding: '15px',
    fontSize: '16px',
    color: 'white',
    fontWeight: '600',
    minWidth: '200px',
    textAlign: 'center',
    boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
  },
  subBranch: {
    background: 'linear-gradient(45deg, #96CDEF, #7FB2D2)',
    border: '2px solid #96CDEF',
    borderRadius: '20px',
    padding: '12px',
    fontSize: '14px',
    color: 'white',
    fontWeight: '500',
    minWidth: '180px',
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

const getLayoutedElements = (nodes, edges) => {
  // 首先找到根节点和直接连接的主分支
  const rootNode = nodes.find(n => n.id === 'root');
  const mainBranches = nodes.filter(n => 
    edges.some(e => e.source === 'root' && e.target === n.id)
  );

  // 将主分支分为左右两组
  const leftBranches = mainBranches.slice(0, Math.ceil(mainBranches.length / 2));
  const rightBranches = mainBranches.slice(Math.ceil(mainBranches.length / 2));

  const layoutedNodes = [];
  const VERTICAL_SPACING = 120;
  const HORIZONTAL_SPACING = 300;
  const ROOT_Y = 300; // 根节点的垂直位置

  // 放置根节点
  if (rootNode) {
    layoutedNodes.push({
      ...rootNode,
      position: { x: 0, y: ROOT_Y },
      style: { ...nodeStyles.root },
      data: { ...rootNode.data, level: 'root' }
    });
  }

  // 布局左侧分支
  leftBranches.forEach((branch, index) => {
    const y = ROOT_Y - (leftBranches.length * VERTICAL_SPACING / 2) + (index * VERTICAL_SPACING);
    layoutedNodes.push({
      ...branch,
      position: { x: -HORIZONTAL_SPACING, y },
      style: { ...nodeStyles.mainBranch },
      data: { ...branch.data, level: 'mainBranch' }
    });

    // 找到并布局该主分支的子节点
    const subNodes = nodes.filter(n =>
      edges.some(e => e.source === branch.id && e.target === n.id)
    );

    const SUB_HORIZONTAL_SPACING = HORIZONTAL_SPACING * 2;
    subNodes.forEach((subNode, subIndex) => {
      const subY = y - (subNodes.length * VERTICAL_SPACING / 3 / 2) + (subIndex * VERTICAL_SPACING / 3);
      layoutedNodes.push({
        ...subNode,
        position: { x: -SUB_HORIZONTAL_SPACING, y: subY },
        style: { ...nodeStyles.subBranch },
        data: { ...subNode.data, level: 'subBranch' }
      });
    });
  });

  // 布局右侧分支
  rightBranches.forEach((branch, index) => {
    const y = ROOT_Y - (rightBranches.length * VERTICAL_SPACING / 2) + (index * VERTICAL_SPACING);
    layoutedNodes.push({
      ...branch,
      position: { x: HORIZONTAL_SPACING, y },
      style: { ...nodeStyles.mainBranch },
      data: { ...branch.data, level: 'mainBranch' }
    });

    // 找到并布局该主分支的子节点
    const subNodes = nodes.filter(n =>
      edges.some(e => e.source === branch.id && e.target === n.id)
    );

    const SUB_HORIZONTAL_SPACING = HORIZONTAL_SPACING * 2;
    subNodes.forEach((subNode, subIndex) => {
      const subY = y - (subNodes.length * VERTICAL_SPACING / 3 / 2) + (subIndex * VERTICAL_SPACING / 3);
      layoutedNodes.push({
        ...subNode,
        position: { x: SUB_HORIZONTAL_SPACING, y: subY },
        style: { ...nodeStyles.subBranch },
        data: { ...subNode.data, level: 'subBranch' }
      });
    });
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
        // 应用布局
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(data.nodes, data.edges);
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
        defaultZoom={0.7}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Controls />
        <Background color="#f0f0f0" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;