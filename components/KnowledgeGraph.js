import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';

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

// 自定义节点组件
const CustomNode = ({ data, isConnectable, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const nodeStyle = {
    root: {
      fontSize: '18px',
      color: '#1a202c',
      fontWeight: 'bold',
      background: '#fff',
      border: selected ? '2px solid #3182ce' : '2px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 20px',
      minWidth: '200px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    mainBranch: {
      fontSize: '16px',
      color: '#2d3748',
      fontWeight: '600',
      background: '#fff',
      border: selected ? '2px solid #3182ce' : '2px solid #e2e8f0',
      borderRadius: '6px',
      padding: '10px 16px',
      minWidth: '180px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    subBranch: {
      fontSize: '14px',
      color: '#4a5568',
      fontWeight: '500',
      background: '#fff',
      border: selected ? '2px solid #3182ce' : '2px solid #e2e8f0',
      borderRadius: '4px',
      padding: '8px 12px',
      minWidth: '160px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }
  };

  return (
    <div style={nodeStyle[data.level || 'subBranch']}>
      <Handle
        type="target"
        position={data.level === 'root' ? Position.Top : Position.Left}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-center"
          style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="w-full text-center cursor-text"
        >
          {label}
        </div>
      )}
      <Handle
        type="source"
        position={data.level === 'root' ? Position.Bottom : Position.Right}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
};

// 定义边的样式
const edgeStyles = {
  mainBranch: {
    stroke: '#3182ce',
    strokeWidth: 2,
  },
  subBranch: {
    stroke: '#4a5568',
    strokeWidth: 1.5,
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
      type: 'straight', // 使用直线连接
      animated: false,
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete }) => {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [explanationCache] = useState(new Map());

  // 处理节点标签更改
  const handleLabelChange = useCallback((nodeId, newLabel) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      try {
        // 为节点添加标签编辑功能
        const nodesWithEdit = data.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onLabelChange: (newLabel) => handleLabelChange(node.id, newLabel)
          }
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          nodesWithEdit,
          data.edges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    }
  }, [data, handleLabelChange]);

  const handleNodeClick = useCallback((event, node) => {
    event.preventDefault();
    if (onNodeClick) {
      // 检查缓存中是否有解释
      const cachedExplanation = explanationCache.get(node.id);
      onNodeClick(node, cachedExplanation);
    }
  }, [onNodeClick, explanationCache]);

  // 缓存节点解释
  const cacheNodeExplanation = useCallback((nodeId, explanation) => {
    explanationCache.set(nodeId, explanation);
  }, []);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
  }, []);

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
        nodeTypes={{ custom: CustomNode }}
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