import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeContentDialog from './NodeContentDialog';

const nodeStyles = {
  root: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2D3748',
    background: '#EDF2F7',
    border: '2px solid #4A5568',
    borderRadius: '8px',
    padding: '12px 20px',
    minWidth: '150px',
    maxWidth: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  mainBranch: {
    fontSize: '14px',
    color: '#4A5568',
    background: '#F7FAFC',
    border: '1.5px solid #718096',
    borderRadius: '6px',
    padding: '10px 16px',
    minWidth: '120px',
    maxWidth: '200px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    textAlign: 'left',
  },
  subBranch: {
    fontSize: '12px',
    color: '#718096',
    background: '#FFFFFF',
    border: '1px solid #A0AEC0',
    borderRadius: '4px',
    padding: '8px 12px',
    minWidth: '100px',
    maxWidth: '180px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    textAlign: 'left',
  }
};

const CustomNode = ({ data, isConnectable, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (label.length > 20) {
      setLabel(label.substring(0, 20) + '...');
    }
  };

  const nodeStyle = {
    ...nodeStyles[data.level || 'subBranch'],
    border: selected ? '2px solid #3182CE' : nodeStyles[data.level || 'subBranch'].border,
    transition: 'all 0.2s ease',
  };

  return (
    <div style={nodeStyle} onDoubleClick={handleDoubleClick}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#718096' }}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={(e) => e.key === 'Enter' && handleBlur()}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontSize: 'inherit',
            color: 'inherit',
            textAlign: 'inherit',
            outline: 'none',
          }}
        />
      ) : (
        <div>{label}</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#718096' }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeOptions = {
  type: 'smoothstep',
  style: {
    stroke: '#718096',
    strokeWidth: 2,
  },
  markerEnd: {
    type: 'arrowclosed',
  },
};

const KnowledgeGraph = ({ nodes: initialNodes = [], edges: initialEdges = [], onNodeClick }) => {
  const safeInitialNodes = initialNodes || [];
  const safeInitialEdges = initialEdges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(
    safeInitialNodes.map(node => ({
      ...node,
      type: 'custom',
      position: node.position || { x: 0, y: 0 },
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(safeInitialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNodeClick = useCallback((event, node) => {
    if (!node) return;
    setSelectedNode(node);
    setDialogOpen(true);
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNode(null);
  };

  if (!safeInitialNodes.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">暂无图谱数据</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      {dialogOpen && selectedNode && (
        <NodeContentDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          nodeData={selectedNode.data}
        />
      )}
    </div>
  );
};

export default KnowledgeGraph;