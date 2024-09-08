import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>加载知识图谱中...</p>
});

// 导入 Controls 和 Background 组件
const Controls = dynamic(() => import('react-flow-renderer').then(mod => mod.Controls), {
  ssr: false
});

const Background = dynamic(() => import('react-flow-renderer').then(mod => mod.Background), {
  ssr: false
});

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

  return (
    <div style={{ height: '100%', width: '100%', fontFamily: 'Roboto, sans-serif' }}>
      <ReactFlow 
        nodes={data.nodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            fontSize: '14px',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            padding: '10px',
            maxWidth: '200px',
          }
        }))}
        edges={data.edges.map(edge => ({
          ...edge,
          style: { ...edge.style, strokeWidth: 2 },
          labelStyle: { 
            ...edge.labelStyle, 
            fontSize: 12,
            fill: '#888',
            fontWeight: 700,
          },
          labelBgStyle: { 
            ...edge.labelBgStyle, 
            fill: '#fff', 
            fillOpacity: 0.8,
          },
          labelBgPadding: [4, 2],
          labelShowBg: true,
          labelBgBorderRadius: 2,
          label: '...',
          data: { fullLabel: edge.label || '' },
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: 'arrowclosed',
            color: '#888',
          },
        }))}
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
        edgeUpdaterRadius={10}
        edgeTypes={{
          default: (props) => (
            <div
              onMouseEnter={() => {
                props.label = props.data.fullLabel;
                props.labelStyle = { ...props.labelStyle, fontSize: 12 };
              }}
              onMouseLeave={() => {
                props.label = '...';
                props.labelStyle = { ...props.labelStyle, fontSize: 12 };
              }}
            >
              {props.children}
            </div>
          ),
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;