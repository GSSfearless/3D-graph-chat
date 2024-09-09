import { faArrowRight, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

const KnowledgeGraph = dynamic(() => import('../components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <p>正在加载知识图谱...</p>
});

function sanitizeHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerHTML; // 使用 innerHTML 而不是 textContent
}

function renderMarkdown(text) {
  // 处理小标题
  text = text.replace(/^###\s(.*)$/gm, '<h3>$1</h3>');
  
  // 处理粗体
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 处理编号列表
  text = text.replace(/^\d+\.\s(.*)$/gm, '<li>$1</li>');
  text = text.replace(/<li>/g, '<ol><li>').replace(/<\/li>(?![\n\r]*<li>)/g, '</li></ol>');
  
  // 处理段落
  text = text.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('');
  
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

  const defaultQuery = "生命、宇宙以及一切的答案是什么？";

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setGraphError(null);
    try {
      const actualQuery = searchQuery || defaultQuery;
      
      // 获取搜索结果
      const searchResponse = await fetch('/api/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: actualQuery }),
      });
      const searchData = await searchResponse.json();
      setSearchResults(searchData);

      // 获取AI回答
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: searchData, query: actualQuery }),
      });
      const chatData = await chatResponse.json();
      setAiAnswer(chatData.answer);

      // 获取知识图谱数据
      try {
        const graphResponse = await fetch('/api/knowledgeGraph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: actualQuery }),
        });

        if (!graphResponse.ok) {
          throw new Error(`知识图谱API错误: ${graphResponse.status}`);
        }

        const graphData = await graphResponse.json();
        console.log('知识图谱数据:', graphData);
        setGraphHistory(prev => [...prev, knowledgeGraphData]);
        setGraphFuture([]);
        setKnowledgeGraphData(graphData);
        console.log('Initial knowledge graph data:', graphData);
      } catch (error) {
        console.error('获取知识图谱时出错:', error);
        setGraphError('无法加载知识图谱');
        setKnowledgeGraphData(null);
      }

      setQuery('');
    } catch (error) {
      console.error('搜索过程中出错:', error);
    }
    setLoading(false);
  }, [knowledgeGraphData]);

  useEffect(() => {
    console.log('Search component mounted');
    if (initialLoad && q) {
      handleSearch(q);
      setInitialLoad(false);
    }
  }, [initialLoad, q, handleSearch]);

  useEffect(() => {
    if (aiAnswer) {
      const markdown = renderMarkdown(aiAnswer);
      const sanitized = sanitizeHtml(markdown);
      setRenderedAnswer(sanitized);
    }
  }, [aiAnswer]);

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

  const handleNodeClick = async (node) => {
    setExpandingNode(node.id);
    setGraphError(null);

    try {
      console.log('Sending request to /api/expandNode');
      const response = await fetch('/api/expandNode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodeId: node.id, 
          label: node.data.label,
          parentPosition: node.position,
          existingNodes: knowledgeGraphData.nodes // 传递现有节点信息
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const expandedData = await response.json();
      console.log('Expanded data:', expandedData);

      setGraphHistory(prev => [...prev, knowledgeGraphData]);
      setGraphFuture([]); // 清空未来状态，因为创建了新的分支
      
      setKnowledgeGraphData(prevData => {
        const newNodes = [...prevData.nodes, ...expandedData.nodes];
        const newEdges = [...prevData.edges, ...expandedData.edges];
        
        return {
          nodes: newNodes,
          edges: newEdges,
          type: prevData.type
        };
      });
    } catch (error) {
      console.error('展开节点时出错:', error);
      setGraphError('展开节点时出错: ' + error.message);
    } finally {
      setExpandingNode(null);
    }
  };

  const handleNodeDragStop = useCallback((node) => {
    setGraphHistory(prev => [...prev, knowledgeGraphData]);
    setGraphFuture([]); // 清空未来状态
    setKnowledgeGraphData(prevData => {
      const updatedNodes = prevData.nodes.map(n => 
        n.id === node.id ? { ...n, position: node.position } : n
      );
      return { ...prevData, nodes: updatedNodes };
    });
  }, [knowledgeGraphData]);

  const handleUndo = useCallback(() => {
    if (graphHistory.length > 0) {
      const previousState = graphHistory[graphHistory.length - 1];
      setGraphFuture(prev => [knowledgeGraphData, ...prev]);
      setKnowledgeGraphData(previousState);
      setGraphHistory(prev => prev.slice(0, -1));
    }
  }, [graphHistory, knowledgeGraphData]);

  const handleRedo = useCallback(() => {
    if (graphFuture.length > 0) {
      const nextState = graphFuture[0];
      setGraphHistory(prev => [...prev, knowledgeGraphData]);
      setKnowledgeGraphData(nextState);
      setGraphFuture(prev => prev.slice(1));
    }
  }, [graphFuture, knowledgeGraphData]);

  useEffect(() => {
    console.log('knowledgeGraphData updated:', knowledgeGraphData);
  }, [knowledgeGraphData]);

  return (
    <div className="flex flex-row min-h-screen relative pb-20">
      <div className="w-1/6 p-4 bg-[#ECF5FD] flex flex-col justify-between fixed h-full" style={{ fontFamily: 'Open Sans, sans-serif' }}>
        <div>
          <Link href="/">
            <a className="text-3xl font-extrabold mb-4 text-center block transition-all duration-300 hover:text-[#6CB6EF]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', letterSpacing: '-1px', color: 'black' }}>Think-Graph</a>
          </Link>
          <div className="mb-4 relative">
            <input 
              type="text" 
              placeholder="Just Ask..." 
              className="w-full p-4 border-2 border-gray-300 rounded-full outline-none text-xl hover:border-gray-400 focus:border-gray-500 transition-all duration-300 cursor-pointer"
              onClick={() => setShowLargeSearch(true)}
              readOnly
            />
          </div>
          <Link href="/">
            <a className="block bg-[#ECF5FD] text-center p-2 rounded hover:bg-[#B6DBF7] transition duration-300 text-xl font-medium text-gray-600">🏠 Homepage</a>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/about">
              <a className="block bg-[#ECF5FD] text-center p-2 rounded hover:bg-[#B6DBF7] transition duration-300 text-2xl font-medium text-gray-600">🪐</a>
            </Link>
            <span className="text-xs ml-2">We are hiring</span>
          </div>
          <div className="text-gray-400 mx-2">|</div>
          <div className="flex items-center">
            <a href="https://discord.gg/G66pESH3gm" target="_blank" rel="noopener noreferrer" className="block bg-[#ECF5FD] text-center p-2 rounded hover:bg-[#B6DBF7] transition duration-300 text-2xl font-medium text-gray-600">
            🍻
            </a>
            <span className="text-xs ml-2">Join our discord</span>
          </div>
        </div>
      </div>
      <div className="w-5/6 p-4 ml-[16.666667%] overflow-y-auto mb-16">
        <div className="flex">
          <div className="w-3/4 pr-4">
            <div className="mb-4">
              <h3 className="result-title text-4xl mb-2 text-center">🧠Knowledge Graph</h3>
              {loading || expandingNode ? (
                <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
              ) : graphError ? (
                <p className="text-red-500">{graphError}</p>
              ) : knowledgeGraphData ? (
                <div style={{ height: '600px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <KnowledgeGraph 
                    data={knowledgeGraphData} 
                    onNodeClick={handleNodeClick}
                    onNodeDragStop={handleNodeDragStop}
                  />
                </div>
              ) : (
                <p>没有可用的知识图谱数据</p>
              )}
              <div className="flex justify-center mt-4">
                <button 
                  onClick={handleUndo} 
                  disabled={graphHistory.length === 0}
                  className="text-2xl opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30 mr-2"
                  title="撤销上一步"
                >
                  ↩️
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={graphFuture.length === 0}
                  className="text-2xl opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30"
                  title="重做下一步"
                >
                  ↪️
                </button>
              </div>
            </div>
          </div>
          <div className="w-1/4 p-4 bg-white">
            <div className="result-item mb-4">
              <h3 className="result-title text-4xl">📝Answer</h3>
              <p className="text-xs text-gray-500 text-center mb-2">搜集了 {searchResults.length} 个网页</p>
              <div className="min-h-40 p-4">
                {loading ? (
                  <div className="h-full bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div 
                    className="result-snippet prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedAnswer }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLargeSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl p-4">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center border border-gray-300 transition-all duration-300 relative" style={{ height: '8rem' }}>
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowLargeSearch(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <input 
                type="text" 
                placeholder="Just ask..." 
                className="w-full p-4 border-none outline-none text-xl pl-16"
                value={largeSearchQuery}
                onChange={handleLargeSearchChange}
                onKeyPress={handleLargeSearchKeyPress}
                autoFocus
              />
              <button 
                className="bg-[#105C93] text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-4 hover:bg-[#3A86C8] transition duration-300" 
                style={{ top: 'calc(50% - 1.5rem)' }}
                onClick={handleLargeSearch}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white p-2 rounded-lg shadow-md flex items-center border-2 border-gray-300 transition-all duration-300" style={{ height: '4rem' }}>
          <input 
            type="text" 
            placeholder={defaultQuery}
            className="w-full p-2 border-none outline-none text-xl"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="bg-[#105C93] text-white rounded-full h-10 w-10 flex items-center justify-center absolute right-4 hover:bg-[#3A86C8] transition duration-300" 
            onClick={handleButtonClick}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </div>
  );
}