import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

const ContentViewer = ({ content, type }) => {
  const mermaidRef = useRef(null);
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        defaultRenderer: 'dagre-d3',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
        diagramPadding: 8,
        labelBackgroundColor: '#f0f7ff',
        nodeAlignment: 'center'
      },
      mindmap: {
        padding: 16,
        useMaxWidth: true,
        nodeSpacing: 60,
        rankSpacing: 80,
        diagramPadding: 10,
        defaultRenderer: 'dagre-d3',
        curve: 'bump',
        levelDistance: 100
      },
      themeVariables: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        primaryColor: '#3b82f6',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        secondaryColor: '#7c3aed',
        tertiaryColor: '#059669',
        // 流程图特定样式
        nodeBorder: '#e2e8f0',
        nodeTextColor: '#1e293b',
        mainBkg: '#ffffff',
        nodeBkg: '#f8fafc',
        // 连接线样式
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#f1f5f9',
        clusterBorder: '#e2e8f0',
        // 思维导图特定样式
        mindmapNode: '#f0f9ff',
        mindmapNodeText: '#0f172a',
        mindmapLine: '#93c5fd',
        mindmapOutline: '#3b82f6',
        mindmapBorder: '#bfdbfe'
      }
    });
  }, []);

  useEffect(() => {
    const renderMermaid = async () => {
      if (type === 'mermaid' && content && mermaidRef.current) {
        setIsLoading(true);
        try {
          // 清除之前的内容
          mermaidRef.current.innerHTML = '';
          
          // 生成唯一ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // 创建一个临时容器
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          tempContainer.className = 'mermaid';
          tempContainer.textContent = content;
          mermaidRef.current.appendChild(tempContainer);

          try {
            // 尝试渲染
            const { svg } = await mermaid.render(id, content);
            setMermaidSvg(svg);
            console.log('✅ Mermaid 图表渲染成功');
          } catch (error) {
            console.error('Error rendering mermaid diagram:', error);
            mermaidRef.current.innerHTML = `
              <div class="p-4 text-red-500 bg-red-50 rounded-lg">
                <p class="font-bold">图表渲染失败</p>
                <p class="text-sm mt-2">${error.message}</p>
                <pre class="text-xs mt-2 p-2 bg-red-100 rounded">${content}</pre>
              </div>
            `;
          }
        } catch (error) {
          console.error('Error in mermaid setup:', error);
          mermaidRef.current.innerHTML = '图表初始化失败';
        } finally {
          setIsLoading(false);
        }
      }
    };

    renderMermaid();
  }, [content, type]);

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
                <p className="text-gray-500">正在生成图表...</p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div
              ref={mermaidRef}
              className="mermaid-diagram w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-6"
              dangerouslySetInnerHTML={mermaidSvg ? { __html: mermaidSvg } : undefined}
            />
          </div>
        );
      default:
        return <div>不支持的内容类型</div>;
    }
  };

  return (
    <div className="w-full h-full overflow-auto p-4 bg-white rounded-lg shadow">
      {renderContent()}
    </div>
  );
};

export default ContentViewer; 