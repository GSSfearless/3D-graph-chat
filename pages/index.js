import { faArrowRight, faBrain, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState } from 'react';
import 'tailwindcss/tailwind.css';
import KnowledgeGraph from '../components/KnowledgeGraph';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rag-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('搜索请求失败');
      }
      
      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    console.log('节点被点击:', node);
  };

  const handleMultiNodeSearch = async (nodes) => {
    const nodeLabels = nodes.map(node => node.label).join(' ');
    await handleSearch(nodeLabels);
  };

  return (
    <div className="container">
      <header>
        <h1>Think Graph</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="输入关键词开始探索..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e.target.value);
              }
            }}
          />
        </div>
      </header>

      <main>
        {loading && <div className="loading">正在加载...</div>}
        {error && <div className="error">{error}</div>}
        {graphData && (
          <KnowledgeGraph
            data={graphData}
            onNodeClick={handleNodeClick}
            onSearch={handleMultiNodeSearch}
            style={{ height: 'calc(100vh - 100px)' }}
          />
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
        }

        header {
          padding: 1rem 0;
          text-align: center;
        }

        h1 {
          margin: 0;
          font-size: 2rem;
          color: #2d3748;
        }

        .search-box {
          margin: 1rem auto;
          max-width: 600px;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s;
        }

        .search-box input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        main {
          position: relative;
        }

        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #4f46e5;
          font-size: 1.2rem;
        }

        .error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ef4444;
          font-size: 1.2rem;
          text-align: center;
          background: #fee2e2;
          padding: 1rem;
          border-radius: 8px;
          max-width: 80%;
        }
      `}</style>
    </div>
  );
}

