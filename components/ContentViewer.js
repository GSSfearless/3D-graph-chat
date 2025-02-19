import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

const ContentViewer = ({ content, type }) => {
  const mermaidRef = useRef(null);
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Markdown 自定义组件
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isCodeBlock = !inline && match;
      
      if (isCodeBlock) {
        // 如果是代码块，添加特殊样式
        return (
          <div className="relative">
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              {match[1]}
            </div>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      // 如果是行内代码
      return (
        <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props}>
          {children}
        </code>
      );
    },
    // 自定义其他 Markdown 元素的样式
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-gray-900">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-medium mb-3 text-gray-700">{children}</h3>,
    p: ({ children }) => <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 pl-6 list-disc text-gray-600">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal text-gray-600">{children}</ol>,
    li: ({ children }) => <li className="mb-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-200 pl-4 my-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  };

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
        rankSpacing: 50
      },
      mindmap: {
        padding: 20,
        useMaxWidth: true,
        nodeSpacing: 100,
        rankSpacing: 80
      },
      themeVariables: {
        fontFamily: 'Arial',
        fontSize: '16px',
        primaryColor: '#4299E1',
        primaryTextColor: '#2D3748',
        primaryBorderColor: '#4299E1',
        lineColor: '#64748B',
        secondaryColor: '#9F7AEA',
        tertiaryColor: '#48BB78',
        // 思维导图特定样式
        mindmapTitleColor: '#2D3748',
        mindmapLinkColor: '#64748B',
        mindmapNode: '#4299E1',
        mindmapNodeText: '#FFFFFF',
        mindmapSelectedNode: '#9F7AEA'
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
                <pre class="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">${content}</pre>
              </div>
            `;
          }
        } catch (error) {
          console.error('Mermaid initialization error:', error);
          mermaidRef.current.innerHTML = `
            <div class="p-4 text-red-500 bg-red-50 rounded-lg">
              <p class="font-bold">图表初始化失败</p>
              <p class="text-sm mt-2">${error.message}</p>
            </div>
          `;
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
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={components}
            >
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