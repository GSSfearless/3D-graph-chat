import React from 'react';
import { KnowledgeGraph3D } from '../components/KnowledgeGraph3D';
import { GraphToolbar } from '../components/GraphToolbar';
import { InfoPanel } from '../components/InfoPanel';
import { SearchBar } from '../components/SearchBar';
import { Node, NodeType } from '../types/graph';
import { generateGraph } from '../utils/graphGenerator';

const sampleData = {
  question: '如何设计一个3D知识图谱？',
  concepts: [
    {
      content: '用户体验',
      examples: ['交互设计', '视觉反馈'],
      summaries: ['设计原则', '用户行为分析'],
      details: ['动画效果', '操作流程']
    },
    {
      content: '技术实现',
      examples: ['Three.js', 'React Three Fiber'],
      summaries: ['架构设计', '性能优化'],
      details: ['力导向布局', '渲染优化']
    },
    {
      content: '数据结构',
      examples: ['节点设计', '关系类型'],
      summaries: ['数据模型', '查询优化'],
      details: ['缓存策略', '数据更新']
    }
  ]
};

interface GraphControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

const Home: React.FC = () => {
  const [graph] = React.useState(() => generateGraph(sampleData));
  const [visibleNodeTypes, setVisibleNodeTypes] = React.useState<Set<NodeType>>(
    () => new Set(Object.values(NodeType))
  );
  const [controls, setControls] = React.useState<GraphControls | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const handleNodeDoubleClick = (node: Node) => {
    handleExpandNode(node.id);
  };

  const handleCloseInfoPanel = () => {
    setSelectedNode(null);
  };

  const handleResetView = () => {
    controls?.resetView();
  };

  const handleToggleNodeType = (type: NodeType) => {
    setVisibleNodeTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleZoomIn = () => {
    controls?.zoomIn();
  };

  const handleZoomOut = () => {
    controls?.zoomOut();
  };

  const handleAutoLayout = () => {
    // 重新计算布局
    const newGraph = generateGraph(sampleData);
    // 这里我们可以添加一个平滑的过渡动画
  };

  const handleSearch = (node: Node) => {
    setSelectedNode(node);
    // 可以添加相机动画，聚焦到选中的节点
  };

  const handleExpandNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        // 收起节点时，同时收起所有相关节点
        const relatedNodes = new Set<string>();
        graph.edges.forEach(edge => {
          if (edge.source === nodeId) {
            relatedNodes.add(edge.target);
          }
          if (edge.target === nodeId) {
            relatedNodes.add(edge.source);
          }
        });
        relatedNodes.forEach(id => next.delete(id));
        next.delete(nodeId);
      } else {
        // 展开节点时，同时展开所有相关节点
        const relatedNodes = new Set<string>();
        graph.edges.forEach(edge => {
          if (edge.source === nodeId) {
            relatedNodes.add(edge.target);
          }
          if (edge.target === nodeId) {
            relatedNodes.add(edge.source);
          }
        });
        relatedNodes.forEach(id => next.add(id));
        next.add(nodeId);
      }
      return next;
    });
  };

  const isNodeExpanded = (nodeId: string) => expandedNodes.has(nodeId);

  const filteredGraph = React.useMemo(() => ({
    ...graph,
    nodes: graph.nodes.filter(node => visibleNodeTypes.has(node.type))
  }), [graph, visibleNodeTypes]);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <GraphToolbar
        onResetView={handleResetView}
        onToggleNodeType={handleToggleNodeType}
        visibleNodeTypes={visibleNodeTypes}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onAutoLayout={handleAutoLayout}
      />
      <SearchBar
        nodes={graph.nodes}
        onSelectNode={handleSearch}
      />
      <KnowledgeGraph3D
        graph={filteredGraph}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onReady={setControls}
        expandedNodes={expandedNodes}
      />
      <InfoPanel
        selectedNode={selectedNode}
        onClose={handleCloseInfoPanel}
        edges={graph.edges}
        nodes={graph.nodes}
        onExpandNode={handleExpandNode}
        isExpanded={isNodeExpanded}
      />
    </div>
  );
};

export default Home; 