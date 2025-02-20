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
        curve: 'monotoneX',
        defaultRenderer: 'elk',
        padding: 30,
        nodeSpacing: 80,
        rankSpacing: 100,
        diagramPadding: 30,
        labelBackgroundColor: 'transparent',
        nodeAlignment: 'center',
        ranker: 'network-simplex',
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
        // 思维导图特定样式 - 采用简洁的蓝色系
        mindmapNode: 'transparent',
        mindmapNodeText: '#334155',  // 深灰蓝色文字
        mindmapLine: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],  // 蓝色渐变
        mindmapOutline: 'none',
        mindmapBorder: 'none'
      }
    });
  }, []);

  useEffect(() => {
    const renderMermaid = async () => {
      if (type === 'mermaid' && mermaidRef.current) {
        setIsLoading(true);
        console.log('开始渲染Mermaid图表...');
        console.log('图表类型:', type);
        console.log('图表内容:', content);
        
        if (!content) {
          console.log('没有图表内容，显示空状态');
          setIsLoading(false);
          return;
        }

        try {
          // 清除之前的内容
          mermaidRef.current.innerHTML = '';
          
          // 生成唯一ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          console.log('图表ID:', id);
          
          // 创建一个临时容器
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          tempContainer.className = 'mermaid';
          tempContainer.textContent = content;
          mermaidRef.current.appendChild(tempContainer);

          try {
            // 尝试渲染
            console.log('调用mermaid.render，内容:', content);
            await mermaid.initialize({
              startOnLoad: true,
              theme: 'default',
              securityLevel: 'loose',
              logLevel: 'debug',
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
              }
            });
            
            const { svg } = await mermaid.render(id, content);
            console.log('Mermaid渲染成功，SVG长度:', svg.length);
            setMermaidSvg(svg);
            console.log('✅ Mermaid 图表渲染成功');
          } catch (error) {
            console.error('Mermaid渲染错误:', error);
            console.error('问题内容:', content);
            mermaidRef.current.innerHTML = `
              <div class="p-4 text-red-500 bg-red-50 rounded-lg">
                <p class="font-bold">图表渲染失败</p>
                <p class="text-sm mt-2">${error.message}</p>
                <pre class="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">${content}</pre>
              </div>
            `;
          }
        } catch (error) {
          console.error('Mermaid初始化错误:', error);
          mermaidRef.current.innerHTML = `
            <div class="p-4 text-red-500 bg-red-50 rounded-lg">
              <p class="font-bold">图表初始化失败</p>
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
          <div className="w-full h-full flex items-center justify-center p-4">
            <div
              ref={mermaidRef}
              className="mermaid-diagram w-full mx-auto bg-white overflow-auto"
              style={{ 
                height: 'calc(100vh - 16rem)',
                minWidth: '800px',
                minHeight: '600px'
              }}
              dangerouslySetInnerHTML={mermaidSvg ? { __html: mermaidSvg } : undefined}
            />
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