export class ChartProcessor {
  constructor() {
    this.processors = {
      mindmap: this.processMindMap,
      flowchart: this.processFlowChart,
      timeline: this.processTimeline,
      comparison: this.processComparison,
      hierarchy: this.processHierarchy
    };
  }

  // 处理原始数据
  process(rawData) {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      
      if (!data.type || !this.processors[data.type]) {
        throw new Error(`不支持的图表类型: ${data.type}`);
      }

      return {
        type: data.type,
        title: data.title || '未命名图表',
        description: data.description || '',
        data: this.processors[data.type](data.data),
        style: this.processStyle(data.style)
      };
    } catch (error) {
      console.error('数据处理错误:', error);
      return this.generateErrorChart(error);
    }
  }

  // 处理思维导图数据
  processMindMap(data) {
    return {
      nodes: this.processNodes(data.nodes || []),
      links: this.processLinks(data.links || []),
      layout: data.layout || 'horizontal'
    };
  }

  // 处理流程图数据
  processFlowChart(data) {
    return {
      nodes: this.processNodes(data.nodes || []),
      edges: this.processEdges(data.edges || []),
      groups: this.processGroups(data.groups || [])
    };
  }

  // 处理时间轴数据
  processTimeline(data) {
    return {
      events: this.processEvents(data.events || []),
      scale: data.scale || 'linear',
      orientation: data.orientation || 'horizontal'
    };
  }

  // 处理对比图数据
  processComparison(data) {
    return {
      items: this.processItems(data.items || []),
      aspects: data.aspects || [],
      layout: data.layout || 'vertical'
    };
  }

  // 处理层级图数据
  processHierarchy(data) {
    return {
      root: this.processHierarchyNode(data.root || {}),
      layout: data.layout || 'tree'
    };
  }

  // 处理节点数据
  processNodes(nodes) {
    return nodes.map(node => ({
      id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
      label: node.label || '',
      type: node.type || 'default',
      data: node.data || {},
      style: this.processNodeStyle(node.style)
    }));
  }

  // 处理连接数据
  processLinks(links) {
    return links.map(link => ({
      source: link.source,
      target: link.target,
      label: link.label || '',
      type: link.type || 'default',
      style: this.processLinkStyle(link.style)
    }));
  }

  // 处理边数据
  processEdges(edges) {
    return edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: edge.label || '',
      type: edge.type || 'default',
      style: this.processEdgeStyle(edge.style)
    }));
  }

  // 处理分组数据
  processGroups(groups) {
    return groups.map(group => ({
      id: group.id || `group-${Math.random().toString(36).substr(2, 9)}`,
      label: group.label || '',
      nodes: group.nodes || [],
      style: this.processGroupStyle(group.style)
    }));
  }

  // 处理事件数据
  processEvents(events) {
    return events.map(event => ({
      id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(event.date),
      title: event.title || '',
      description: event.description || '',
      type: event.type || 'default',
      style: this.processEventStyle(event.style)
    })).sort((a, b) => a.date - b.date);
  }

  // 处理对比项数据
  processItems(items) {
    return items.map(item => ({
      id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || '',
      values: item.values || {},
      style: this.processItemStyle(item.style)
    }));
  }

  // 处理层级节点数据
  processHierarchyNode(node) {
    return {
      id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
      name: node.name || '',
      value: node.value,
      children: (node.children || []).map(child => this.processHierarchyNode(child)),
      style: this.processNodeStyle(node.style)
    };
  }

  // 处理样式数据
  processStyle(style = {}) {
    return {
      theme: style.theme || 'light',
      layout: style.layout || 'auto',
      animation: style.animation !== false,
      fontSize: style.fontSize || '14px',
      fontFamily: style.fontFamily || 'Arial, sans-serif',
      lineHeight: style.lineHeight || 1.5,
      padding: style.padding || '20px',
      borderRadius: style.borderRadius || '4px',
      ...style
    };
  }

  // 处理节点样式
  processNodeStyle(style = {}) {
    return {
      fill: style.fill || '#ffffff',
      stroke: style.stroke || '#4a90e2',
      strokeWidth: style.strokeWidth || 1,
      radius: style.radius || 5,
      ...style
    };
  }

  // 处理连接线样式
  processLinkStyle(style = {}) {
    return {
      stroke: style.stroke || '#666666',
      strokeWidth: style.strokeWidth || 1,
      strokeDasharray: style.strokeDasharray || '',
      ...style
    };
  }

  // 处理边样式
  processEdgeStyle(style = {}) {
    return {
      stroke: style.stroke || '#666666',
      strokeWidth: style.strokeWidth || 1,
      arrow: style.arrow !== false,
      ...style
    };
  }

  // 处理分组样式
  processGroupStyle(style = {}) {
    return {
      fill: style.fill || 'rgba(0, 0, 0, 0.05)',
      stroke: style.stroke || '#999999',
      strokeWidth: style.strokeWidth || 1,
      ...style
    };
  }

  // 处理事件样式
  processEventStyle(style = {}) {
    return {
      color: style.color || '#333333',
      backgroundColor: style.backgroundColor || '#ffffff',
      borderColor: style.borderColor || '#4a90e2',
      ...style
    };
  }

  // 处理对比项样式
  processItemStyle(style = {}) {
    return {
      color: style.color || '#333333',
      backgroundColor: style.backgroundColor || '#ffffff',
      ...style
    };
  }

  // 生成错误图表
  generateErrorChart(error) {
    return {
      type: 'error',
      title: '数据处理错误',
      description: error.message,
      data: {
        message: error.message,
        stack: error.stack
      },
      style: {
        theme: 'light',
        layout: 'auto'
      }
    };
  }
} 