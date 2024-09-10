import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useMemo } from 'react';

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

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop }) => {
  console.log('KnowledgeGraph rendered with data:', data);

  const [mounted, setMounted] = useState(false);
  const [visibleElements, setVisibleElements] = useState({ nodes: [], edges: [] });
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const optimizeRenderOrder = useCallback((nodes, edges) => {
    const centralNode = nodes.find(node => node.id === 'central') || nodes[0];
    const orderedNodes = [centralNode];
    const orderedEdges = [];

    const addConnectedNodes = (nodeId) => {
      const connectedEdges = edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
      connectedEdges.forEach(edge => {
        if (!orderedEdges.includes(edge)) {
          orderedEdges.push(edge);
          const connectedNodeId = edge.source === nodeId ? edge.target : edge.source;
          const connectedNode = nodes.find(node => node.id === connectedNodeId);
          if (connectedNode && !orderedNodes.includes(connectedNode)) {
            orderedNodes.push(connectedNode);
            addConnectedNodes(connectedNodeId);
          }
        }
      });
    };

    addConnectedNodes(centralNode.id);

    return [...orderedNodes, ...orderedEdges];
  }, []);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      const renderQueue = optimizeRenderOrder(data.nodes, data.edges);
      const totalElements = renderQueue.length;
      let renderedElements = 0;

      const renderNextElement = () => {
        if (renderedElements < totalElements) {
          const element = renderQueue[renderedElements];
          setVisibleElements(prev => {
            if ('source' in element) {
              return { ...prev, edges: [...prev.edges, element] };
            } else {
              return { ...prev, nodes: [...prev.nodes, element] };
            }
          });
          renderedElements++;
          setLoadingProgress((renderedElements / totalElements) * 100);
          setTimeout(renderNextElement, 100);
        }
      };

      renderNextElement();
    }
  }, [data, optimizeRenderOrder]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    console.log('Node clicked in KnowledgeGraph:', node);
    onNodeClick(node);
  }, [onNodeClick]);

  const handleNodeDragStop = useCallback((event, node) => {
    console.log('Node dragged in KnowledgeGraph:', node);
    onNodeDragStop(node);
  }, [onNodeDragStop]);

  const flowElements = useMemo(() => {
    if (!data || !data.nodes || !data.edges) {
      return { nodes: [], edges: [] };
    }
    return {
      nodes: visibleElements.nodes.map(node => ({
        ...node,
        data: { ...node.data, label: node.data.label },
      })),
      edges: visibleElements.edges
    };
  }, [data, visibleElements]);

  if (!mounted) return null;

  return (
    <div style={{ height: '100%', width: '100%', fontFamily: 'Roboto, sans-serif' }}>
      <ReactFlow 
        key={JSON.stringify(data)}
        nodes={flowElements.nodes}
        edges={flowElements.edges}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onInit={onInit}
        nodesDraggable={true}
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
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {loadingProgress < 100 && (
        <div className="loading-indicator">
          加载进度: {Math.round(loadingProgress)}%
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;