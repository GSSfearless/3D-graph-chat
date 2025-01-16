import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { relayoutGraph } from '../utils/graphLayouts';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>正在加载知识图谱...</p>
});

const Controls = dynamic(() => import('react-flow-renderer').then(mod => mod.Controls), {
  ssr: false
});

const Background = dynamic(() => import('react-flow-renderer').then(mod => mod.Background), {
  ssr: false
});

// 定义节点样式
const nodeStyles = {
  center: {
    fontSize: '24px',
    color: '#2C5282',
    fontWeight: 'bold',
    background: '#EBF8FF',
    borderRadius: '30px',
    padding: '15px 30px',
    minWidth: '200px',
    maxWidth: '300px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  branch: {
    fontSize: '18px',
    color: '#2D3748',
    fontWeight: '600',
    background: '#F7FAFC',
    borderRadius: '25px',
    padding: '12px 24px',
    minWidth: '150px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  subbranch: {
    fontSize: '16px',
    color: '#4A5568',
    fontWeight: '500',
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '8px 16px',
    minWidth: '120px',
    maxWidth: '200px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    textAlign: 'center',
  }
};

// 自定义节点组件
const CustomNode = ({ data, isConnectable, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef(null);

  // 根据节点类型获取样式
  const getNodeStyle = () => {
    const baseStyle = nodeStyles[data.type || 'branch'];
    if (selected) {
      return {
        ...baseStyle,
        background: '#EBF8FF',
      };
    }
    return baseStyle;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // 根据节点类型设置不同的标签长度限制
    const maxLength = data.type === 'center' ? 30 : data.type === 'branch' ? 25 : 20;
    const truncatedLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
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

  return (
    <div style={getNodeStyle()}>
      <Handle
        type="target"
        position={Position.Left}
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
          onClick={handleClick}
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
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
};

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete, layout = 'rightLogical' }) => {
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

        // 使用我们的布局系统
        const { nodes: layoutedNodes, edges: layoutedEdges } = relayoutGraph(
          nodesWithEdit,
          data.edges,
          layout
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    }
  }, [data, handleLabelChange, layout]);

  const handleNodeClick = useCallback((event, node) => {
    // 不再触发搜索，让节点组件自己处理点击事件
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