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
      .attr('height', '100%')
      .attr('class', 'chart-svg');
    
    this.mainGroup = this.svg.append('g');
    
    // 改进缩放行为
    this.zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        this.mainGroup.attr('transform', event.transform);
        // 更新节点大小
        this.updateNodesScale(event.transform.k);
      });
    
    // 添加平滑过渡
    this.svg.call(this.zoom)
      .call(this.zoom.transform, d3.zoomIdentity);
    
    // 添加defs
    this.defs = this.svg.append('defs');
    this.setupMarkers();
    
    // 添加加载动画
    this.setupLoadingAnimation();
    
    // 初始化事件处理
    this.setupEventHandlers();
    
    // 保存状态
    this.state = {
      isDragging: false,
      isAnimating: false,
      selectedNode: null,
      expandedNodes: new Set()
    };
  }

  // 设置事件处理
  setupEventHandlers() {
    // 双击节点展开/折叠
    this.svg.on('dblclick', (event) => {
      const target = event.target.closest('.node');
      if (target) {
        const data = d3.select(target).datum();
        this.toggleNode(data);
      }
    });

    // 单击节点选择
    this.svg.on('click', (event) => {
      const target = event.target.closest('.node');
      if (target) {
        const data = d3.select(target).datum();
        this.selectNode(data);
      } else {
        this.deselectNode();
      }
    });

    // 添加键盘快捷键
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.deselectNode();
      }
    });
  }

  // 设置加载动画
  setupLoadingAnimation() {
    this.loadingGroup = this.svg.append('g')
      .attr('class', 'loading-group')
      .style('display', 'none');
    
    const centerX = this.container.clientWidth / 2;
    const centerY = this.container.clientHeight / 2;
    
    this.loadingGroup.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 20)
      .attr('class', 'loading-circle');
  }

  // 显示加载动画
  showLoading() {
    this.loadingGroup.style('display', null);
  }

  // 隐藏加载动画
  hideLoading() {
    this.loadingGroup.style('display', 'none');
  }

  // 更新节点缩放
  updateNodesScale(scale) {
    this.mainGroup.selectAll('.node-bg')
      .attr('transform', `scale(${1/scale})`);
    
    this.mainGroup.selectAll('.node-text')
      .style('font-size', `${12/scale}px`);
  }

  // 选择节点
  selectNode(node) {
    if (this.state.selectedNode === node) return;
    
    // 取消之前的选择
    this.deselectNode();
    
    // 选择新节点
    this.state.selectedNode = node;
    const nodeElement = this.mainGroup.select(`#node-${node.id}`);
    
    nodeElement.classed('selected', true)
      .transition()
      .duration(200)
      .style('filter', 'drop-shadow(0 0 5px rgba(0,0,0,0.3))');
    
    // 触发选择事件
    this.onNodeSelect && this.onNodeSelect(node);
  }

  // 取消节点选择
  deselectNode() {
    if (!this.state.selectedNode) return;
    
    const nodeElement = this.mainGroup.select(`#node-${this.state.selectedNode.id}`);
    nodeElement.classed('selected', false)
      .transition()
      .duration(200)
      .style('filter', null);
    
    this.state.selectedNode = null;
    
    // 触发取消选择事件
    this.onNodeDeselect && this.onNodeDeselect();
  }

  // 切换节点展开/折叠状态
  toggleNode(node) {
    if (this.state.isAnimating) return;
    
    this.state.isAnimating = true;
    
    const isExpanded = this.state.expandedNodes.has(node.id);
    const duration = 500;
    
    if (isExpanded) {
      // 折叠节点
      this.state.expandedNodes.delete(node.id);
      this.collapseNode(node, duration);
    } else {
      // 展开节点
      this.state.expandedNodes.add(node.id);
      this.expandNode(node, duration);
    }
    
    // 更新展开/折叠图标
    this.updateToggleIcon(node);
  }

  // 展开节点
  expandNode(node, duration) {
    // 获取子节点
    const children = this.getNodeChildren(node);
    
    // 添加子节点（带动画）
    children.forEach((child, index) => {
      this.addNodeWithAnimation(child, node, index, duration);
    });
    
    // 动画结束后更新状态
    setTimeout(() => {
      this.state.isAnimating = false;
    }, duration);
  }

  // 折叠节点
  collapseNode(node, duration) {
    // 获取子节点
    const children = this.getNodeChildren(node);
    
    // 移除子节点（带动画）
    children.forEach(child => {
      this.removeNodeWithAnimation(child, duration);
    });
    
    // 动画结束后更新状态
    setTimeout(() => {
      this.state.isAnimating = false;
    }, duration);
  }

  // 添加节点动画
  addNodeWithAnimation(node, parent, index, duration) {
    const nodeGroup = this.mainGroup.append('g')
      .attr('class', 'node')
      .attr('id', `node-${node.id}`)
      .attr('transform', `translate(${parent.x},${parent.y})`)
      .style('opacity', 0);
    
    // 添加节点内容
    this.createNodeContent(nodeGroup, node);
    
    // 计算目标位置
    const targetX = node.x;
    const targetY = node.y;
    
    // 应用动画
    nodeGroup.transition()
      .duration(duration)
      .attr('transform', `translate(${targetX},${targetY})`)
      .style('opacity', 1);
  }

  // 移除节点动画
  removeNodeWithAnimation(node, duration) {
    const nodeGroup = this.mainGroup.select(`#node-${node.id}`);
    
    nodeGroup.transition()
      .duration(duration)
      .style('opacity', 0)
      .remove();
  }

  // 更新展开/折叠图标
  updateToggleIcon(node) {
    const isExpanded = this.state.expandedNodes.has(node.id);
    const toggleIcon = this.mainGroup.select(`#toggle-${node.id}`);
    
    toggleIcon.transition()
      .duration(200)
      .attr('transform', `rotate(${isExpanded ? 90 : 0})`);
  }

  // 获取节点子节点
  getNodeChildren(node) {
    // 实现获取子节点的逻辑
    return node.children || [];
  }

  // 创建节点内容
  createNodeContent(nodeGroup, node) {
    // 添加背景
    nodeGroup.append('rect')
      .attr('class', 'node-bg')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 120)
      .attr('height', 40)
      .attr('x', -60)
      .attr('y', -20);
    
    // 添加文本
    nodeGroup.append('text')
      .attr('class', 'node-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.32em')
      .text(node.name);
    
    // 如果有子节点，添加展开/折叠图标
    if (this.getNodeChildren(node).length > 0) {
      nodeGroup.append('path')
        .attr('id', `toggle-${node.id}`)
        .attr('class', 'toggle-icon')
        .attr('d', 'M-2,-4L2,0L-2,4')
        .attr('transform', 'translate(50,0)');
    }
  }

  // 设置箭头等标记
  setupMarkers() {
    // 添加箭头定义
    this.defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'arrow-head');
  }

  // 适应屏幕
  zoomToFit() {
    const bounds = this.mainGroup.node().getBBox();
    const parent = this.svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    
    const width = bounds.width;
    const height = bounds.height;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;
    
    if (width === 0 || height === 0) return;
    
    const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale)
      );
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
      .attr('ry', 5)
      .attr('x', -50)
      .attr('y', -15)
      .attr('width', 100)
      .attr('height', 30);
    
    // 添加节点文本
    nodeGroups.append('text')
      .attr('class', 'node-text')
      .attr('dy', '0.32em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.name);
    
    // 添加展开/折叠按钮
    nodeGroups.filter(d => d.children || d._children)
      .append('circle')
      .attr('class', 'node-toggle')
      .attr('r', 6)
      .attr('cx', 60)
      .on('click', this.toggleNode.bind(this));
  }

  renderFlowChart(data) {
    // 实现流程图渲染逻辑
    const dagLayout = d3.dagStratify()(data);
    const layout = d3.sugiyama()(dagLayout);
    
    // 清除现有内容
    this.mainGroup.selectAll('*').remove();
    
    // 绘制边
    this.mainGroup.selectAll('path')
      .data(layout.edges)
      .enter()
      .append('path')
      .attr('class', 'flow-edge')
      .attr('d', d3.line()
        .x(d => d.x)
        .y(d => d.y))
      .attr('marker-end', 'url(#arrow)');
    
    // 绘制节点
    const nodes = this.mainGroup.selectAll('g.node')
      .data(layout.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);
    
    nodes.append('rect')
      .attr('class', 'node-bg')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('x', -40)
      .attr('y', -20)
      .attr('width', 80)
      .attr('height', 40);
    
    nodes.append('text')
      .attr('class', 'node-text')
      .attr('dy', '0.32em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.label);
  }

  renderTimeline(data) {
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = this.container.clientWidth - margin.left - margin.right;
    const height = this.container.clientHeight - margin.top - margin.bottom;
    
    // 创建时间比例尺
    const timeScale = d3.scaleTime()
      .domain(d3.extent(data.events, d => d.date))
      .range([0, width]);
    
    // 清除现有内容
    this.mainGroup.selectAll('*').remove();
    
    // 绘制时间轴
    this.mainGroup.append('line')
      .attr('class', 'timeline-axis')
      .attr('x1', 0)
      .attr('y1', height / 2)
      .attr('x2', width)
      .attr('y2', height / 2);
    
    // 绘制事件
    const events = this.mainGroup.selectAll('g.event')
      .data(data.events)
      .enter()
      .append('g')
      .attr('class', 'event')
      .attr('transform', d => `translate(${timeScale(d.date)},${height/2})`);
    
    events.append('circle')
      .attr('class', 'event-point')
      .attr('r', 5);
    
    events.append('text')
      .attr('class', 'event-text')
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .text(d => d.title);
  }

  renderComparison(data) {
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = this.container.clientWidth - margin.left - margin.right;
    const height = this.container.clientHeight - margin.top - margin.bottom;
    
    // 创建比例尺
    const xScale = d3.scaleBand()
      .domain(data.items.map(d => d.name))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.items, d => d.value)])
      .range([height, 0]);
    
    // 清除现有内容
    this.mainGroup.selectAll('*').remove();
    
    // 绘制柱状图
    this.mainGroup.selectAll('rect')
      .data(data.items)
      .enter()
      .append('rect')
      .attr('class', 'comparison-bar')
      .attr('x', d => xScale(d.name))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.value));
    
    // 添加标签
    this.mainGroup.selectAll('text')
      .data(data.items)
      .enter()
      .append('text')
      .attr('class', 'comparison-label')
      .attr('x', d => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.value);
  }

  renderHierarchy(data) {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    const pack = d3.pack()
      .size([width, height])
      .padding(3);
    
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
    
    const nodes = pack(root).descendants();
    
    // 清除现有内容
    this.mainGroup.selectAll('*').remove();
    
    // 绘制圆形
    const circles = this.mainGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);
    
    circles.append('circle')
      .attr('class', 'hierarchy-circle')
      .attr('r', d => d.r);
    
    circles.append('text')
      .attr('class', 'hierarchy-text')
      .attr('dy', '0.32em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.name);
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
    
    // 应用箭头样式
    this.svg.selectAll('.arrow-head')
      .style('fill', theme.linkColor);
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