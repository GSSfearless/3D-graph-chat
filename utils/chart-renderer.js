import * as d3 from 'd3';
import { select } from 'd3-selection';
import { hierarchy, tree } from 'd3-hierarchy';
import { linkHorizontal } from 'd3-shape';

export class ChartRenderer {
  constructor(container) {
    this.container = container;
    this.svg = select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
    
    this.mainGroup = this.svg.append('g');
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        this.mainGroup.attr('transform', event.transform);
      });
    
    this.svg.call(this.zoom);
  }

  renderMindMap(data) {
    const treeLayout = tree()
      .nodeSize([80, 200]);
    
    const root = hierarchy(data);
    const nodes = root.descendants();
    const links = root.links();
    
    // 清除现有内容
    this.mainGroup.selectAll('*').remove();
    
    // 绘制连接线
    this.mainGroup.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'mindmap-link')
      .attr('d', linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));
    
    // 创建节点组
    const nodeGroups = this.mainGroup.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);
    
    // 添加节点背景
    nodeGroups.append('rect')
      .attr('class', 'node-bg')
      .attr('rx', 5)
      .attr('ry', 5);
    
    // 添加节点文本
    nodeGroups.append('text')
      .text(d => d.data.name)
      .attr('class', 'node-text');
    
    // 添加展开/折叠按钮
    nodeGroups.filter(d => d.children || d._children)
      .append('circle')
      .attr('class', 'node-toggle')
      .attr('r', 6)
      .on('click', this.toggleNode);
  }

  renderFlowChart(data) {
    // 实现流程图渲染逻辑
    const dagLayout = d3.dagStratify()(data);
    // ... 流程图具体实现
  }

  renderTimeline(data) {
    // 实现时间轴渲染逻辑
    const timeScale = d3.scaleTime();
    // ... 时间轴具体实现
  }

  renderComparison(data) {
    // 实现对比图渲染逻辑
    const compareLayout = d3.scaleBand();
    // ... 对比图具体实现
  }

  renderHierarchy(data) {
    // 实现层级图渲染逻辑
    const packLayout = d3.pack();
    // ... 层级图具体实现
  }

  toggleNode(event, d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }

  update(source) {
    // 更新图表布局
    const duration = 750;
    const nodes = this.root.descendants();
    const links = this.root.links();

    // 更新节点位置
    const node = this.mainGroup.selectAll('g.node')
      .data(nodes, d => d.id);

    // 更新连接线
    const link = this.mainGroup.selectAll('path.link')
      .data(links, d => d.target.id);

    // 应用过渡动画
    node.transition()
      .duration(duration)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    link.transition()
      .duration(duration)
      .attr('d', this.diagonal);
  }

  applyTheme(theme) {
    // 应用主题样式
    this.svg.selectAll('.node-bg')
      .style('fill', theme.nodeBg)
      .style('stroke', theme.nodeBorder);

    this.svg.selectAll('.node-text')
      .style('fill', theme.textColor);

    this.svg.selectAll('.mindmap-link')
      .style('stroke', theme.linkColor);
  }

  exportToImage() {
    // 导出图表为图片
    const svgData = this.svg.node().outerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }
}

// 导出默认主题
export const defaultTheme = {
  nodeBg: '#ffffff',
  nodeBorder: '#4a90e2',
  textColor: '#333333',
  linkColor: '#666666',
  highlightColor: '#ff4081'
}; 