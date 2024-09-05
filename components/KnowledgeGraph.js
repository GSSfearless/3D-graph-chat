import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ReactFlow = dynamic(() => import('reactflow').then(mod => mod.default), {
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

  console.log('Rendering graph with data:', data);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <ReactFlow 
        nodes={data.nodes}
        edges={data.edges}
        fitView
      />
    </div>
  );
};

export default KnowledgeGraph;