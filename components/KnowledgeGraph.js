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
    reactFlowInstance.fitView({ padding: 0.2 });
  };

  // 自定义节点样式
  const nodeTypes = {
    custom: ({ data }) => (
      <div style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '10px',
        fontSize: '16px',
        fontWeight: data.important ? 'bold' : 'normal',
        textDecoration: data.important ? 'underline' : 'none',
        maxWidth: '200px',
        wordWrap: 'break-word',
        textAlign: 'center',
      }}>
        {data.label}
      </div>
    ),
  };

  // 修改节点和边的属性
  const modifiedNodes = data.nodes.map(node => ({
    ...node,
    type: 'custom',
    data: {
      ...node.data,
      important: node.data.important || false,
    },
  }));

  const modifiedEdges = data.edges.map(edge => ({
    ...edge,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#888' },
    labelStyle: { fontSize: '14px', fill: '#888' },
  }));

  return (
    <div style={{ height: 600, width: '100%' }}>
      <ReactFlow 
        nodes={modifiedNodes}
        edges={modifiedEdges}
        onLoad={onLoad}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={true}
        panOnScroll={true}
        zoomOnDoubleClick={false}
        elementsSelectable={false}
        minZoom={0.5}
        maxZoom={1.5}
        defaultZoom={1}
      />
    </div>
  );
};

export default KnowledgeGraph;