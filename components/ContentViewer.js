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
      logLevel: 'debug',
      maxTextSize: 5000,
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
        padding: 30,
        useMaxWidth: true,
        nodeSpacing: 120,
        rankSpacing: 150,
        diagramPadding: 30,
        defaultRenderer: 'elk',
        curve: 'basis',
        levelDistance: 180
      },
      themeVariables: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        primaryColor: '#3b82f6',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#3b82f6',
        lineColor: '#94a3b8',
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
        mindmapNode: 'transparent',
        mindmapNodeText: '#1e293b',
        mindmapLine: '#64748b',
        mindmapOutline: 'none',
        mindmapBorder: 'none'
      }
    });
  }, []);

  useEffect(() => {
    const renderMermaid = async () => {
      if (type === 'mermaid' && mermaidRef.current) {
        setIsLoading(true);
        try {
          mermaidRef.current.innerHTML = '';
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          tempContainer.className = 'mermaid';
          tempContainer.textContent = content;
          mermaidRef.current.appendChild(tempContainer);

          // 直接调用render，不再重新初始化
          const { svg } = await mermaid.render(id, content);
          setMermaidSvg(svg);
        } catch (error) {
          console.error('Mermaid渲染错误:', error);
          mermaidRef.current.innerHTML = `
            <div class="p-4 text-red-500 bg-red-50 rounded-lg">
              <p class="font-bold">图表渲染失败</p>
              <p class="text-sm mt-2">${error.message}</p>
            </div>
          `;
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('跳过Mermaid渲染:', {
          type,
          hasContent: !!content,
          contentLength: content?.length,
          contentValue: content,
          hasRef: !!mermaidRef.current
        });
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
        if (!content) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-400 mb-2">暂无图表数据</p>
                <p className="text-sm text-gray-400">请确保AI回答中包含了图表信息</p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-auto p-4">
              <div className="flex items-center justify-center min-w-full min-h-full">
                <div
                  ref={mermaidRef}
                  className="mermaid-diagram bg-white"
                  style={{ 
                    width: 'fit-content',
                    minWidth: '80%',
                    maxWidth: '95%',
                    height: 'fit-content',
                    minHeight: '80%',
                    maxHeight: '95%'
                  }}
                  dangerouslySetInnerHTML={mermaidSvg ? { __html: mermaidSvg } : undefined}
                />
              </div>
            </div>
          </div>
        );
      default:
        return <div>不支持的内容类型</div>;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
};

export default ContentViewer; 