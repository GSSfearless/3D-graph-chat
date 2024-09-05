import dynamic from 'next/dynamic';
import React from 'react';

const ReactFlow = dynamic(() => import('react-flow-renderer'), { ssr: false });

const KnowledgeGraph = ({ data }) => {
  if (!data || !data.nodes || !data.edges) {
    return <div>Invalid graph data</div>;
  }

  const elements = data.nodes.map((node) => ({
    id: node.id,
    type: 'default',
    data: { label: node.label },
    position: node.position || { x: 0, y: 0 },
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