import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  getBezierPath, 
  getMarkerEnd,
  Position
} from 'react-flow-renderer';

const MAX_LABEL_LENGTH = 10;

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style = {} }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);

  const shortenedLabel = data.fullLabel.length > MAX_LABEL_LENGTH 
    ? data.fullLabel.slice(0, MAX_LABEL_LENGTH) + '...' 
    : data.fullLabel;

  const edgeStyle = getEdgeStyle(data.type);

  return (
    <>
      <path
        id={id}
        style={{ ...style, ...edgeStyle }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={getMarkerEnd(edgeStyle.stroke, 'arrowclosed')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {data.fullLabel && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          style={{ fill: '#888', fontSize: 12, pointerEvents: 'none' }}
        >
          {isHovered ? data.fullLabel : shortenedLabel}
        </text>
      )}
    </>
  );
};

const getEdgeStyle = (edgeType) => {
  switch (edgeType) {
    case 'strong':
      return { stroke: '#ff0000', strokeWidth: 2 };
    case 'weak':
      return { stroke: '#00ff00', strokeWidth: 1, strokeDasharray: '5,5' };
    default:
      return { stroke: '#888888', strokeWidth: 1 };
  }
};

const KnowledgeGraph = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>无效的图表数据</div>;
  }

  const edgeTypes = {
    custom: CustomEdge,
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow 
        nodes={data.nodes}
        edges={data.edges}
        edgeTypes={edgeTypes}
        onInit={onInit}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
        panOnScrollMode="free"
        minZoom={0.1}
        maxZoom={4}
        defaultZoom={1}
        onlyRenderVisibleElements={true}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;