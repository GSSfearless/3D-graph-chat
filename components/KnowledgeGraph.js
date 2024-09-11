import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeMouseEnter, onNodeMouseLeave }) => {
  const onNodeClickHandler = useCallback((event, node) => {
    onNodeClick(node);
  }, [onNodeClick]);

  const onNodeDragStopHandler = useCallback((event, node) => {
    onNodeDragStop(node);
  }, [onNodeDragStop]);

  const onNodeMouseEnterHandler = useCallback((event, node) => {
    onNodeMouseEnter(node);
  }, [onNodeMouseEnter]);

  const onNodeMouseLeaveHandler = useCallback((event, node) => {
    onNodeMouseLeave(node);
  }, [onNodeMouseLeave]);

  return (
    <ReactFlow
      nodes={data.nodes}
      edges={data.edges}
      onNodeClick={onNodeClickHandler}
      onNodeDragStop={onNodeDragStopHandler}
      onNodeMouseEnter={onNodeMouseEnterHandler}
      onNodeMouseLeave={onNodeMouseLeaveHandler}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default KnowledgeGraph;