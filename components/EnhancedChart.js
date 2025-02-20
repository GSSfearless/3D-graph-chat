import React, { useEffect, useRef, useState } from 'react';
import { ChartRenderer, defaultTheme } from '../utils/chart-renderer';
import { ChartEnhancer } from '../utils/chart-enhancer';

const EnhancedChart = ({ chartData, type, onNodeClick, onChartUpdate }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const enhancerRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      rendererRef.current = new ChartRenderer(containerRef.current);
      enhancerRef.current = new ChartEnhancer(containerRef.current);
      enhancerRef.current.init();
    }
  }, []);

  useEffect(() => {
    if (rendererRef.current && chartData) {
      renderChart();
    }
  }, [chartData, type, currentTheme]);

  const renderChart = () => {
    const renderer = rendererRef.current;
    
    // 清除现有内容
    containerRef.current.innerHTML = '';
    
    // 根据类型渲染不同图表
    switch (type) {
      case 'mindmap':
        renderer.renderMindMap(chartData);
        break;
      case 'flowchart':
        renderer.renderFlowChart(chartData);
        break;
      case 'timeline':
        renderer.renderTimeline(chartData);
        break;
      case 'comparison':
        renderer.renderComparison(chartData);
        break;
      case 'hierarchy':
        renderer.renderHierarchy(chartData);
        break;
      default:
        console.warn(`未知的图表类型: ${type}`);
    }

    // 应用主题
    renderer.applyTheme(currentTheme);
    
    // 优化布局
    enhancerRef.current.optimizeLayout();
  };

  const handleThemeChange = (themeName) => {
    const themes = {
      light: defaultTheme,
      dark: {
        nodeBg: '#2d2d2d',
        nodeBorder: '#61dafb',
        textColor: '#ffffff',
        linkColor: '#888888',
        highlightColor: '#ff4081'
      },
      nature: {
        nodeBg: '#f0f7f4',
        nodeBorder: '#68b587',
        textColor: '#2c4a3e',
        linkColor: '#5a9178',
        highlightColor: '#e67e22'
      }
    };
    setCurrentTheme(themes[themeName]);
  };

  const handleExport = async () => {
    const imageUrl = rendererRef.current.exportToImage();
    const link = document.createElement('a');
    link.download = `chart-${type}-${Date.now()}.svg`;
    link.href = imageUrl;
    link.click();
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="enhanced-chart-wrapper">
      <div className="chart-toolbar">
        <select onChange={(e) => handleThemeChange(e.target.value)}>
          <option value="light">浅色主题</option>
          <option value="dark">深色主题</option>
          <option value="nature">自然主题</option>
        </select>
        <button onClick={handleExport}>导出SVG</button>
        <button onClick={handleFullscreen}>全屏显示</button>
        <button onClick={() => rendererRef.current.zoomToFit()}>适应屏幕</button>
      </div>
      <div className="chart-container" ref={containerRef}></div>
      <style jsx>{`
        .enhanced-chart-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 500px;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .chart-toolbar {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }
        
        .chart-toolbar select,
        .chart-toolbar button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .chart-toolbar button:hover {
          background: #f5f5f5;
        }
        
        .chart-container {
          width: 100%;
          height: 100%;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default EnhancedChart; 