import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <p>Loading knowledge graph...</p>
});

function sanitizeHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const allowedTags = ['h3', 'strong', 'ul', 'li', 'p'];
  const allowedAttributes = {};
  
  function sanitizeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        const text = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(text, node);
      } else {
        for (let i = node.attributes.length - 1; i >= 0; i--) {
          const attr = node.attributes[i];
          if (!(node.tagName.toLowerCase() in allowedAttributes) || 
              !allowedAttributes[node.tagName.toLowerCase()].includes(attr.name)) {
            node.removeAttribute(attr.name);
          }
        }
        Array.from(node.childNodes).forEach(sanitizeNode);
      }
    }
  }
  
  Array.from(temp.childNodes).forEach(sanitizeNode);
  return temp.innerHTML;
}

function renderMarkdown(text) {
  // Handle headings (only h3)
  text = text.replace(/^###\s(.*)$/gm, '<h3>$1</h3>');
  
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle unordered lists
  text = text.replace(/•\s(.*)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>(\n|$))+/g, '<ul>$&</ul>');
  
  // Handle paragraphs (excluding list items and headings)
  text = text.split('\n').map(line => {
    if (!line.startsWith('<h3>') && !line.startsWith('<li>') && !line.startsWith('<ul>') && line.trim() !== '') {
      return `<p>${line}</p>`;
    }
    return line;
  }).join('\n');
  
  return text;
}

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [query, setQuery] = useState('');
  const [largeSearchQuery, setLargeSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [renderedAnswer, setRenderedAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [graphError, setGraphError] = useState(null);
  const [showLargeSearch, setShowLargeSearch] = useState(false);
  const [expandingNode, setExpandingNode] = useState(null);
  const [graphHistory, setGraphHistory] = useState([]);
  const [graphFuture, setGraphFuture] = useState([]);
  const [hasPreviousGraph, setHasPreviousGraph] = useState(false);
  const [collectedPages, setCollectedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('🎨 Preparing the canvas...');
  const [nodeExplanations, setNodeExplanations] = useState({});
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isLoadingNodeExplanation, setIsLoadingNodeExplanation] = useState(false);
  const initialAnswerRef = useRef('');
  const [viewingChildNode, setViewingChildNode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('radialTree');

  const defaultQuery = "What is the answer to life, the universe, and everything?";

  const loadingMessages = [
    '🎨 Preparing the canvas...',
    '🧚 Awakening knowledge fairies...',
    '🏰 Constructing mind palace...',
    '🌌 Connecting knowledge constellation...',
    '🧠 Activating brain neurons...',
    '🗺️ Drawing wisdom blueprint...',
    '🔓 Unlocking knowledge vault...',
    '🧙‍♀️ Summoning wisdom goddess...',
    '💡 Illuminating thought lighthouse...',
    '🚀 Launching knowledge engine...'
  ];

  const processingMessages = [
    "Performing Retrieval-Augmented Generation (RAG)...",
    "Analyzing information with Large Language Model (LLM)...",
    "Integrating search results and generating answer...",
    "AI processing retrieved information..."
  ];

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setIsCollecting(true);
    setIsProcessing(false);
    setCollectedPages(0);
    setTotalPages(0);
    setGraphError(null);
    setSearchResults([]);

    try {
      const eventSource = new EventSource(`/api/rag-search?query=${encodeURIComponent(searchQuery)}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.done) {
          eventSource.close();
          setIsCollecting(false);
          setIsProcessing(true);
        } else {
          setCollectedPages(data.progress);
          setTotalPages(data.total);
          setSearchResults(prev => [...prev, data.result]);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setIsCollecting(false);
        setIsProcessing(false);
      };

      // Get AI answer
      setStreamedAnswer('');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchResults, query: searchQuery }),
      });

      if (!chatResponse.ok) {
        throw new Error(`HTTP error! status: ${chatResponse.status}`);
      }

      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setStreamedAnswer((prev) => prev + chunkValue);
      }

      // Store the initial answer
      initialAnswerRef.current = streamedAnswer;

      // Get knowledge graph data
      try {
        const graphResponse = await fetch('/api/knowledgeGraph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (!graphResponse.ok) {
          throw new Error(`HTTP error! status: ${graphResponse.status}`);
        }

        const graphData = await graphResponse.json();
        
        // 确保 graphData 有正确的结构
        if (graphData && graphData.nodes && graphData.edges) {
          setKnowledgeGraphData(graphData);
        } else {
          console.error('Invalid graph data structure:', graphData);
          setGraphError('Invalid graph data structure');
        }
      } catch (error) {
        console.error('Error fetching knowledge graph:', error);
        setGraphError('Failed to load knowledge graph');
      }

      // After all processing is complete
      setIsProcessing(false);
      setIsCollecting(false);
      setQuery('');
      setCollectedPages(0);
      setTotalPages(0);
    } catch (error) {
      console.error('Error during search:', error);
      setIsProcessing(false);
      setIsCollecting(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingStep((prev) => (prev + 1) % processingMessages.length);
      }, 2000); // Switch every 2 seconds
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    let interval;
    if (loading || expandingNode) {
      interval = setInterval(() => {
        setLoadingMessage(prevMessage => {
          const currentIndex = loadingMessages.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, expandingNode]);

  useEffect(() => {
    console.log('Search component mounted');
    if (initialLoad && q) {
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [initialLoad, q, handleSearch]);

  useEffect(() => {
    if (streamedAnswer) {
      const markdown = renderMarkdown(streamedAnswer);
      const sanitized = sanitizeHtml(markdown);
      setRenderedAnswer(sanitized);
    }
  }, [streamedAnswer]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  }

  const handleLargeSearchChange = (e) => {
    setLargeSearchQuery(e.target.value);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }

  const handleButtonClick = () => {
    handleSearch(query);
  }

  const handleLargeSearch = () => {
    if (largeSearchQuery.trim() !== '') {
      handleSearch(largeSearchQuery);
      setShowLargeSearch(false);
      setLargeSearchQuery('');
    }
  };

  const handleLargeSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLargeSearch();
    }
  };

  const generateNodeExplanation = useCallback(async (nodeId, label) => {
    try {
      const response = await fetch('/api/nodeExplanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodeId, 
          label, 
          graphData: knowledgeGraphData 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.explanation;
    } catch (error) {
      console.error('Error generating node explanation:', error);
      return `Unable to generate explanation for "${label}".`;
    }
  }, [knowledgeGraphData]);

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNodeId(node.id);
    setIsLoadingNodeExplanation(true);
    setLoadingMessage('Loading explanation...');

    if (knowledgeGraphData && knowledgeGraphData.nodes && knowledgeGraphData.nodes.length > 0) {
      if (node.id === knowledgeGraphData.nodes[0].id) {
        // If it's the root node, always show the initial answer
        setStreamedAnswer(initialAnswerRef.current);
        setViewingChildNode(false);
      } else {
        // If it's a child node
        setViewingChildNode(true);
        if (!nodeExplanations[node.id]) {
          // If explanation doesn't exist, fetch it
          try {
            const explanation = await generateNodeExplanation(node.id, node.data.label);
            setNodeExplanations(prev => ({...prev, [node.id]: explanation}));
            setStreamedAnswer(explanation);
          } catch (error) {
            console.error('Error fetching node explanation:', error);
            setStreamedAnswer('Failed to load explanation. Please try again.');
          }
        } else {
          // If explanation exists, just set it
          setStreamedAnswer(nodeExplanations[node.id]);
        }
      }
    } else {
      console.error('Knowledge graph data is incomplete or missing');
      setStreamedAnswer('Unable to load node information. Please try again.');
    }
  
    setIsLoadingNodeExplanation(false);
    setLoadingMessage('');
  }, [knowledgeGraphData, nodeExplanations, generateNodeExplanation, initialAnswerRef]);

  const handleNodeDragStop = useCallback((node) => {
    setGraphHistory(prev => {
      const newHistory = [...prev, knowledgeGraphData];
      setHasPreviousGraph(newHistory.length > 0);
      return newHistory;
    });
    setGraphFuture([]); // Clear future states
    setKnowledgeGraphData(prevData => {
      const updatedNodes = prevData.nodes.map(n => 
        n.id === node.id ? { ...n, position: node.position } : n
      );
      return { ...prevData, nodes: updatedNodes };
    });
  }, [knowledgeGraphData]);

  const handleNodeDelete = useCallback((node) => {
    setGraphHistory(prev => {
      const newHistory = [...prev, knowledgeGraphData];
      setHasPreviousGraph(newHistory.length > 0);
      return newHistory;
    });
    setGraphFuture([]); // Clear future states
    setKnowledgeGraphData(prevData => {
      const updatedNodes = prevData.nodes.filter(n => n.id !== node.id);
      const updatedEdges = prevData.edges.filter(e => e.source !== node.id && e.target !== node.id);
      return { nodes: updatedNodes, edges: updatedEdges };
    });
  }, [knowledgeGraphData]);

  const handleUndo = useCallback(() => {
    if (graphHistory.length > 0) {
      const previousState = graphHistory[graphHistory.length - 1];
      setGraphFuture(prev => [knowledgeGraphData, ...prev]);
      setKnowledgeGraphData(previousState);
      setGraphHistory(prev => {
        const newHistory = prev.slice(0, -1);
        setHasPreviousGraph(newHistory.length > 0);
        return newHistory;
      });
    }
  }, [graphHistory, knowledgeGraphData]);

  const handleRedo = useCallback(() => {
    if (graphFuture.length > 0) {
      const nextState = graphFuture[0];
      setGraphHistory(prev => {
        const newHistory = [...prev, knowledgeGraphData];
        setHasPreviousGraph(true);
        return newHistory;
      });
      setKnowledgeGraphData(nextState);
      setGraphFuture(prev => prev.slice(1));
    }
  }, [graphFuture, knowledgeGraphData]);

  const handleReturnToInitialResult = useCallback(() => {
    setStreamedAnswer(initialAnswerRef.current);
    setViewingChildNode(false);
  }, [initialAnswerRef]);

  const handleLayoutChange = useCallback((newLayout) => {
    setCurrentLayout(newLayout);
    if (knowledgeGraphData) {
      const newGraphData = relayoutGraph(knowledgeGraphData.nodes, knowledgeGraphData.edges, newLayout);
      setKnowledgeGraphData(newGraphData);
    }
  }, [knowledgeGraphData]);

  useEffect(() => {
    console.log('knowledgeGraphData updated:', knowledgeGraphData);
  }, [knowledgeGraphData]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* 顶部搜索栏 */}
      <div className="w-full bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <input
            type="text"
            placeholder="探索你的想法..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          />
          <button
            onClick={() => handleSearch(query)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧 Answer 区域 */}
        <div className="w-1/2 p-6 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              {isCollecting ? (
                <div>
                  <p className="text-lg mb-2">{loadingMessage}</p>
                  <p>收集页面: {collectedPages}/{totalPages || '?'}</p>
                </div>
              ) : isProcessing ? (
                <p className="text-lg">{processingMessages[processingStep]}</p>
              ) : (
                <p className="text-lg">{loadingMessage}</p>
              )}
            </div>
          )}
          
          {!loading && streamedAnswer && (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(streamedAnswer) }}
            />
          )}
        </div>

        {/* 右侧 Knowledge Graph 区域 */}
        <div className="w-1/2 border-l border-gray-200 p-6">
          {graphError ? (
            <div className="text-red-500 text-center py-8">
              {graphError}
            </div>
          ) : (
            <div className="h-full">
              <KnowledgeGraph
                data={knowledgeGraphData}
                onNodeClick={handleNodeClick}
                layout={currentLayout}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}