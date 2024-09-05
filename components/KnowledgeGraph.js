import React from 'react';
import ReactFlow from 'react-flow-renderer';

const KnowledgeGraph = ({ data }) => {
  const elements = data.nodes.map((node) => ({
    id: node.id,
    type: 'default',
    data: { label: node.label },
    position: node.position,
  })).concat(data.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
  })));

  return (
    <div style={{ height: 400 }}>
      <ReactFlow elements={elements} />
    </div>
  );
};

export default KnowledgeGraph;