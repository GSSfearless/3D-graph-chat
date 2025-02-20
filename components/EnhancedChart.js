import React, { useEffect, useRef, useState } from 'react';
import { ChartRenderer, defaultTheme } from '../utils/chart-renderer';
import { ChartProcessor } from '../utils/chart-processor';
import '../styles/chart.css';

const EnhancedChart = ({ chartData, type, onNodeClick, onChartUpdate }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const processorRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      rendererRef.current = new ChartRenderer(containerRef.current);
      processorRef.current = new ChartProcessor();
      
      // 设置事件处理
      rendererRef.current.onNodeSelect = (node) => {
        onNodeClick && onNodeClick(node);
      };
    }
  }, []);

  useEffect(() => {
    if (rendererRef.current && chartData) {
      renderChart();
    }
  }, [chartData, type, currentTheme]);

  const renderChart = async () => {
    try {
      setIsLoading(true);
      const renderer = rendererRef.current;
      const processor = processorRef.current;
      
      // 显示加载动画
      renderer.showLoading();
      
      // 清除现有内容
      containerRef.current.innerHTML = '';
      
      // 处理数据
      const processedData = await processor.process({
        type,
        data: chartData,
        style: { theme: currentTheme }
      });
      
      // 根据类型渲染不同图表
      switch (processedData.type) {
        case 'mindmap':
          renderer.renderMindMap(processedData.data);
          break;
        case 'flowchart':
          renderer.renderFlowChart(processedData.data);
          break;
        case 'timeline':
          renderer.renderTimeline(processedData.data);
          break;
        case 'comparison':
          renderer.renderComparison(processedData.data);
          break;
        case 'hierarchy':
          renderer.renderHierarchy(processedData.data);
          break;
        case 'error':
          console.error(processedData.data.message);
          // 显示错误状态
          break;
        default:
          console.warn(`未知的图表类型: ${processedData.type}`);
      }

      // 应用主题
      renderer.applyTheme(currentTheme);
      
      // 自动适应屏幕
      renderer.zoomToFit();
      
      // 触发更新回调
      onChartUpdate && onChartUpdate(processedData);
    } catch (error) {
      console.error('渲染图表失败:', error);
    } finally {
      // 隐藏加载动画
      rendererRef.current.hideLoading();
      setIsLoading(false);
    }
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
    
    // 更新主题
    setCurrentTheme(themes[themeName]);
    
    // 更新数据主题属性
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const imageUrl = await rendererRef.current.exportToImage();
      const link = document.createElement('a');
      link.download = `chart-${type}-${Date.now()}.svg`;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      console.error('导出图表失败:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="enhanced-chart-wrapper" data-theme={currentTheme}>
      <div className="chart-toolbar">
        <select 
          onChange={(e) => handleThemeChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="light">浅色主题</option>
          <option value="dark">深色主题</option>
          <option value="nature">自然主题</option>
        </select>
        <button onClick={handleExport} disabled={isLoading}>
          导出SVG
        </button>
        <button onClick={handleFullscreen} disabled={isLoading}>
          全屏显示
        </button>
        <button 
          onClick={() => rendererRef.current.zoomToFit()} 
          disabled={isLoading}
        >
          适应屏幕
        </button>
      </div>
      <div className="chart-container" ref={containerRef}></div>
    </div>
  );
};

export default EnhancedChart; 