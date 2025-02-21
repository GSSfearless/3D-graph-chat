import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AdvancedChartRenderer } from '../utils/advanced-charts';
import ChartSelector from './ChartSelector';
import '../styles/chart.css';

const defaultData = {
  tagSphere: {
    tags: [
      { text: "React", size: 100, color: "#61dafb" },
      { text: "Vue", size: 80, color: "#42b883" },
      { text: "Angular", size: 70, color: "#dd1b16" },
      { text: "Node.js", size: 90, color: "#3c873a" },
      { text: "TypeScript", size: 85, color: "#007acc" },
      { text: "Python", size: 75, color: "#3776ab" }
    ]
  },
  fluid: {
    points: Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      value: Math.random() * 100,
      size: Math.random() * 20 + 10
    })),
    links: []
  },
  radar: {
    indicators: [
      { name: "性能", max: 100 },
      { name: "安全性", max: 100 },
      { name: "易用性", max: 100 },
      { name: "可靠性", max: 100 },
      { name: "扩展性", max: 100 }
    ],
    series: [
      {
        name: "产品A",
        values: [90, 85, 95, 80, 88]
      },
      {
        name: "产品B",
        values: [85, 90, 80, 95, 85]
      }
    ]
  },
  geoBubble: {
    points: [
      { name: "北京", coordinates: [116.4074, 39.9042], value: 100 },
      { name: "上海", coordinates: [121.4737, 31.2304], value: 90 },
      { name: "广州", coordinates: [113.2644, 23.1291], value: 80 },
      { name: "深圳", coordinates: [114.0579, 22.5431], value: 85 }
    ]
  },
  network: {
    nodes: [
      { name: "中心节点", value: 100, size: 30, category: 0 },
      { name: "节点A", value: 70, size: 20, category: 1 },
      { name: "节点B", value: 60, size: 20, category: 1 },
      { name: "节点C", value: 50, size: 20, category: 2 }
    ],
    edges: [
      { source: "中心节点", target: "节点A", value: 1 },
      { source: "中心节点", target: "节点B", value: 1 },
      { source: "节点A", target: "节点C", value: 1 }
    ],
    categories: [
      { name: "核心" },
      { name: "一级" },
      { name: "二级" }
    ]
  },
  waveform: {
    values: Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 50 + Math.random() * 10
    ),
    timestamps: Array.from({ length: 100 }, (_, i) => i)
  }
};

const EnhancedChart = ({ chartData = defaultData, initialType = 'tagSphere', onNodeClick, onChartUpdate }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState(initialType);

  const renderChart = useCallback(async () => {
    try {
      setIsLoading(true);
      const renderer = rendererRef.current;
      const data = chartData[chartType] || defaultData[chartType];
      
      // 根据类型渲染不同图表
      switch (chartType) {
        case 'tagSphere':
          renderer.render3DTagSphere(data);
          break;
        case 'fluid':
          renderer.renderFluidChart(data);
          break;
        case 'radar':
          renderer.renderAdvancedRadar(data);
          break;
        case 'geoBubble':
          renderer.renderGeoBubble(data);
          break;
        case 'network':
          renderer.renderNetworkGraph(data);
          break;
        case 'waveform':
          renderer.renderWaveform(data);
          break;
        default:
          console.warn(`未知的图表类型: ${chartType}`);
      }
      
      // 触发更新回调
      onChartUpdate && onChartUpdate(data);
    } catch (error) {
      console.error('渲染图表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chartType, chartData, onChartUpdate]);

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
    if (rendererRef.current) {
      renderChart();
    }
  }, [chartType, chartData, renderChart]);

  const handleChartTypeChange = (type) => {
    setChartType(type);
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
      <ChartSelector onSelect={handleChartTypeChange} currentType={chartType} />
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