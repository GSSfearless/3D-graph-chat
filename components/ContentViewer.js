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
      timeline: {
        useMaxWidth: true,
        padding: 30,
        nodeSpacing: 100,
        rankSpacing: 100,
        diagramPadding: 30,
        defaultRenderer: 'elk',
        curve: 'basis'
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
        
        // 思维导图样式
        mindmapNode: 'transparent',
        mindmapNodeText: '#334155',
        mindmapLine: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
        mindmapOutline: 'none',
        mindmapBorder: 'none',
        
        // 概念图样式
        conceptNode: '#f3e8ff',
        conceptNodeText: '#6b21a8',
        conceptLine: '#9333ea',
        conceptBorder: '#d8b4fe',
        
        // 对比图样式
        comparisonNode: '#e0e7ff',
        comparisonNodeText: '#3730a3',
        comparisonLine: '#6366f1',
        comparisonBorder: '#a5b4fc',
        
        // 时间轴样式
        timelineNode: '#fce7f3',
        timelineNodeText: '#831843',
        timelineLine: '#db2777',
        timelineBorder: '#f9a8d4',
        
        // 层级图样式
        orgchartNode: '#dcfce7',
        orgchartNodeText: '#14532d',
        orgchartLine: '#22c55e',
        orgchartBorder: '#86efac',
        
        // 分类图样式
        bracketNode: '#fef9c3',
        bracketNodeText: '#713f12',
        bracketLine: '#ca8a04',
        bracketBorder: '#fde047'
      }
    });
  }, []);

  useEffect(() => {
    const renderMermaid = async () => {
      if (type === 'mermaid' && mermaidRef.current) {
        setIsLoading(true);
        console.log('Starting to render Mermaid chart...');
        console.log('Chart type:', type);
        console.log('Chart content:', content);
        
        if (!content) {
          console.log('No chart content, showing empty state');
          setIsLoading(false);
          return;
        }

        try {
          // Clear previous content
          mermaidRef.current.innerHTML = '';
          
          // Generate unique ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          console.log('Chart ID:', id);
          
          // Create a temporary container
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          tempContainer.className = 'mermaid';
          tempContainer.textContent = content;
          mermaidRef.current.appendChild(tempContainer);

          try {
            // Try rendering
            console.log('Calling mermaid.render, content:', content);
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
            console.log('Mermaid rendering successful, SVG length:', svg.length);
            setMermaidSvg(svg);
            console.log('✅ Mermaid chart rendering successful');
          } catch (error) {
            console.error('Mermaid rendering error:', error);
            console.error('Problem content:', content);
            mermaidRef.current.innerHTML = `
              <div class="p-4 text-red-500 bg-red-50 rounded-lg">
                <p class="font-bold">Chart rendering failed</p>
                <p class="text-sm mt-2">${error.message}</p>
                <pre class="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">${content}</pre>
              </div>
            `;
          }
        } catch (error) {
          console.error('Mermaid initialization error:', error);
          mermaidRef.current.innerHTML = `
            <div class="p-4 text-red-500 bg-red-50 rounded-lg">
              <p class="font-bold">Chart initialization failed</p>
              <p class="text-sm mt-2">${error.message}</p>
            </div>
          `;
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('Skipping Mermaid render:', {
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
                <p className="text-gray-500">Generating chart...</p>
              </div>
            </div>
          );
        }
        if (!content) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-400 mb-2">No chart data available</p>
                <p className="text-sm text-gray-400">Please ensure AI response includes chart information</p>
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
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
};

export default ContentViewer; 