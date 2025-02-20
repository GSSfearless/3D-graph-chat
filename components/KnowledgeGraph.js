import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// 注册布局插件
cytoscape.use(cola);
cytoscape.use(popper);

const KnowledgeGraph = ({ data, onNodeClick, onEdgeClick, style = {} }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
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
        borderWidth: 3,
        boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
      },
      selected: {
        backgroundColor: '#F43F5E',
        borderColor: '#BE123C',
        borderWidth: 3,
        boxShadow: '0 0 15px rgba(244, 63, 94, 0.6)'
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
          selector: 'node:selected',
          style: {
            'background-color': theme.node.selected.backgroundColor,
            'border-color': theme.node.selected.borderColor,
            'border-width': theme.node.selected.borderWidth,
            'shadow-blur': '10px',
            'shadow-color': theme.node.selected.backgroundColor,
            'shadow-opacity': 0.6
          }
        },
        {
          selector: 'node:hover',
          style: {
            'background-color': theme.node.hover.backgroundColor,
            'border-color': theme.node.hover.borderColor,
            'border-width': theme.node.hover.borderWidth
          }
        },
        {
          selector: 'edge:hover',
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
        randomize: false
      },
      wheelSensitivity: 0.2
    });

    // 添加事件监听
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      onNodeClick && onNodeClick(node.data());
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
        }
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
    cyRef.current.layout({ name: 'cola' }).run();
    cyRef.current.fit(50);
  }, [data]);

  // 工具提示辅助函数
  const makeTippy = (node, options) => {
    const ref = node.popperRef();
    const dummyDomEle = document.createElement('div');
    const tip = tippy(dummyDomEle, {
      getReferenceClientRect: ref.getBoundingClientRect,
      trigger: 'manual',
      ...options
    });

    node.on('mouseover', () => tip.show());
    node.on('mouseout', () => tip.hide());

    return tip;
  };

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%', ...style }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {selectedNode && (
        <div className="node-details-panel">
          <h3>{selectedNode.label}</h3>
          <p>{selectedNode.description}</p>
        </div>
      )}
      <style jsx>{`
        .knowledge-graph-container {
          position: relative;
          background: var(--neutral-50);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        
        .node-details-panel {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 8px;
          box-shadow: var(--shadow-md);
          max-width: 300px;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph;