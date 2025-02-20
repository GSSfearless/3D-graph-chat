import React, { useEffect, useRef } from 'react';
import { ChartEnhancer, chartStyles } from '../utils/chart-enhancer';

const EnhancedChart = ({ chartData, type }) => {
  const containerRef = useRef(null);
  const enhancerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !enhancerRef.current) {
      enhancerRef.current = new ChartEnhancer(containerRef.current);
      enhancerRef.current.init();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && chartData) {
      // 根据不同的图表类型渲染不同的图表
      switch (type) {
        case 'mindmap':
          renderMindMap(chartData);
          break;
        case 'flowchart':
          renderFlowChart(chartData);
          break;
        case 'fishbone':
          renderFishbone(chartData);
          break;
        // ... 其他图表类型
      }
      
      // 优化布局
      enhancerRef.current.optimizeLayout();
    }
  }, [chartData, type]);

  const renderMindMap = (data) => {
    // 使用 D3.js 或其他库实现思维导图渲染
  };

  const renderFlowChart = (data) => {
    // 使用 D3.js 或其他库实现流程图渲染
  };

  const renderFishbone = (data) => {
    // 使用 D3.js 或其他库实现鱼骨图渲染
  };

  return (
    <div className="enhanced-chart-wrapper">
      <style jsx global>{chartStyles}</style>
      <div className="chart-container" ref={containerRef}></div>
      <div className="chart-toolbar">
        <button onClick={() => enhancerRef.current.resetZoom()}>重置缩放</button>
        <button onClick={() => enhancerRef.current.autoLayout()}>自动布局</button>
        <button onClick={() => enhancerRef.current.toggleFullscreen()}>全屏</button>
      </div>
    </div>
  );
};

export default EnhancedChart; 