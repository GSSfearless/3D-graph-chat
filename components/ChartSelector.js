import React from 'react';

const chartTypes = [
  {
    id: 'tagSphere',
    name: '3D标签云',
    description: '动态旋转的3D标签展示',
    icon: '🌐',
    animationClass: 'preview-tag-sphere'
  },
  {
    id: 'fluid',
    name: '流体动画',
    description: '动态流动的粒子效果',
    icon: '💫',
    animationClass: 'preview-fluid'
  },
  {
    id: 'radar',
    name: '高级雷达图',
    description: '多维数据分析与对比',
    icon: '📊',
    animationClass: 'preview-radar'
  },
  {
    id: 'geoBubble',
    name: '地理气泡图',
    description: '全球数据分布可视化',
    icon: '🌍',
    animationClass: 'preview-geo'
  },
  {
    id: 'network',
    name: '动态网络图',
    description: '关系网络动态展示',
    icon: '🕸️',
    animationClass: 'preview-network'
  },
  {
    id: 'waveform',
    name: '声波图',
    description: '动态波形数据展示',
    icon: '〰️',
    animationClass: 'preview-wave'
  }
];

const ChartSelector = ({ onSelect, currentType }) => {
  return (
    <div className="chart-selector">
      <h3 className="chart-selector-title">选择可视化类型</h3>
      <div className="chart-grid">
        {chartTypes.map(chart => (
          <div
            key={chart.id}
            className={`chart-option ${currentType === chart.id ? 'selected' : ''}`}
            onClick={() => onSelect(chart.id)}
          >
            <div className={`chart-preview ${chart.animationClass}`}>
              <span className="chart-icon">{chart.icon}</span>
              <div className="animation-container">
                <div className="animation-element"></div>
              </div>
            </div>
            <div className="chart-info">
              <h4>{chart.name}</h4>
              <p>{chart.description}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .chart-selector {
          padding: 20px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .chart-selector-title {
          font-size: 1.2em;
          font-weight: 600;
          margin-bottom: 16px;
          color: #333;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .chart-option {
          background: white;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .chart-option.selected {
          border-color: #4a90e2;
          background: rgba(74, 144, 226, 0.05);
        }

        .chart-preview {
          position: relative;
          height: 120px;
          background: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .chart-icon {
          font-size: 2em;
          position: absolute;
          z-index: 1;
          opacity: 0.2;
        }

        .animation-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-tag-sphere .animation-container {
          perspective: 800px;
        }

        .preview-tag-sphere .animation-element {
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #4a90e2, #61dafb);
          border-radius: 50%;
          animation: rotate3D 4s linear infinite;
        }

        .preview-fluid .animation-element {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #4a90e2, #61dafb);
          filter: blur(8px);
          animation: fluid 4s ease-in-out infinite;
        }

        .preview-radar .animation-element {
          width: 80px;
          height: 80px;
          border: 2px solid #4a90e2;
          border-radius: 50%;
          animation: radar 2s linear infinite;
        }

        .preview-geo .animation-element {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, #4a90e2 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .preview-network .animation-element {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, #4a90e2 2px, transparent 3px) 0 0 / 20px 20px;
          animation: network 3s linear infinite;
        }

        .preview-wave .animation-element {
          width: 100%;
          height: 2px;
          background: #4a90e2;
          position: relative;
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes rotate3D {
          0% { transform: rotate3d(1, 1, 1, 0deg); }
          100% { transform: rotate3d(1, 1, 1, 360deg); }
        }

        @keyframes fluid {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        }

        @keyframes radar {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes network {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-20px) translateY(-20px); }
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(3); }
        }

        .chart-info h4 {
          font-size: 1em;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #333;
        }

        .chart-info p {
          font-size: 0.9em;
          color: #666;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default ChartSelector; 