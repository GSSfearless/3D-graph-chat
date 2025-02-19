import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import mermaid from 'mermaid';

// 动态导入 ECharts，避免 SSR 问题
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <div>Loading Chart...</div>
});

const ChartViewer = ({ data, type }) => {
  const mermaidRef = useRef(null);
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 初始化 mermaid 配置
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true },
      gantt: { fontSize: 14 },
      sequence: { useMaxWidth: true },
      journey: { useMaxWidth: true }
    });
  }, []);

  // 处理 Mermaid 图表渲染
  useEffect(() => {
    const renderMermaid = async () => {
      if (type.startsWith('mermaid-') && data && mermaidRef.current) {
        setIsLoading(true);
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          mermaidRef.current.innerHTML = '';
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          tempContainer.className = 'mermaid';
          tempContainer.textContent = data;
          mermaidRef.current.appendChild(tempContainer);

          const { svg } = await mermaid.render(id, data);
          setMermaidSvg(svg);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          mermaidRef.current.innerHTML = `
            <div class="p-4 text-red-500 bg-red-50 rounded-lg">
              <p class="font-bold">图表渲染失败</p>
              <p class="text-sm mt-2">${error.message}</p>
            </div>
          `;
        } finally {
          setIsLoading(false);
        }
      }
    };

    renderMermaid();
  }, [data, type]);

  // 生成 ECharts 配置
  const getEChartsOption = (data, type) => {
    switch (type) {
      case 'pie':
        return {
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: '60%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };
      case 'bar':
        return {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.xAxis },
          yAxis: { type: 'value' },
          series: [{
            type: 'bar',
            data: data.series
          }]
        };
      case 'line':
        return {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.xAxis },
          yAxis: { type: 'value' },
          series: [{
            type: 'line',
            data: data.series,
            smooth: true
          }]
        };
      default:
        return {};
    }
  };

  const renderChart = () => {
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

    // Mermaid 图表
    if (type.startsWith('mermaid-')) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div
            ref={mermaidRef}
            className="mermaid-diagram w-full"
            dangerouslySetInnerHTML={mermaidSvg ? { __html: mermaidSvg } : undefined}
          />
        </div>
      );
    }

    // ECharts 图表
    if (['pie', 'bar', 'line'].includes(type)) {
      return (
        <ReactECharts
          option={getEChartsOption(data, type)}
          style={{ height: '400px', width: '100%' }}
          className="echarts-chart"
        />
      );
    }

    return <div>不支持的图表类型</div>;
  };

  return (
    <div className="w-full h-full overflow-auto p-4 bg-white rounded-lg shadow">
      {renderChart()}
    </div>
  );
};

export default ChartViewer; 