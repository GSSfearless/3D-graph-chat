import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

const ContentViewer = ({ content, type }) => {
  const mermaidRef = useRef(null);
  const [mermaidSvg, setMermaidSvg] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  useEffect(() => {
    const renderMermaid = async () => {
      if (type === 'mermaid' && content && mermaidRef.current) {
        try {
          // 清除之前的内容
          mermaidRef.current.innerHTML = '';
          
          // 生成唯一ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // 创建一个临时容器
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          mermaidRef.current.appendChild(tempContainer);

          // 渲染新图表
          const { svg } = await mermaid.render(id, content);
          setMermaidSvg(svg);
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          mermaidRef.current.innerHTML = '图表渲染失败';
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