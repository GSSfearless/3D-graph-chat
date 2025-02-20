import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';

// 注册布局插件
cytoscape.use(cola);
cytoscape.use(popper);

const KnowledgeGraph = ({ data, onNodeClick, onEdgeClick, style = {} }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // 主题配置
  const theme = {
    node: {
      normal: {
        backgroundColor: '#6366F1',
        borderColor: '#4338CA',
        borderWidth: 2,
        labelColor: '#F8FAFC'
      },
      hover: {
        backgroundColor: '#818CF8',
        borderColor: '#4F46E5',
        borderWidth: 3
      },
      selected: {
        backgroundColor: '#F43F5E',
        borderColor: '#BE123C',
        borderWidth: 3
      }
    },
    edge: {
      normal: {
        lineColor: '#94A3B8',
        width: 2,
        opacity: 0.6
      },
      hover: {
        lineColor: '#64748B',
        width: 3,
        opacity: 0.8
      }
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(50);
      cyRef.current.center();
    }
  };

  const handleExport = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({
        full: true,
        scale: 2,
        quality: 1
      });
      const link = document.createElement('a');
      link.href = png;
      link.download = 'knowledge-graph.png';
      link.click();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化图实例
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': theme.node.normal.backgroundColor,
            'border-color': theme.node.normal.borderColor,
            'border-width': theme.node.normal.borderWidth,
            'label': 'data(label)',
            'color': theme.node.normal.labelColor,
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': theme.node.normal.backgroundColor,
            'text-outline-width': '2px',
            'transition-property': 'background-color, border-color, border-width, width, height',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': theme.edge.normal.width,
            'line-color': theme.edge.normal.lineColor,
            'opacity': theme.edge.normal.opacity,
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': '-10px',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': theme.edge.normal.lineColor,
            'arrow-scale': 0.8,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: ':selected',
          style: {
            'background-color': theme.node.selected.backgroundColor,
            'border-color': theme.node.selected.borderColor,
            'border-width': theme.node.selected.borderWidth,
            'box-shadow': '0 0 10px rgba(244, 63, 94, 0.6)'
          }
        },
        {
          selector: '.hover',
          style: {
            'background-color': theme.node.hover.backgroundColor,
            'border-color': theme.node.hover.borderColor,
            'border-width': theme.node.hover.borderWidth
          }
        },
        {
          selector: '.hover-edge',
          style: {
            'line-color': theme.edge.hover.lineColor,
            'width': theme.edge.hover.width,
            'opacity': theme.edge.hover.opacity,
            'target-arrow-color': theme.edge.hover.lineColor
          }
        }
      ],
      layout: {
        name: 'cola',
        animate: true,
        refresh: 1,
        maxSimulationTime: 4000,
        nodeSpacing: 30,
        edgeLength: 200,
        randomize: false,
        infinite: true
      },
      minZoom: 0.2,
      maxZoom: 3,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      selectionType: 'single',
      touchTapThreshold: 8,
      desktopTapThreshold: 4,
      autolock: false,
      autoungrabify: false,
      autounselectify: false
    });

    // 添加事件监听
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      onNodeClick && onNodeClick(node.data());
    });

    cyRef.current.on('mouseover', 'node', (evt) => {
      evt.target.addClass('hover');
    });

    cyRef.current.on('mouseout', 'node', (evt) => {
      evt.target.removeClass('hover');
    });

    cyRef.current.on('mouseover', 'edge', (evt) => {
      evt.target.addClass('hover-edge');
    });

    cyRef.current.on('mouseout', 'edge', (evt) => {
      evt.target.removeClass('hover-edge');
    });

    cyRef.current.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      onEdgeClick && onEdgeClick(edge.data());
    });

    // 添加工具提示
    cyRef.current.nodes().forEach(node => {
      makeTippy(node, {
        content: () => {
          const data = node.data();
          return `
            <div class="p-2">
              <h3 class="font-bold">${data.label}</h3>
              <p class="text-sm">${data.description || '暂无描述'}</p>
            </div>
          `;
        },
        placement: 'top',
        trigger: 'manual',
        hideOnClick: false,
        multiple: true,
        sticky: true
      });
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // 更新数据
  useEffect(() => {
    if (!cyRef.current || !data) return;

    cyRef.current.elements().remove();
    cyRef.current.add(data);
    
    // 使用 cola 布局
    const layout = cyRef.current.layout({
      name: 'cola',
      animate: true,
      refresh: 1,
      maxSimulationTime: 4000,
      nodeSpacing: 30,
      edgeLength: 200,
      randomize: false,
      infinite: true,
      flow: { axis: 'y', minSeparation: 50 }
    });
    
    layout.run();

    // 自动适应视图
    setTimeout(() => {
      cyRef.current.fit(50);
      cyRef.current.center();
    }, 500);
  }, [data]);

  // 工具提示辅助函数
  const makeTippy = (node, options) => {
    const ref = node.popperRef();
    const dummyDomEle = document.createElement('div');
    const tip = tippy(dummyDomEle, {
      getReferenceClientRect: ref.getBoundingClientRect,
      ...options
    });

    node.on('mouseover', () => tip.show());
    node.on('mouseout', () => tip.hide());

    return tip;
  };

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%', ...style }}>
      <div className="toolbar">
        <div className="toolbar-group">
          <button onClick={handleZoomIn} className="toolbar-button" title="放大">
            <FontAwesomeIcon icon={faSearch} className="mr-1" />+
          </button>
          <button onClick={handleZoomOut} className="toolbar-button" title="缩小">
            <FontAwesomeIcon icon={faSearch} className="mr-1" />-
          </button>
          <button onClick={handleFit} className="toolbar-button" title="适应屏幕">
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>
        <div className="toolbar-group">
          <button onClick={handleFullscreen} className="toolbar-button" title="全屏">
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>
          <button onClick={handleExport} className="toolbar-button" title="导出图片">
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" 
             className="toolbar-button discord-button" title="加入Discord">
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" 
             className="toolbar-button github-button" title="GitHub">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
      
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {selectedNode && (
        <div className="node-details-panel">
          <h3 className="text-lg font-semibold mb-2">{selectedNode.label}</h3>
          <p className="text-sm text-gray-600">{selectedNode.description || '暂无描述'}</p>
        </div>
      )}
      
      <style jsx>{`
        .knowledge-graph-container {
          position: relative;
          background: var(--neutral-50);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .toolbar {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .toolbar-group {
          display: flex;
          gap: 8px;
          padding: 0 8px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--neutral-600);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toolbar-button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--neutral-900);
        }

        .discord-button {
          color: #5865F2;
        }

        .discord-button:hover {
          background: rgba(88, 101, 242, 0.1);
          color: #4752C4;
        }

        .github-button {
          color: #24292e;
        }

        .github-button:hover {
          background: rgba(36, 41, 46, 0.1);
        }
        
        .node-details-panel {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-width: 300px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        :global(.cytoscape-container) {
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph;