import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

const ContentViewer = ({ content, type }) => {
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 初始化 mermaid 配置
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
        useMaxWidth: true
      },
      mindmap: {
        padding: 20,
        nodeSpacing: 60,
        rankSpacing: 100
      },
      sequence: {
        useMaxWidth: true,
        boxMargin: 10
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
      if (type === 'mermaid' && content) {
        setIsLoading(true);
        setError(null);
        
        try {
          // 生成唯一ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // 渲染图表
          const { svg } = await mermaid.render(id, content);
          setMermaidSvg(svg);
          console.log('✅ 图表渲染成功');
        } catch (err) {
          console.error('图表渲染失败:', err);
          setError({
            message: err.message,
            code: content
          });
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
        
        if (error) {
          return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
              <p className="font-bold">图表渲染失败</p>
              <p className="text-sm mt-2">{error.message}</p>
              <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">
                {error.code}
              </pre>
            </div>
          );
        }

        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div 
              className="mermaid-diagram max-w-full overflow-auto"
              dangerouslySetInnerHTML={{ __html: mermaidSvg }}
            />
          </div>
        );
      default:
        return <div>不支持的内容类型</div>;
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-white rounded-lg shadow">
      {renderContent()}
    </div>
  );
};

export default ContentViewer; 