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

// 添加思考阶段定义
const THINKING_STAGES = {
  COLLECT: 'collect',
  RESEARCH: 'research',
  DISCUSS: 'discuss',
  REFLECT: 'reflect'
};

// 更新节点样式定义
const nodeStyles = {
  collect: {
    fontSize: '16px',
    color: '#1E40AF',
    fontWeight: '600',
    background: '#F0F9FF',
    border: '2px solid #93C5FD',
    borderRadius: '30px',
    padding: '10px 20px',
    minWidth: '180px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  research: {
    fontSize: '16px',
    color: '#166534',
    fontWeight: '600',
    background: '#F0FDF4',
    border: '2px solid #86EFAC',
    borderRadius: '30px',
    padding: '10px 20px',
    minWidth: '180px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  discuss: {
    fontSize: '16px',
    color: '#9D174D',
    fontWeight: '600',
    background: '#FDF2F8',
    border: '2px solid #F472B6',
    borderRadius: '30px',
    padding: '10px 20px',
    minWidth: '180px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  reflect: {
    fontSize: '16px',
    color: '#7E22CE',
    fontWeight: '600',
    background: '#FAF5FF',
    border: '2px solid #C084FC',
    borderRadius: '30px',
    padding: '10px 20px',
    minWidth: '180px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  }
};

// 自定义节点组件
const CustomNode = ({ data, isConnectable, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const inputRef = useRef(null);
  const noteInputRef = useRef(null);
  const resourceInputRef = useRef(null);

  // 获取节点样式
  const getNodeStyle = () => {
    const baseStyle = nodeStyles[data.stage || 'collect'];
    if (selected) {
      return {
        ...baseStyle,
        boxShadow: '0 0 0 2px #3B82F6',
      };
    }
    return baseStyle;
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleNoteSubmit = () => {
    const noteContent = noteInputRef.current.value;
    if (noteContent && data.onAddNote) {
      data.onAddNote(noteContent);
    }
    setIsAddingNote(false);
  };

  // 添加资源处理
  const handleAddResource = () => {
    setIsAddingResource(true);
  };

  const handleResourceSubmit = () => {
    const resourceContent = resourceInputRef.current.value;
    if (resourceContent && data.onAddResource) {
      data.onAddResource(resourceContent);
    }
    setIsAddingResource(false);
  };

  // 获取阶段提示
  const getStageTip = () => {
    switch (data.stage) {
      case THINKING_STAGES.COLLECT:
        return '收集想法和灵感';
      case THINKING_STAGES.RESEARCH:
        return '深入调研和分析';
      case THINKING_STAGES.DISCUSS:
        return '讨论和交流';
      case THINKING_STAGES.REFLECT:
        return '思考和总结';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
    if (isAddingNote && noteInputRef.current) {
      noteInputRef.current.focus();
    }
    if (isAddingResource && resourceInputRef.current) {
      resourceInputRef.current.focus();
    }
  }, [isEditing, isAddingNote, isAddingResource]);

  return (
    <div style={getNodeStyle()}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div className="flex flex-col items-center">
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-transparent outline-none text-center"
            style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
          />
        ) : (
          <>
            <div
              onDoubleClick={handleDoubleClick}
              className="w-full text-center cursor-text"
            >
              {label}
            </div>
            <div className="mt-1 text-xs text-gray-500">{getStageTip()}</div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleAddNote}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                📝 添加笔记
              </button>
              <button
                onClick={handleAddResource}
                className="text-xs text-green-600 hover:text-green-800"
              >
                📚 添加资源
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* 笔记输入框 */}
      {isAddingNote && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg p-2 z-50">
          <textarea
            ref={noteInputRef}
            className="w-full p-2 border rounded"
            placeholder="输入笔记内容..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setIsAddingNote(false)}
              className="mr-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={handleNoteSubmit}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 资源输入框 */}
      {isAddingResource && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg p-2 z-50">
          <textarea
            ref={resourceInputRef}
            className="w-full p-2 border rounded"
            placeholder="添加链接或上传文件..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setIsAddingResource(false)}
              className="mr-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={handleResourceSubmit}
              className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              添加
            </button>
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete, layout = 'verticalMethod' }) => {
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

  const handleAddNote = useCallback((nodeId, noteContent) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                notes: [...(node.data.notes || []), noteContent]
              }
            }
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
        // 为节点添加笔记功能
        const nodesWithFeatures = data.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onLabelChange: (newLabel) => handleLabelChange(node.id, newLabel),
            onAddNote: (noteContent) => handleAddNote(node.id, noteContent)
          }
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = relayoutGraph(
          nodesWithFeatures,
          data.edges,
          layout
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
      }
    }
  }, [data, handleLabelChange, handleAddNote, layout]);

  const handleNodeClick = useCallback((event, node) => {
    event.preventDefault();
    if (onNodeClick) {
      const cachedExplanation = explanationCache.get(node.id);
      onNodeClick(node, cachedExplanation);
    }
  }, [onNodeClick, explanationCache]);

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