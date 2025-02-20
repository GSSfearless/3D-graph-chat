import React, { useEffect, useRef, useState } from 'react';
import { AdvancedChartRenderer } from '../utils/advanced-charts';
import '../styles/chart.css';

const EnhancedChart = ({ chartData, type, onNodeClick, onChartUpdate }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      rendererRef.current = new AdvancedChartRenderer(containerRef.current);
    }

    // 监听窗口大小变化
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current && chartData) {
      renderChart();
    }
  }, [chartData, type]);

  const renderChart = async () => {
    try {
      setIsLoading(true);
      const renderer = rendererRef.current;
      
      // 根据类型渲染不同图表
      switch (type) {
        case 'tagSphere':
          renderer.render3DTagSphere(chartData);
          break;
        case 'fluid':
          renderer.renderFluidChart(chartData);
          break;
        case 'radar':
          renderer.renderAdvancedRadar(chartData);
          break;
        case 'geoBubble':
          renderer.renderGeoBubble(chartData);
          break;
        case 'network':
          renderer.renderNetworkGraph(chartData);
          break;
        case 'waveform':
          renderer.renderWaveform(chartData);
          break;
        default:
          console.warn(`未知的图表类型: ${type}`);
      }
      
      // 触发更新回调
      onChartUpdate && onChartUpdate(chartData);
    } catch (error) {
      console.error('渲染图表失败:', error);
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
    <div className="enhanced-chart-wrapper">
      <div className="chart-toolbar">
        <button onClick={handleFullscreen} disabled={isLoading}>
          全屏显示
        </button>
      </div>
      <div className="chart-container" ref={containerRef}>
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChart; 