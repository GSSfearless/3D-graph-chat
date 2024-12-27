import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading knowledge graph...</p>
});

// 导入 Controls 和 Background 组件
const Controls = dynamic(() => import('react-flow-renderer').then(mod => mod.Controls), {
  ssr: false
});

const Background = dynamic(() => import('react-flow-renderer').then(mod => mod.Background), {
  ssr: false
});

const KnowledgeGraph = ({ data, onNodeClick, onNodeDragStop, onNodeDelete }) => {
  console.log('KnowledgeGraph rendered with data:', data);

  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState(data.nodes);
  const [edges, setEdges] = useState(data.edges);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const MAX_NODES = 50; // 设置一个合理的最大节点数

  useEffect(() => {
    setMounted(true);
    setNodes(data.nodes);
    setEdges(data.edges);
  }, [data]);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      try {
        // 限制节点数量
        const limitedNodes = data.nodes.slice(0, MAX_NODES);
        const limitedEdges = data.edges.filter(edge => 
          limitedNodes.some(node => node.id === edge.source) && 
          limitedNodes.some(node => node.id === edge.target)
        );

        // 始终使用金字塔布局
        const { nodes: layoutedNodes, edges: layoutedEdges } = relayoutGraph(limitedNodes, limitedEdges, 'pyramid');
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Error in layout calculation:', error);
        // 如果布局计算失败，至少显示原始节点
        setNodes(data.nodes.slice(0, MAX_NODES));
        setEdges(data.edges);
      }
    }
  }, [data]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
  }, []);

  const handleNodeClick = useCallback(async (event, node) => {
    event.preventDefault();
    setSelectedNode(node);
    setShowNodeDialog(true);
    setIsLoadingQuestions(true);

    try {
      // 获取AI生成的问题
      const response = await fetch('/api/generateQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodeContent: node.data.label,
          nodeId: node.id
        })
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      
      const data = await response.json();
      setSuggestedQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      setSuggestedQuestions([
        `如何深入理解"${node.data.label}"？`,
        `"${node.data.label}"的实际应用有哪些？`,
        `"${node.data.label}"存在什么挑战？`
      ]);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  const handleQuestionSelect = async (question) => {
    setUserInput(question);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    try {
      const response = await fetch('/api/expandNode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: selectedNode.id,
          label: selectedNode.data.label,
          userInput: userInput,
          parentPosition: selectedNode.position,
          existingNodes: nodes
        })
      });

      if (!response.ok) throw new Error('Failed to expand node');
      
      const newData = await response.json();
      
      setNodes(prev => [...prev, ...newData.nodes]);
      setEdges(prev => [...prev, ...newData.edges]);
      
      setShowNodeDialog(false);
      setUserInput('');
      setSelectedNode(null);
    } catch (error) {
      console.error('Error expanding node:', error);
    }
  };

  const handleNodeDragStart = useCallback((event, node) => {
    // You can add any logic here for when dragging starts
  }, []);

  const handleNodeDrag = useCallback((event, node) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );
  }, [setNodes]);

  const handleNodeDragStop = useCallback((event, node) => {
    console.log('Node dragged in KnowledgeGraph:', node);
    onNodeDragStop(node);
  }, [onNodeDragStop]);

  const handleNodeDelete = useCallback((event, node) => {
    event.stopPropagation(); // Prevent triggering onNodeClick
    console.log('Node deleted in KnowledgeGraph:', node);
    onNodeDelete(node);
  }, [onNodeDelete]);

  const handleNodeMouseEnter = useCallback((event, node) => {
    setHoveredNode(node);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id || edges.some(e => (e.source === node.id && e.target === n.id) || (e.target === node.id && e.source === n.id))) {
          return { ...n, style: { ...n.style, opacity: 1, border: '2px solid #ffa500' } };
        }
        return { ...n, style: { ...n.style, opacity: 0.3 } };
      })
    );
    setEdges((eds) =>
      eds.map((e) => {
        if (e.source === node.id || e.target === node.id) {
          return { ...e, style: { ...e.style, stroke: '#ffa500', strokeWidth: 3 } };
        }
        return { ...e, style: { ...e.style, opacity: 0.3 } };
      })
    );
  }, [edges]);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setNodes((nds) =>
      nds.map((n) => ({ ...n, style: { ...n.style, opacity: 1, border: '1px solid #ddd' } }))
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, style: { ...e.style, stroke: '#888', strokeWidth: 2, opacity: 1 } }))
    );
  }, []);

  if (!mounted) return null;

  if (!data || !data.nodes || !data.edges) {
    return <div>Invalid graph data</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
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

      {/* 节点交互弹窗 */}
      {showNodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-all">
            {/* 关闭按钮 */}
            <button 
              onClick={() => setShowNodeDialog(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 标题 */}
            <h3 className="text-xl font-semibold mb-4 pr-8">
              探索"{selectedNode?.data.label}"
            </h3>

            {/* AI生成的问题 */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">选择一个问题或输入你的想法：</p>
              {isLoadingQuestions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionSelect(question)}
                      className="w-full text-left p-2 rounded hover:bg-blue-50 transition-colors duration-200 text-gray-700 hover:text-blue-600 border border-transparent hover:border-blue-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 用户输入区域 */}
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="输入你的想法..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                rows="4"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                添加想法
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;