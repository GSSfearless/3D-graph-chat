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
        curve: 'linear',
        defaultRenderer: 'dagre-d3'
      },
      themeVariables: {
        fontFamily: 'Arial',
        fontSize: '16px',
        primaryColor: '#4299E1',
        primaryTextColor: '#2D3748',
        primaryBorderColor: '#4299E1',
        lineColor: '#64748B',
        secondaryColor: '#9F7AEA',
        tertiaryColor: '#48BB78'
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
          } catch (error) {
            console.error('Error rendering mermaid diagram:', error);
            // 如果渲染失败，显示错误信息
            mermaidRef.current.innerHTML = `
              <div class="p-4 text-red-500 bg-red-50 rounded-lg">
                <p class="font-bold">图表渲染失败</p>
                <p class="text-sm mt-2">${error.message}</p>
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
                <p className="text-gray-500">正在生成思维导图...</p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div
              ref={mermaidRef}
              className="mermaid-diagram w-full"
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