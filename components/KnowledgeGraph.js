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

// 更新节点样式定义
const nodeStyles = {
  method: {
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
  promotion: {
    fontSize: '18px',
    color: '#1E3A8A',
    fontWeight: 'bold',
    background: '#FFF',
    border: '2.5px solid #3B82F6',
    borderRadius: '35px',
    padding: '15px 25px',
    minWidth: '200px',
    maxWidth: '300px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  skills: {
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
  }
};

// 自定义节点组件
const CustomNode = ({ data, isConnectable, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const inputRef = useRef(null);
  const noteInputRef = useRef(null);

  // 根据节点类型获取样式
  const getNodeStyle = () => {
    const baseStyle = nodeStyles[data.type || 'promotion'];
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
    if (isAddingNote && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [isEditing, isAddingNote]);

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
            {data.type !== 'promotion' && (
              <div className="mt-2">
                <button
                  onClick={handleAddNote}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + 添加笔记
                </button>
              </div>
            )}
          </>
        )}
      </div>
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