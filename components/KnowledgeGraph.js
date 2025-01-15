import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { relayoutGraph } from '../utils/graphLayouts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faFont, faPalette, faLink } from '@fortawesome/free-solid-svg-icons';

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
  root: {
    fontSize: '20px',
    color: '#2C5282',
    fontWeight: 'bold',
    background: '#EBF8FF',
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
const CustomNode = ({ data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [style, setStyle] = useState(data.style || {});
  const inputRef = useRef(null);
  const nodeRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
    setShowToolbar(true);
  };

  const handleBlur = () => {
    if (data.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  // 样式控制函数
  const toggleBold = () => {
    setStyle(prev => ({
      ...prev,
      fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold'
    }));
  };

  const toggleItalic = () => {
    setStyle(prev => ({
      ...prev,
      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic'
    }));
  };

  const toggleUnderline = () => {
    setStyle(prev => ({
      ...prev,
      textDecoration: prev.textDecoration === 'underline' ? 'none' : 'underline'
    }));
  };

  const changeFontSize = (size) => {
    setStyle(prev => ({
      ...prev,
      fontSize: size
    }));
  };

  const changeColor = (color) => {
    setStyle(prev => ({
      ...prev,
      color: color
    }));
  };

  const handleRelationClick = (e) => {
    e.stopPropagation();
    if (data.onRelationClick) {
      data.onRelationClick(data);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 点击外部关闭工具栏
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target)) {
        setShowToolbar(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={nodeRef} className="relative group" onClick={handleClick}>
      <div style={{ ...data.style, ...style }}>
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ visibility: 'hidden' }}
        />
        
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-center resize-none"
            style={{ 
              fontSize: 'inherit', 
              fontWeight: 'inherit', 
              color: 'inherit',
              border: 'none',
              fontStyle: 'inherit',
              textDecoration: 'inherit',
              minHeight: '1.5em'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full text-center cursor-text">
            {label}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ visibility: 'hidden' }}
        />

        {/* 关联按钮 */}
        <button
          className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handleRelationClick}
          title="查看关联"
        >
          <FontAwesomeIcon icon={faLink} className="text-xs" />
        </button>

        {/* 工具栏 */}
        {showToolbar && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-2 py-1 flex items-center space-x-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); toggleBold(); }}
              className={`p-1 rounded hover:bg-gray-100 ${style.fontWeight === 'bold' ? 'bg-gray-200' : ''}`}
              title="加粗"
            >
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleItalic(); }}
              className={`p-1 rounded hover:bg-gray-100 ${style.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}
              title="斜体"
            >
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleUnderline(); }}
              className={`p-1 rounded hover:bg-gray-100 ${style.textDecoration === 'underline' ? 'bg-gray-200' : ''}`}
              title="下划线"
            >
              <FontAwesomeIcon icon={faUnderline} />
            </button>
            <select
              onChange={(e) => { e.stopPropagation(); changeFontSize(e.target.value); }}
              className="outline-none border rounded p-1 text-sm"
              value={style.fontSize || '14px'}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="12px">小</option>
              <option value="14px">中</option>
              <option value="16px">大</option>
              <option value="18px">特大</option>
            </select>
            <input
              type="color"
              onChange={(e) => { e.stopPropagation(); changeColor(e.target.value); }}
              className="w-6 h-6 rounded cursor-pointer"
              value={style.color || '#2D3748'}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
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
        const nodesWithEdit = data.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onLabelChange: (newLabel) => handleLabelChange(node.id, newLabel),
            onRelationClick: (nodeData) => onNodeClick && onNodeClick(null, nodeData)
          }
        }));

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
  }, [data, handleLabelChange, layout, onNodeClick]);

  const handleNodeClick = useCallback((event, node) => {
    // 不再直接触发onNodeClick
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