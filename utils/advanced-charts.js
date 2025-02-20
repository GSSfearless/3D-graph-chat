import * as d3 from 'd3';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import 'echarts-gl';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class AdvancedChartRenderer {
  constructor(container) {
    this.container = container;
    this.echartsInstance = echarts.init(container);
    this.setupThreeJS();
  }

  // 设置Three.js环境
  setupThreeJS() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  // 3D球形标签云
  render3DTagSphere(data) {
    const tags = data.tags.map(tag => ({
      name: tag.text,
      value: tag.size || 1,
      textStyle: {
        color: tag.color || '#333'
      }
    }));

    const option = {
      backgroundColor: 'transparent',
      series: [{
        type: 'graphGL',
        layout: 'force',
        symbolSize: 20,
        forcePrecision: 0.2,
        forceAtlas2: {
          steps: 1,
          stopThreshold: 1,
          jitterTolerence: 10,
          edgeWeight: [0.2, 1],
          gravity: 1,
          scaling: 1.2
        },
        itemStyle: {
          opacity: 0.8
        },
        nodes: tags.map((tag, idx) => ({
          name: tag.name,
          value: tag.value,
          symbolSize: Math.sqrt(tag.value) * 10,
          category: idx % 5
        })),
        categories: Array.from({ length: 5 }, (_, i) => ({ name: `类别${i + 1}` }))
      }]
    };

    this.echartsInstance.setOption(option);
  }

  // 动态流体图
  renderFluidChart(data) {
    const particles = [];
    const particleCount = 1000;
    
    // 创建粒子系统
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    // 生成粒子
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      const z = Math.random() * 100 - 50;
      particles.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.x += 0.001;
      points.rotation.y += 0.002;
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  // 高级雷达图
  renderAdvancedRadar(data) {
    const option = {
      backgroundColor: 'transparent',
      radar: {
        indicator: data.indicators,
        shape: 'circle',
        splitNumber: 5,
        axisName: {
          color: '#333',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: ['#ddd', '#ccc', '#bbb', '#aaa', '#999']
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
          }
        }
      },
      series: [{
        type: 'radar',
        lineStyle: {
          width: 2,
          opacity: 0.5
        },
        data: data.series.map(series => ({
          name: series.name,
          value: series.values,
          areaStyle: {
            opacity: 0.1
          },
          symbol: 'none'
        })),
        animationDuration: 2000
      }]
    };

    this.echartsInstance.setOption(option);
  }

  // 地理气泡图
  renderGeoBubble(data) {
    const option = {
      backgroundColor: 'transparent',
      geo: {
        map: 'world',
        roam: true,
        label: {
          show: false
        },
        itemStyle: {
          areaColor: '#323c48',
          borderColor: '#111'
        },
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#2a333d'
          }
        }
      },
      series: [{
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: data.points.map(point => ({
          name: point.name,
          value: [...point.coordinates, point.value],
          itemStyle: {
            color: point.color || '#f4e925'
          }
        })),
        symbolSize: val => Math.sqrt(val[2]) * 5,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true
          }
        }
      }]
    };

    this.echartsInstance.setOption(option);
  }

  // 动态网络图
  renderNetworkGraph(data) {
    const option = {
      backgroundColor: 'transparent',
      series: [{
        type: 'graphGL',
        nodes: data.nodes.map(node => ({
          name: node.name,
          value: node.value,
          symbolSize: node.size || 20,
          category: node.category
        })),
        edges: data.edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          value: edge.value
        })),
        categories: data.categories,
        layout: 'force',
        forceAtlas2: {
          steps: 5,
          stopThreshold: 20,
          jitterTolerence: 10,
          edgeWeight: [0.2, 1],
          gravity: 1,
          scaling: 1.2
        },
        itemStyle: {
          opacity: 0.8
        },
        lineStyle: {
          color: 'rgba(255,255,255,0.2)',
          width: 1
        },
        emphasis: {
          itemStyle: {
            opacity: 1
          },
          lineStyle: {
            opacity: 1
          }
        }
      }]
    };

    this.echartsInstance.setOption(option);
  }

  // 声波图
  renderWaveform(data) {
    const option = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        show: false
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          color: 'rgb(255, 70, 131)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgb(255, 158, 68)'
          }, {
            offset: 1,
            color: 'rgb(255, 70, 131)'
          }])
        },
        data: data.values
      }]
    };

    this.echartsInstance.setOption(option);
  }

  // 清理资源
  dispose() {
    this.echartsInstance.dispose();
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  // 调整大小
  resize() {
    this.echartsInstance.resize();
    if (this.renderer) {
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }
} 