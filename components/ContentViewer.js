import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { ChartParser, updateCharts } from '../utils/chart-parser';

const ContentViewer = ({ content, type }) => {
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charts, setCharts] = useState({ flowchart: '', mindmap: '' });
  const parser = useRef(new ChartParser());
  const flowchartRef = useRef(null);
  const mindmapRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    if (content) {
      // 更新图表
      const newCharts = updateCharts(parser.current, content);
      setCharts(newCharts);

      // 渲染图表
      if (flowchartRef.current && newCharts.flowchart) {
        mermaid.render('flowchart-svg', newCharts.flowchart)
          .then(({ svg }) => {
            flowchartRef.current.innerHTML = svg;
          })
          .catch(console.error);
      }

      if (mindmapRef.current && newCharts.mindmap) {
        mermaid.render('mindmap-svg', newCharts.mindmap)
          .then(({ svg }) => {
            mindmapRef.current.innerHTML = svg;
          })
          .catch(console.error);
      }
    }
  }, [content]);

  const renderContent = () => {
    switch (type) {
      case 'markdown':
        return (
          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        );
      case 'mermaid':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">正在生成思维导图...</p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div
              ref={flowchartRef}
              className="mermaid-chart w-full"
              dangerouslySetInnerHTML={charts.flowchart ? { __html: charts.flowchart } : undefined}
            />
          </div>
        );
      default:
        return <div>不支持的内容类型</div>;
    }
  };

  return (
    <div className="content-viewer">
      <div className="markdown-content">
        {renderContent()}
      </div>
      
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>流程图</h3>
          <div ref={flowchartRef} className="mermaid-chart" />
        </div>
        <div className="chart-wrapper">
          <h3>思维导图</h3>
          <div ref={mindmapRef} className="mermaid-chart" />
        </div>
      </div>

      <style jsx>{`
        .content-viewer {
          display: flex;
          gap: 2rem;
        }
        
        .markdown-content {
          flex: 1;
          min-width: 0;
        }
        
        .charts-container {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .chart-wrapper {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
        }
        
        .mermaid-chart {
          width: 100%;
          overflow: auto;
        }
        
        h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default ContentViewer; 