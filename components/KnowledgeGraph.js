import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>加载知识图谱中...</p>
});

const KnowledgeGraph = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>无效的图表数据</div>;
  }

  const elements = [
    ...data.nodes.map((node) => ({
      id: node.id,
      type: 'default',
      data: { label: node.label },
      position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
    })),
    ...data.edges.map((edge) => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: true,
      label: edge.label,
    })),
  ];

  return (
    <div style={{ height: 400 }}>
      <ReactFlow elements={elements} />
    </div>
  );
};

export default KnowledgeGraph;