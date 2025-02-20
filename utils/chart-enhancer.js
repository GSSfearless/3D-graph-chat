// 图表增强器类
export class ChartEnhancer {
  constructor(chartContainer) {
    this.container = chartContainer;
    this.zoomLevel = 1;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  // 初始化交互功能
  init() {
    this.setupZoom();
    this.setupDrag();
    this.setupSearch();
    this.setupThemes();
    this.setupExport();
  }

  // 设置缩放功能
  setupZoom() {
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoomLevel *= delta;
      this.zoomLevel = Math.min(Math.max(0.5, this.zoomLevel), 2);
      this.container.style.transform = `scale(${this.zoomLevel})`;
    });
  }

  // 设置拖拽功能
  setupDrag() {
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.container.style.left = `${this.container.offsetLeft + dx}px`;
      this.container.style.top = `${this.container.offsetTop + dy}px`;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  // 设置搜索和高亮功能
  setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '搜索节点...';
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const nodes = this.container.querySelectorAll('.node');
      nodes.forEach(node => {
        const text = node.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          node.classList.add('highlight');
        } else {
          node.classList.remove('highlight');
        }
      });
    });
    this.container.parentNode.insertBefore(searchInput, this.container);
  }

  // 设置主题切换
  setupThemes() {
    const themes = {
      light: {
        background: '#ffffff',
        nodeColor: '#4a90e2',
        textColor: '#333333',
        lineColor: '#666666'
      },
      dark: {
        background: '#2d2d2d',
        nodeColor: '#61dafb',
        textColor: '#ffffff',
        lineColor: '#888888'
      },
      nature: {
        background: '#f0f7f4',
        nodeColor: '#68b587',
        textColor: '#2c4a3e',
        lineColor: '#5a9178'
      }
    };

    const themeSelector = document.createElement('select');
    Object.keys(themes).forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      themeSelector.appendChild(option);
    });

    themeSelector.addEventListener('change', (e) => {
      const theme = themes[e.target.value];
      Object.entries(theme).forEach(([property, value]) => {
        this.container.style.setProperty(`--${property}`, value);
      });
    });

    this.container.parentNode.insertBefore(themeSelector, this.container);
  }

  // 设置导出功能
  setupExport() {
    const exportButton = document.createElement('button');
    exportButton.textContent = '导出图表';
    exportButton.addEventListener('click', () => {
      html2canvas(this.container).then(canvas => {
        const link = document.createElement('a');
        link.download = 'chart.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    });
    this.container.parentNode.insertBefore(exportButton, this.container);
  }

  // 自动布局优化
  optimizeLayout() {
    const nodes = this.container.querySelectorAll('.node');
    const padding = 20;
    let maxX = 0;
    let maxY = 0;

    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    });

    this.container.style.width = `${maxX + padding}px`;
    this.container.style.height = `${maxY + padding}px`;
  }

  // 添加协作功能
  enableCollaboration(socket) {
    socket.on('chartUpdate', (data) => {
      this.updateChart(data);
    });

    this.container.addEventListener('change', (e) => {
      const changes = this.getChartChanges();
      socket.emit('chartChange', changes);
    });
  }

  // 更新图表
  updateChart(data) {
    // 实现图表更新逻辑
  }

  // 获取图表变更
  getChartChanges() {
    // 实现获取变更逻辑
    return {};
  }
}

// 导出样式
export const chartStyles = `
  .chart-container {
    position: relative;
    transform-origin: 0 0;
    transition: transform 0.1s;
  }

  .node {
    cursor: pointer;
    transition: all 0.3s;
  }

  .node:hover {
    filter: brightness(1.1);
  }

  .node.highlight {
    box-shadow: 0 0 10px #ffeb3b;
  }

  .chart-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
  }

  .chart-search {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .chart-theme-selector {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .chart-export-button {
    padding: 5px 10px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .chart-export-button:hover {
    background: #357abd;
  }
`; 