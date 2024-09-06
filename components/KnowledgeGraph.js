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

  const onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow 
        nodes={data.nodes}
        edges={data.edges}
        onLoad={onLoad}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={true}
        panOnScroll={true}
        zoomOnDoubleClick={false}
        fitView
      />
    </div>
  );
};

export default KnowledgeGraph;