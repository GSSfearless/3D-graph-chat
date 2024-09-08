import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { getIntersectingNode, getBezierPath, getEdgeCenter } from 'react-flow-renderer';

const MAX_LABEL_LENGTH = 10; // 最大标签长度

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, label, style = {}, markerEnd }) => {
  const edgePath = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [labelPosition, setLabelPosition] = useState({ x: edgeCenterX, y: edgeCenterY });

  useEffect(() => {
    // 尝试在边的不同位置放置标签
    const positions = [
      { x: edgeCenterX, y: edgeCenterY },
      { x: (sourceX + edgeCenterX) / 2, y: (sourceY + edgeCenterY) / 2 },
      { x: (targetX + edgeCenterX) / 2, y: (targetY + edgeCenterY) / 2 },
    ];

    // 选择第一个不与节点重叠的位置
    const suitablePosition = positions.find(pos => 
      !getIntersectingNode(pos, nodes, { nodeWidth: 150, nodeHeight: 50 })
    );

    setLabelPosition(suitablePosition || { x: edgeCenterX, y: edgeCenterY });
  }, [sourceX, sourceY, targetX, targetY, edgeCenterX, edgeCenterY]);

  const shortenedLabel = label.length > MAX_LABEL_LENGTH 
    ? label.slice(0, MAX_LABEL_LENGTH) + '...' 
    : label;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {label && (
        <text
          x={labelPosition.x}
          y={labelPosition.y}
          textAnchor="middle"
          style={{ fill: '#888', fontSize: 12 }}
        >
          {isHovered ? label : shortenedLabel}
        </text>
      )}
    </>
  );
};

const KnowledgeGraph = ({ data }) => {
  const [processedEdges, setProcessedEdges] = useState([]);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      const updatedEdges = data.edges.map(edge => {
        // 根据边的类型设置不同的样式
        const edgeStyle = getEdgeStyle(edge.type);
        return { ...edge, style: edgeStyle, type: 'custom' };
      });

      setProcessedEdges(updatedEdges);
    }
  }, [data]);

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

  const edgeTypes = {
    custom: CustomEdge,
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow 
        nodes={data.nodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            fontSize: '16px', // 增大Node中的文字字体
            fontWeight: 'bold',
          }
        }))}
        edges={processedEdges}
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
        edgeUpdaterRadius={10} // 增加边的更新半径，有助于避免标签重叠
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;