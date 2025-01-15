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

// 定义节点样式
const nodeStyles = {
  root: {
    fontSize: '20px',
    color: '#2C5282', // 深蓝色
    fontWeight: 'bold',
    background: '#EBF8FF', // 浅蓝色背景
    border: '2px solid #4299E1',
    borderRadius: '25px',
    padding: '12px 24px',
    minWidth: '150px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  mainBranch: {
    fontSize: '16px',
    color: '#2D3748',
    fontWeight: '600',
    background: '#F7FAFC',
    border: '2px solid #A0AEC0',
    borderRadius: '20px',
    padding: '8px 16px',
    minWidth: '120px',
    maxWidth: '200px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  subBranch: {
    fontSize: '14px',
    color: '#4A5568',
    fontWeight: '500',
    background: '#FFFFFF',
    border: '1px solid #CBD5E0',
    borderRadius: '15px',
    padding: '6px 12px',
    minWidth: '100px',
    maxWidth: '180px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    textAlign: 'center',
  }
};

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
    // 如果标签太长，自动截断并添加省略号
    const truncatedLabel = label.length > 20 ? label.substring(0, 20) + '...' : label;
    if (data.onLabelChange) {
      data.onLabelChange(truncatedLabel);
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
      inputRef.current.select();
    }
  }, [isEditing]);

  const nodeStyle = {
    ...nodeStyles[data.level || 'subBranch'],
    border: selected ? `2px solid #3182CE` : nodeStyles[data.level || 'subBranch'].border,
    transition: 'all 0.2s ease',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <div style={nodeStyle}>
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
          style={{ 
            fontSize: 'inherit', 
            fontWeight: 'inherit', 
            color: 'inherit',
            border: 'none',
            maxWidth: '100%'
          }}
          placeholder="输入关键词..."
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="w-full text-center cursor-text"
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
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
    type: 'smoothstep',
    animated: false,
    style: {
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }
  },
  subBranch: {
    stroke: '#4a5568',
    strokeWidth: 1.5,
    type: 'smoothstep',
    animated: false,
    style: {
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }
  }
};

const getLayoutedElements = (nodes, edges) => {
  // 首先找到根节点和直接连接的主分支
  const rootNode = nodes.find(n => n.id === 'root');
  const mainBranches = nodes.filter(n => 
    edges.some(e => e.source === 'root' && e.target === n.id)
  );

  // 将主分支分为左右两组（按标签长度排序，让短标签在上面）
  const sortedBranches = [...mainBranches].sort((a, b) => 
    (a.data.label?.length || 0) - (b.data.label?.length || 0)
  );
  const leftBranches = sortedBranches.slice(0, Math.ceil(sortedBranches.length / 2));
  const rightBranches = sortedBranches.slice(Math.ceil(sortedBranches.length / 2));

  const layoutedNodes = [];
  const VERTICAL_SPACING = 100; // 减小垂直间距
  const HORIZONTAL_SPACING = 250; // 减小水平间距
  const ROOT_Y = 300;
  const BRANCH_ANGLE = 45; // 分支倾斜角度

  // 放置根节点
  if (rootNode) {
    layoutedNodes.push({
      ...rootNode,
      position: { x: 0, y: ROOT_Y },
      style: { ...nodeStyles.root },
      data: { ...rootNode.data, level: 'root' }
    });
  }

  // 布局左侧分支（倾斜排列）
  leftBranches.forEach((branch, index) => {
    const angle = BRANCH_ANGLE - (index * (BRANCH_ANGLE / leftBranches.length));
    const radius = HORIZONTAL_SPACING;
    const x = -Math.cos(angle * Math.PI / 180) * radius;
    const y = ROOT_Y - Math.sin(angle * Math.PI / 180) * radius;

    layoutedNodes.push({
      ...branch,
      position: { x, y },
      style: { ...nodeStyles.mainBranch },
      data: { ...branch.data, level: 'mainBranch' }
    });

    // 找到并布局该主分支的子节点
    const subNodes = nodes.filter(n =>
      edges.some(e => e.source === branch.id && e.target === n.id)
    );

    // 子节点沿着主分支方向延伸
    subNodes.forEach((subNode, subIndex) => {
      const subRadius = radius + HORIZONTAL_SPACING * 0.8;
      const subX = -Math.cos(angle * Math.PI / 180) * subRadius;
      const subY = ROOT_Y - Math.sin(angle * Math.PI / 180) * subRadius + 
                   (subIndex - (subNodes.length - 1) / 2) * (VERTICAL_SPACING * 0.5);

      layoutedNodes.push({
        ...subNode,
        position: { x: subX, y: subY },
        style: { ...nodeStyles.subBranch },
        data: { ...subNode.data, level: 'subBranch' }
      });
    });
  });

  // 布局右侧分支（倾斜排列）
  rightBranches.forEach((branch, index) => {
    const angle = -BRANCH_ANGLE + (index * (BRANCH_ANGLE / rightBranches.length));
    const radius = HORIZONTAL_SPACING;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = ROOT_Y - Math.sin(angle * Math.PI / 180) * radius;

    layoutedNodes.push({
      ...branch,
      position: { x, y },
      style: { ...nodeStyles.mainBranch },
      data: { ...branch.data, level: 'mainBranch' }
    });

    // 找到并布局该主分支的子节点
    const subNodes = nodes.filter(n =>
      edges.some(e => e.source === branch.id && e.target === n.id)
    );

    // 子节点沿着主分支方向延伸
    subNodes.forEach((subNode, subIndex) => {
      const subRadius = radius + HORIZONTAL_SPACING * 0.8;
      const subX = Math.cos(angle * Math.PI / 180) * subRadius;
      const subY = ROOT_Y - Math.sin(angle * Math.PI / 180) * subRadius + 
                   (subIndex - (subNodes.length - 1) / 2) * (VERTICAL_SPACING * 0.5);

      layoutedNodes.push({
        ...subNode,
        position: { x: subX, y: subY },
        style: { ...nodeStyles.subBranch },
        data: { ...subNode.data, level: 'subBranch' }
      });
    });
  });

  // 设置边的样式
  const layoutedEdges = edges.map((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const edgeType = sourceNode?.data.level === 'root' ? 'mainBranch' : 'subBranch';
    return {
      ...edge,
      ...edgeStyles[edgeType],
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

  const handleNodeDragStop = useCallback((event, node) => {
    if (onNodeDragStop) {
      onNodeDragStop(node);
    }
  }, [onNodeDragStop]);

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
        elementsSelectable={true}
      >
        <Controls />
        <Background color="#f0f0f0" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;